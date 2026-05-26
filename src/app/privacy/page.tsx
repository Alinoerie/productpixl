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
              ProductPixl (&quot;we&quot;, &quot;us&quot;) provides an AI listing studio for marketplace sellers. This policy
              explains what we collect when you use productpixl.vercel.app and related services, and how we use it.
            </p>
          </section>

          <section>
            <h2>Information we collect</h2>
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
                <strong className="text-[var(--foreground)]">Usage & billing</strong> — credit balance, purchase
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
            <h2>How we use your information</h2>
            <p>
              We use your data to authenticate you, run image and copy generation, store projects, process credit
              purchases, improve reliability, and respond to support requests. We do not sell your personal information.
            </p>
          </section>

          <section>
            <h2>Third-party processors</h2>
            <p>We rely on trusted providers to deliver the product, including:</p>
            <ul>
              <li>Hosting and infrastructure (Vercel)</li>
              <li>Database (Supabase / PostgreSQL)</li>
              <li>Authentication (Google OAuth, email delivery via Resend when enabled)</li>
              <li>Media storage (Cloudinary)</li>
              <li>AI inference (Replicate and related model providers)</li>
              <li>Background jobs (Inngest)</li>
              <li>Payments (Stripe, when checkout is enabled)</li>
            </ul>
            <p>
              These processors handle data only as needed to provide their service. Your uploaded images and prompts may
              be sent to AI providers to generate outputs you request.
            </p>
          </section>

          <section>
            <h2>Retention</h2>
            <p>
              We retain account and project data while your account is active. You may delete projects from the studio.
              Contact us to request account deletion.
            </p>
          </section>

          <section>
            <h2>Your rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, export, or delete personal data. EU/UK
              users may also object to certain processing or lodge a complaint with a supervisory authority.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about this policy:{" "}
              <Link href="mailto:support@productpixl.app" className="text-[var(--accent)] underline-offset-2 hover:underline">
                support@productpixl.app
              </Link>
            </p>
          </section>
        </div>
      </article>
    </MarketingPageShell>
  );
}
