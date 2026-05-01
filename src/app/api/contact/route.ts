import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { rateLimit } from '@/lib/rateLimit'
import { sanitizeString, isValidEmail } from '@/lib/validate'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  // --- IP-based rate limit: 3 messages per hour ---
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  const { allowed } = await rateLimit(`contact:${ip}`, 3, 60)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait before trying again.' },
      { status: 429 },
    )
  }

  const body = await req.json()

  // --- Honeypot: bots fill the hidden "website" field ---
  if (body.website) {
    // Silently accept so bots don't know they were detected
    return NextResponse.json({ ok: true })
  }

  // --- Sanitize & validate inputs ---
  const name = sanitizeString(body.name, 100).trim()
  const email = sanitizeString(body.email, 254).trim()
  const subject = sanitizeString(body.subject, 200).trim()
  const message = sanitizeString(body.message, 5000).trim()

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: 'Message is too short.' }, { status: 400 })
  }

  try {
    await transporter.sendMail({
      from: `CodeCritic Contact <${process.env.GMAIL_USER}>`,
      to: 'dibe.mtt@gmail.com',
      replyTo: `${name} <${email}>`,
      subject: subject ? `[CodeCritic] ${subject}` : `[CodeCritic] Message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090b;color:#fff;padding:32px;border-radius:16px;border:1px solid #27272a">
          <h2 style="margin:0 0 4px;font-size:18px;color:#fff">New message from CodeCritic</h2>
          <p style="color:#71717a;font-size:13px;margin:0 0 24px">Someone filled out the contact form.</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:8px 12px;background:#18181b;border-radius:8px 8px 0 0;border-bottom:1px solid #27272a;color:#a1a1aa;font-size:12px;width:80px">Name</td>
              <td style="padding:8px 12px;background:#18181b;border-radius:8px 8px 0 0;border-bottom:1px solid #27272a;color:#fff;font-size:14px">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#18181b;border-bottom:1px solid #27272a;color:#a1a1aa;font-size:12px">Email</td>
              <td style="padding:8px 12px;background:#18181b;border-bottom:1px solid #27272a;font-size:14px"><a href="mailto:${email}" style="color:#8b5cf6;text-decoration:none">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#18181b;border-radius:0 0 8px 8px;color:#a1a1aa;font-size:12px;vertical-align:top">Subject</td>
              <td style="padding:8px 12px;background:#18181b;border-radius:0 0 8px 8px;color:#fff;font-size:14px">${subject || '—'}</td>
            </tr>
          </table>

          <div style="background:#18181b;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="color:#a1a1aa;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Message</p>
            <p style="color:#e4e4e7;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${message}</p>
          </div>

          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your message')}"
             style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600;font-size:13px">
            Reply to ${name} →
          </a>

          <p style="color:#3f3f46;font-size:11px;margin-top:24px;margin-bottom:0">
            Sent via the CodeCritic contact form · IP: ${ip}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact email error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
