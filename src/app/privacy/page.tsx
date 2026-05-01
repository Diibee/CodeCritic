import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Privacy Policy — CodeCritic',
  description: 'How CodeCritic collects, uses, and protects your personal information.',
}

const LAST_UPDATED = 'May 1, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-violet-400 mb-2">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose-custom space-y-10">
          <Section title="1. Introduction">
            <p>
              Welcome to <strong>CodeCritic</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are
              committed to protecting your personal information and your right to privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our platform
              at <strong>codecritic.dev</strong>.
            </p>
            <p>
              Please read this policy carefully. If you disagree with its terms, please discontinue use of the
              platform.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <p>We collect information you provide directly when you:</p>
            <ul>
              <li>Create an account via GitHub OAuth (name, email address, avatar, GitHub username)</li>
              <li>Submit projects (title, description, GitHub repository URL, tech stack)</li>
              <li>Leave reviews or comments</li>
              <li>Update your profile settings</li>
              <li>Contact us by email</li>
            </ul>
            <p>
              We also collect certain information automatically, including your IP address, browser type,
              pages visited, and timestamps, for analytics and security purposes.
            </p>
          </Section>

          <Section title="3. How we use your information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain the CodeCritic platform</li>
              <li>Create and manage your account</li>
              <li>Display your public profile and submitted projects</li>
              <li>Send you notifications about reviews and activity on your projects</li>
              <li>Improve and personalise your experience</li>
              <li>Analyse usage patterns to improve the platform</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal data to third parties.
            </p>
          </Section>

          <Section title="4. Sharing of information">
            <p>
              We may share your information with third-party service providers that help us operate the
              platform, including:
            </p>
            <ul>
              <li><strong>Supabase</strong> — database and authentication hosting (EU region)</li>
              <li><strong>Vercel</strong> — application hosting and edge network</li>
              <li><strong>Stripe</strong> — payment processing for premium subscriptions</li>
              <li><strong>OpenAI / Anthropic</strong> — AI-powered code review features</li>
              <li><strong>GitHub</strong> — OAuth authentication and repository data</li>
            </ul>
            <p>
              Each provider is bound by their own privacy policy and data processing agreements. We only
              share the minimum information necessary.
            </p>
            <p>
              We may also disclose your information when required by law or to protect the rights, property,
              or safety of CodeCritic, our users, or others.
            </p>
          </Section>

          <Section title="5. Public data">
            <p>
              By default, project submissions and reviews you post on CodeCritic are <strong>public</strong>.
              This means they can be viewed by anyone, including visitors who are not logged in. You can mark
              your projects as private from your project settings.
            </p>
            <p>
              Your profile name and avatar (sourced from GitHub) are visible to other users. Your email
              address is <strong>never</strong> displayed publicly.
            </p>
          </Section>

          <Section title="6. Data retention">
            <p>
              We retain your personal information for as long as your account is active or as needed to
              provide services. You may request deletion of your account and associated data at any time by
              contacting us at{' '}
              <a href="mailto:dibe.mtt@gmail.com" className="text-violet-400 hover:underline">
                dibe.mtt@gmail.com
              </a>
              .
            </p>
            <p>
              Some data may be retained for up to 90 days in backups after deletion. Aggregate, anonymised
              analytics data may be retained indefinitely.
            </p>
          </Section>

          <Section title="7. Cookies and tracking">
            <p>
              We use cookies and similar technologies solely for authentication and session management. We do
              not use advertising or tracking cookies. You can configure your browser to refuse cookies, but
              this may affect platform functionality.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We implement industry-standard security measures including HTTPS encryption, row-level security
              in our database, and regular security reviews. However, no method of transmission over the
              Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="9. Children's privacy">
            <p>
              CodeCritic is not directed to individuals under the age of 13. We do not knowingly collect
              personal information from children under 13. If you become aware that a child has provided us
              with personal information, please contact us.
            </p>
          </Section>

          <Section title="10. Your rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:dibe.mtt@gmail.com" className="text-violet-400 hover:underline">
                dibe.mtt@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section title="11. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes
              by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of
              CodeCritic after changes become effective constitutes your acceptance of the revised policy.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <ul>
              <li>
                Email:{' '}
                <a href="mailto:dibe.mtt@gmail.com" className="text-violet-400 hover:underline">
                  dibe.mtt@gmail.com
                </a>
              </li>
              <li>
                Contact form:{' '}
                <a href="/contact" className="text-violet-400 hover:underline">
                  codecritic.dev/contact
                </a>
              </li>
            </ul>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-zinc-800">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-zinc-400 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-zinc-200 [&_a]:text-violet-400">
        {children}
      </div>
    </section>
  )
}
