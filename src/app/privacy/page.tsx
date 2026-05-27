import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy — ProductPixl",
  description: "How ProductPixl collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Legal</p>
        <h1 className="mt-3 font-serif text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-[var(--muted-fg)]">Last updated: May 26, 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-[var(--foreground)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:leading-relaxed [&_p]:text-[var(--muted-fg)] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-[var(--muted-fg)]">
          <section>
            <h2>Overview</h2>
            <p>
              ProductPixl (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an AI listing studio for marketplace sellers. This policy explains
              what data we collect, how we use it, who we share it with, how long we retain it, and your rights
              under the General Data Protection Regulation (EU) 2016/679 (&quot;GDPR&quot;) and applicable national data
              protection laws.
            </p>
          </section>

          <section>
            <h2>Data Controller</h2>
            <p>
              ProductPixl is the data controller for all personal data processed in connection with our service.
              If you are located in the European Economic Area (&quot;EEA&quot;), United Kingdom, or Switzerland, our
              designated representative under Article 27 GDPR is:
            </p>
            <ul>
              <li><strong>Entity:</strong> ProductPixl Ltd.</li>
              <li><strong>Contact:</strong> <Link href="mailto:dpo@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">dpo@productpixl.app</Link></li>
              <li><strong>Address:</strong> ProductPixl Ltd., [Registered Address], [City], [Country]</li>
            </ul>
          </section>

          <section>
            <h2>Data We Collect</h2>
            <ul>
              <li>
                <strong className="text-[var(--foreground)]">Account data</strong> — email address, name, and profile
                image when you sign in with Google or email magic link.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Product content</strong> — photos you upload, product
                details you enter, generated images, listing copy, and brand profile settings.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Usage &amp; billing</strong> — credit balance, purchase
                history, and basic logs needed to operate the service.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Guide downloads</strong> — email address when you
                request the free ecommerce guide pack, used to send the resource and occasional ProductPixl updates.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Demo bookings</strong> — name, email, company, catalog
                details, and preferred time when you book a ProductPixl demo.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Technical data</strong> — IP address, browser type, and
                cookies required for authentication and security.
              </li>
            </ul>
          </section>

          <section>
            <h2>Legal Basis for Processing (GDPR)</h2>
            <p>We process personal data on the following legal bases:</p>
            <ul>
              <li>
                <strong className="text-[var(--foreground)]">Contract (Article 6(1)(b))</strong> — processing necessary
                to perform our contract with you: authenticating your account, generating listings, processing payments.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Legitimate interests (Article 6(1)(f))</strong> — improving
                reliability, security, and service operation, unless overridden by your rights.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Consent (Article 6(1)(a))</strong> — marketing communications
                and optional analytics. You may withdraw consent at any time.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Legal obligation (Article 6(1)(c))</strong> — retaining
                data as required by applicable law.
              </li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Data Processors</h2>
            <p>
              We engage the following processors under GDPR Article 28 Data Processing Agreements. Each processor
              handles data only as necessary to deliver their specific service to us:
            </p>
            <ul>
              <li>
                <strong className="text-[var(--foreground)]">Stripe</strong> — payment processing. Their privacy policy:
                <Link href="https://stripe.com/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline ml-1">stripe.com/privacy</Link>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Vercel</strong> — hosting and cloud infrastructure.
                <Link href="https://vercel.com/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline ml-1">vercel.com/privacy</Link>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Prisma</strong> — database ORM (data stored in our PostgreSQL database).
                <Link href="https://www.prisma.io/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline ml-1">prisma.io/privacy</Link>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Replicate</strong> — AI inference for image and copy generation.
                <Link href="https://replicate.com/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline ml-1">replicate.com/privacy</Link>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Cloudinary</strong> — image and media storage and transformation.
                <Link href="https://cloudinary.com/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline ml-1">cloudinary.com/privacy</Link>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Tavily</strong> — AI-powered web research for product listings.
                <Link href="https://tavily.com/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline ml-1">tavily.com/privacy</Link>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Google OAuth</strong> — sign-in authentication.
                <Link href="https://policies.google.com/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline ml-1">policies.google.com/privacy</Link>
              </li>
            </ul>
            <p>
              Your uploaded product images and prompts are transmitted to Replicate (and, where Tavily web research
              is used, to Tavily) solely to generate the outputs you request. We do not sell or share personal
              data with any processor for their own independent purposes.
            </p>
          </section>

          <section>
            <h2>Data Processing Agreements (DPA)</h2>
            <p>
              Where required by GDPR Article 28, we maintain signed Data Processing Agreements with all third-party
              processors. If you are a data subject exercising rights against a processor directly, please notify
              us and we will facilitate the request.
            </p>
            <p>
              All processors used by ProductPixl are either located in the EEA or have been verified as providing
              adequate safeguards under GDPR Chapter V through standard contractual clauses or equivalent mechanisms.
            </p>
          </section>

          <section>
            <h2>International Transfers</h2>
            <p>
              If you are located outside the EEA, data is processed in the United States. Where processors are
              located outside the EEA, transfers are governed by Standard Contractual Clauses (SCCs) as approved
              by the European Commission, or other appropriate safeguards under GDPR Article 46.
            </p>
          </section>

          <section>
            <h2>Retention Periods</h2>
            <p>We retain personal data for no longer than necessary for the purposes for which it was collected:</p>
            <ul>
              <li>
                <strong className="text-[var(--foreground)]">Account data</strong> — retained for <strong>2 years</strong> after
                account closure or last active login. After this period, data is deleted or anonymised, unless
                retention is required by law.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Service logs (IP addresses, access logs)</strong> — retained
                for <strong>1 year</strong> from the date of collection for security and reliability purposes.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Product content (images, listings, copy)</strong> — retained
                until you delete them or close your account. Deletion is processed within 30 days.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Billing and payment records</strong> — retained for
                <strong>7 years</strong> as required by financial and tax regulations.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Marketing contacts (guide downloads, demo bookings)</strong> —
                retained until you withdraw consent or unsubscribe, and for up to 2 years thereafter.
              </li>
            </ul>
          </section>

          <section>
            <h2>Cookie Categories</h2>
            <p>We use the following categories of cookies:</p>
            <ul>
              <li>
                <strong className="text-[var(--foreground)]">Strictly Necessary</strong> — authentication (session cookies,
                JWT refresh tokens), security (CSRF tokens, rate-limit markers). These cannot be disabled without
                rendering the service non-functional.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Functional</strong> — remembering your preferences (e.g.
                marketplace, UI state), draft auto-save.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Analytics</strong> — anonymised, aggregate usage data to
                understand how users navigate the studio (e.g., which steps in the wizard are most common). These
                cookies do not track individual users.
              </li>
            </ul>
            <p>
              You can manage cookie preferences through your browser settings. Disabling functional or analytics
              cookies will not prevent you from using the core service.
            </p>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul>
              <li><strong>Access</strong> — receive a copy of your personal data</li>
              <li><strong>Rectification</strong> — correct inaccurate or incomplete data</li>
              <li><strong>Erasure</strong> — request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Restriction</strong> — restrict our processing of your data</li>
              <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Object</strong> — object to processing based on legitimate interests</li>
              <li><strong>Withdraw consent</strong> — at any time, for processing based on consent</li>
              <li><strong>Lodge a complaint</strong> — with your national data protection authority (e.g., the ICO in the UK,
                the CNIL in France, the BfDI in Germany)</li>
            </ul>
            <p>
              To exercise any rights, email <Link href="mailto:support@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">support@productpixl.app</Link> or{" "}
              <Link href="mailto:dpo@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">dpo@productpixl.app</Link>.
              We respond to all requests within 30 days as required by GDPR Article 12.
            </p>
          </section>

          <section>
            <h2>Data Protection Officer (DPO)</h2>
            <p>
              Our Data Protection Officer can be reached at{" "}
              <Link href="mailto:dpo@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">
                dpo@productpixl.app
              </Link>
              . While we are not yet legally required to appoint a DPO under Article 37, we have voluntarily
              designated one to ensure the highest standard of data protection compliance.
            </p>
          </section>

          <section>
            <h2>Security</h2>
            <p>
              We implement appropriate technical and organisational security measures to protect personal data
              against unauthorised access, alteration, disclosure, or destruction, including TLS encryption in
              transit, encrypted storage at rest, access controls, and regular security reviews.
            </p>
          </section>

          <section>
            <h2>Children&apos;s Privacy</h2>
            <p>
              Our service is not directed to persons under 16 (or the applicable age of digital consent in
              your jurisdiction). We do not knowingly collect personal data from children. If you believe
              a child&apos;s data has been collected, contact us immediately.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We will notify users of material changes to this policy via email or a prominent notice on the
              service. Material changes take effect 30 days after notification.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about this policy or data protection matters:{" "}
              <Link href="mailto:support@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">
                support@productpixl.app
              </Link>{" "}
              or{" "}
              <Link href="mailto:dpo@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">
                dpo@productpixl.app
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </MarketingPageShell>
  );
}
