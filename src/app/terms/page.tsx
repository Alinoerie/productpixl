import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/marketing-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service — ProductPixl",
  description: "Terms governing use of the ProductPixl listing studio.",
};

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Legal</p>
        <h1 className="mt-3 font-serif text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-[var(--muted-fg)]">Last updated: May 26, 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-[var(--foreground)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_p]:leading-relaxed [&_p]:text-[var(--muted-fg)] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-[var(--muted-fg)]">
          <section>
            <h2>Agreement</h2>
            <p>
              By accessing ProductPixl, you agree to these Terms. If you do not agree, do not use the service. We may
              update these Terms; continued use after changes means you accept the revised Terms.
            </p>
          </section>

          <section>
            <h2>Service description</h2>
            <p>
              ProductPixl helps sellers create marketplace listing images and copy using AI. Outputs are assistive —
              you are responsible for reviewing accuracy, compliance, and suitability before publishing on Amazon or
              other marketplaces.
            </p>
          </section>

          <section>
            <h2>Accounts & credits</h2>
            <ul>
              <li>You must provide accurate account information and keep credentials secure.</li>
              <li>New accounts may receive promotional free credits. Paid credits are consumed per generation as shown before you confirm a run.</li>
              <li>Except where required by law, purchased credits are non-refundable once used or after a stated refund window.</li>
              <li>We may suspend accounts for abuse, fraud, or violation of these Terms.</li>
            </ul>
          </section>

          <section>
            <h2>Your content</h2>
            <p>
              You retain ownership of photos and text you upload. You grant us a limited license to host, process, and
              transmit that content to provide generation, storage, and export features. You represent that you have
              rights to use uploaded materials and that generated listings you publish comply with applicable marketplace
              rules.
            </p>
          </section>

          <section>
            <h2>Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Upload unlawful, infringing, or misleading content</li>
              <li>Attempt to bypass credit limits or security controls</li>
              <li>Reverse engineer or scrape the service at scale without permission</li>
              <li>Use the service to generate spam or deceptive listings</li>
            </ul>
          </section>

          <section>
            <h2>Disclaimers</h2>
            <p>
              The service is provided &quot;as is&quot;. AI outputs may contain errors. We do not guarantee ranking,
              conversion, or marketplace approval. To the maximum extent permitted by law, we disclaim implied warranties
              of merchantability and fitness for a particular purpose.
            </p>
          </section>

          <section>
            <h2>Limitation of liability</h2>
            <p>
              Our total liability for any claim arising from the service is limited to the amount you paid us in the
              twelve months before the claim, or €100 if greater protection is not required by applicable law.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Legal or billing questions:{" "}
              <Link href="mailto:support@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">
                support@productpixl.app
              </Link>
              . See also our{" "}
              <Link href="/privacy" className="text-[var(--accent)] underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </MarketingPageShell>
  );
}
