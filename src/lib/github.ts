export function getStackBlitzEmbedUrl(githubUrl: string): string | null {
  // Matches: https://github.com/user/repo or https://github.com/user/repo/tree/branch
  const match = githubUrl.trim().match(/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)(\/tree\/[^?#\s]*)?/)
  if (!match) return null

  const repoPath = match[1].replace(/\.git$/, '')
  const branch = match[2] ?? ''

  return `https://stackblitz.com/github/${repoPath}${branch}?embed=1&theme=dark&view=both`
}
