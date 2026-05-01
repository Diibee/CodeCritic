'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import { checkAndGrantAchievements } from './achievements'
import { isPremium } from '@/lib/subscription'
import { isStaff } from '@/lib/staff'

const EXCLUDED = new Set(['node_modules', 'dist', '.next', 'build', 'out', '.git', 'coverage', '.turbo'])
const ALLOWED_EXT = new Set(['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rs', 'css', 'html', 'json', 'md'])
const MAX_FILES = 12
const MAX_FILE_CHARS = 2500

function isAllowed(path: string): boolean {
  const parts = path.split('/')
  if (parts.some((p) => EXCLUDED.has(p))) return false
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_EXT.has(ext)
}

type AIReviewResult = { ok: true } | { error: string }

export async function generateAIReview(projectId: string): Promise<AIReviewResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'UNAUTHORIZED' }

    const premium = await isPremium(user.id)
    if (!premium) return { error: 'PREMIUM_REQUIRED' }

    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id, title, description, tech_stack, github_url, ai_review, ai_review_at')
      .eq('id', projectId)
      .single()

    if (!project) return { error: 'Project not found.' }
    if (project.user_id !== user.id) return { error: 'UNAUTHORIZED' }

    // Cooldown: max one generation per 24 hours (bypassed for staff)
    const userIsStaff = await isStaff(user.id)
    if (!userIsStaff && project.ai_review && project.ai_review_at) {
      const hoursSince = (Date.now() - new Date(project.ai_review_at).getTime()) / 1000 / 60 / 60
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince)
        return { error: `COOLDOWN:${hoursLeft}` }
      }
    }

    const githubUrl = project.github_url
    if (!githubUrl) return { error: 'This project has no GitHub URL.' }

    const match = githubUrl.trim().match(
      /github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?(\/tree\/([^?#\s]+))?([?#]|$)/,
    )
    if (!match) return { error: 'Invalid GitHub URL on this project.' }

    const owner = match[1]
    const repo = match[2]
    const branch = match[4] ?? 'HEAD'

    const ghHeaders: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (process.env.GITHUB_TOKEN) ghHeaders['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: ghHeaders },
    )

    if (treeRes.status === 404) return { error: 'Repository not found or is private.' }
    if (treeRes.status === 403) return { error: 'GitHub API rate limit exceeded. Try again later.' }
    if (!treeRes.ok) return { error: `GitHub error (${treeRes.status}). Try again later.` }

    const tree = await treeRes.json() as {
      tree: Array<{ path: string; type: string; size?: number; url: string }>
    }

    const blobs = tree.tree
      .filter((item) => item.type === 'blob' && isAllowed(item.path) && (item.size ?? 0) < 60_000)
      .sort((a, b) => a.path.split('/').length - b.path.split('/').length)
      .slice(0, MAX_FILES)

    if (blobs.length === 0) return { error: 'No readable source files found in this repository.' }

    const files: Array<{ path: string; content: string }> = []
    await Promise.all(
      blobs.map(async (item) => {
        const res = await fetch(item.url, { headers: ghHeaders })
        if (!res.ok) return
        const data = await res.json() as { content?: string; encoding?: string }
        if (data.encoding === 'base64' && data.content) {
          const content = Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
          files.push({ path: item.path, content: content.slice(0, MAX_FILE_CHARS) })
        }
      }),
    )

    const fileContext = files
      .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
      .join('\n\n')

    const prompt = `You are an expert code reviewer. Analyze this GitHub repository and provide a detailed, constructive review.

Project: ${project.title}
Description: ${project.description ?? 'N/A'}
Tech stack: ${(project.tech_stack ?? []).join(', ')}

## Repository Files

${fileContext}

## Instructions

Write a structured code review in markdown. Use these exact sections:

### Overall Assessment
2-3 sentences summarizing quality and maturity.

### Strengths
3-5 bullet points on what the developer did well.

### Areas for Improvement
3-5 bullet points with specific issues to address.

### Architecture & Structure
Brief assessment of code organization and design patterns.

### Security Considerations
Security issues or best practices to adopt (or confirm if none found).

### Top 3 Action Items
The most impactful improvements, numbered and specific.

Be constructive, specific, and reference actual code you see.`

    if (!process.env.GROQ_API_KEY) return { error: 'AI service not configured (missing API key).' }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.3,
    })

    const review = completion.choices[0]?.message?.content
    if (!review) return { error: 'AI returned an empty response. Please try again.' }

    await supabase
      .from('projects')
      .update({ ai_review: review, ai_review_at: new Date().toISOString() })
      .eq('id', projectId)

    await checkAndGrantAchievements(user.id)
    revalidatePath(`/projects/${projectId}`)

    return { ok: true }
  } catch (err) {
    console.error('[generateAIReview]', err)
    return { error: 'Unexpected error. Please try again.' }
  }
}
