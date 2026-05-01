import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Terms of Service — CodeCritic',
  description: 'The terms and conditions governing your use of CodeCritic.',
}

const LAST_UPDATED = 'May 1, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-violet-400 mb-2">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10">
          <Section title="1. Acceptance of terms">
            <p>
              By accessing or using <strong>CodeCritic</strong> (&quot;the Platform&quot;, &quot;we&quot;,
              &quot;us&quot;, or &quot;our&quot;) at <strong>codecritic.dev</strong>, you agree to be bound
              by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do
              not use the Platform.
            </p>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the Platform after
              changes constitutes your acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years of age to use CodeCritic. By using the Platform, you represent
              that you are at least 13 years old and have the legal capacity to enter into these Terms.
            </p>
          </Section>

          <Section title="3. User accounts">
            <p>
              To access most features, you must create an account by authenticating with GitHub. You are
              responsible for:
            </p>
            <ul>
              <li>Maintaining the security of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and truthful information</li>
              <li>Notifying us immediately of any unauthorised use of your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </Section>

          <Section title="4. User content">
            <p>
              &quot;User Content&quot; means any content you submit to CodeCritic, including project
              descriptions, reviews, comments, and profile information. By submitting User Content, you:
            </p>
            <ul>
              <li>
                Grant CodeCritic a non-exclusive, worldwide, royalty-free licence to display, reproduce,
                and distribute your content on the Platform
              </li>
              <li>Represent that you own or have the right to submit the content</li>
              <li>Confirm the content does not violate any third-party rights</li>
            </ul>
            <p>
              You retain ownership of your User Content. We do not claim ownership of content you submit.
            </p>
          </Section>

          <Section title="5. Acceptable use">
            <p>You agree not to use CodeCritic to:</p>
            <ul>
              <li>Post content that is illegal, harmful, defamatory, or discriminatory</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Submit projects or reviews that are intentionally misleading or fraudulent</li>
              <li>Spam, scrape, or use automated tools to access the Platform without our permission</li>
              <li>Attempt to gain unauthorised access to any part of the Platform</li>
              <li>Upload malware or any malicious code</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate another person or entity</li>
            </ul>
          </Section>

          <Section title="6. Projects and reviews">
            <p>
              Projects submitted to CodeCritic must be your own work or work you have rights to share.
              Only repositories belonging to your authenticated GitHub account may be submitted.
            </p>
            <p>
              Reviews must be constructive and honest. Review manipulation (e.g. creating multiple accounts
              to review your own project) is strictly prohibited and may result in permanent account
              termination.
            </p>
            <p>
              We reserve the right to remove any project or review that violates these Terms or our
              community standards.
            </p>
          </Section>

          <Section title="7. Premium subscriptions">
            <p>
              CodeCritic offers optional premium features through paid subscriptions. By subscribing you
              agree to:
            </p>
            <ul>
              <li>Pay the applicable fees as described on our Pricing page</li>
              <li>Allow recurring charges to your chosen payment method</li>
              <li>Our refund policy: no refunds for partial billing periods</li>
            </ul>
            <p>
              Subscriptions automatically renew unless cancelled before the renewal date. You may cancel at
              any time from your account settings. Payment processing is handled by Stripe.
            </p>
          </Section>

          <Section title="8. Intellectual property">
            <p>
              The CodeCritic name, logo, design, and all Platform code are owned by CodeCritic and protected
              by intellectual property laws. You may not copy, modify, or distribute any part of the Platform
              without our express written permission.
            </p>
            <p>
              GitHub repository data accessed via OAuth is subject to{' '}
              <a
                href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:underline"
              >
                GitHub&apos;s Terms of Service
              </a>
              .
            </p>
          </Section>

          <Section title="9. Privacy">
            <p>
              Your use of CodeCritic is also governed by our{' '}
              <a href="/privacy" className="text-violet-400 hover:underline">
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference.
            </p>
          </Section>

          <Section title="10. Disclaimers">
            <p>
              CodeCritic is provided &quot;as is&quot; and &quot;as available&quot; without warranties of
              any kind, either express or implied. We do not warrant that:
            </p>
            <ul>
              <li>The Platform will be uninterrupted, error-free, or secure</li>
              <li>Reviews or feedback provided by users are accurate or reliable</li>
              <li>Any defects will be corrected</li>
            </ul>
            <p>
              User reviews represent the opinions of individual users and not the views of CodeCritic. We
              are not responsible for the accuracy of peer reviews.
            </p>
          </Section>

          <Section title="11. Limitation of liability">
            <p>
              To the maximum extent permitted by law, CodeCritic and its team shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use of the
              Platform, including but not limited to loss of data, loss of revenue, or damage to reputation.
            </p>
            <p>
              Our total liability to you for any claim arising from these Terms or your use of the Platform
              shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              You may delete your account at any time from your account settings. We may suspend or
              terminate your access to CodeCritic at any time, with or without cause, with or without
              notice.
            </p>
            <p>
              Upon termination, your right to use the Platform ceases immediately. Sections of these Terms
              that by their nature should survive termination will continue to apply.
            </p>
          </Section>

          <Section title="13. Governing law">
            <p>
              These Terms are governed by and construed in accordance with applicable law. Any disputes
              shall be subject to the exclusive jurisdiction of the competent courts.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              If you have questions about these Terms, please contact us:
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
