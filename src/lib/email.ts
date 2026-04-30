import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendReviewNotification({
  ownerEmail,
  ownerName,
  projectTitle,
  projectId,
  reviewerName,
}: {
  ownerEmail: string
  ownerName: string
  projectTitle: string
  projectId: string
  reviewerName: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://codecritic.vercel.app'

  await transporter.sendMail({
    from: `CodeCritic <${process.env.GMAIL_USER}>`,
    to: ownerEmail,
    subject: `New review on "${projectTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#09090b;color:#fff;padding:32px;border-radius:16px">
        <h2 style="margin:0 0 8px;font-size:20px">New review on <span style="color:#8b5cf6">${projectTitle}</span></h2>
        <p style="color:#a1a1aa;margin:0 0 24px">${reviewerName} just left a review on your project.</p>
        <a href="${appUrl}/projects/${projectId}"
           style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">
          View review →
        </a>
        <p style="color:#52525b;font-size:12px;margin-top:24px">You're receiving this because you're a CodeCritic Premium member.</p>
      </div>
    `,
  })
}
