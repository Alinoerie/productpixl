"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowLeft, Calendar, Check, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEMO_BOOKING_STEPS,
  DEMO_DURATION_MINUTES,
  DEMO_PLATFORMS,
  DEMO_SKU_RANGES,
  DEMO_TIME_SLOTS,
  buildCalendlyPrefillUrl,
  getCalendlyUrl,
  getDemoExpert,
  getDemoExpertInitials,
  getUpcomingDemoDays,
} from "@/lib/demo-booking-content";
import { prefersReducedMotion } from "@/hooks/use-studio-gsap";
import { MKT_DURATION, MKT_EASE } from "@/lib/marketing-motion";

type Step = 1 | 2 | 3;

function ExpertCard() {
  const expert = getDemoExpert();
  const initials = getDemoExpertInitials(expert.name);

  return (
    <div className="flex items-center gap-4">
      {expert.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={expert.imageUrl}
          alt={expert.name}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--accent)]/20"
        />
      ) : (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--teal)] text-lg font-semibold text-white ring-2 ring-[var(--accent)]/20"
          aria-hidden
        >
          {initials || "Px"}
        </div>
      )}
      <div>
        <p className="font-semibold">{expert.name}</p>
        <p className="text-sm text-[var(--muted-fg)]">{expert.title}</p>
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--muted-fg)]">
      Step {step} of {DEMO_BOOKING_STEPS.length}
    </p>
  );
}

export function DemoBookingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [platform, setPlatform] = useState<string>(DEMO_PLATFORMS[0]);
  const [skuRange, setSkuRange] = useState<string>(DEMO_SKU_RANGES[1]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [preferredLabel, setPreferredLabel] = useState("");
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [emailConfigWarning, setEmailConfigWarning] = useState<string | null>(null);

  const days = useMemo(() => getUpcomingDemoDays(5), []);
  const calendlyUrl = getCalendlyUrl();
  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stepRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, x: step === 1 ? 0 : 24, y: 16, filter: "blur(6px)" },
        { opacity: 1, x: 0, y: 0, filter: "blur(0px)", duration: MKT_DURATION.card, ease: MKT_EASE.out }
      );
    }, el);
    return () => ctx.revert();
  }, [step]);

  const selectedDayMeta = days.find((d) => d.iso === selectedDay);

  function formatPreferredLabel(dayIso: string, time: string) {
    const day = days.find((d) => d.iso === dayIso);
    if (!day) return `${dayIso} ${time}`;
    const date = new Date(`${dayIso}T${time}:00`);
    return date.toLocaleString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function goToDetails() {
    if (!selectedDay || !selectedTime) {
      setError("Pick a day and time to continue.");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDay || !selectedTime) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName || !trimmedEmail.includes("@")) {
      setError("Enter your name and a valid work email.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/leads/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          company: company.trim() || undefined,
          platform,
          skuRange,
          notes: notes.trim() || undefined,
          preferredDate: selectedDay,
          preferredTime: selectedTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        preferredLabel?: string;
        emailSent?: boolean;
        emailConfigWarning?: string | null;
        calendlyUrl?: string | null;
      };
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Could not book demo. Try again.");
        return;
      }

      setPreferredLabel(data.preferredLabel ?? formatPreferredLabel(selectedDay, selectedTime));
      setEmailSent(Boolean(data.emailSent));
      setEmailConfigWarning(data.emailConfigWarning ?? null);
      setStep(3);

      if (calendlyUrl) {
        const url = buildCalendlyPrefillUrl(calendlyUrl, {
          name: trimmedName,
          email: trimmedEmail,
          date: selectedDay,
        });
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch {
      setStatus("error");
      setError("Network error — try again.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-lg)] md:p-8">
      <ExpertCard />

      <div ref={stepRef} key={step} className="mt-8">
      {step === 1 ? (
        <>
          <StepIndicator step={1} />
          <h1 className="mt-3 font-serif text-2xl md:text-3xl">Book your ProductPixl demo</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-fg)] md:text-base">
            I will show you how ProductPixl turns one product photo into research-backed gallery images and listing
            copy — before your SKU exists on Amazon or Bol.com.
          </p>
          <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
            Find growth opportunities before your competitors do.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1.5 text-sm">
            <Clock className="h-4 w-4 text-[var(--accent)]" />
            {DEMO_DURATION_MINUTES} min
          </div>

          <div className="mt-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Select a day</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((day) => {
                const active = selectedDay === day.iso;
                return (
                  <button
                    key={day.iso}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day.iso);
                      setSelectedTime(null);
                      setError(null);
                    }}
                    className={cn(
                      "flex min-w-[4.5rem] flex-col items-center rounded-2xl border px-3 py-3 text-center transition-colors",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    <span className="text-xs font-medium uppercase">{day.dayLabel}</span>
                    <span className="mt-1 text-2xl font-semibold leading-none">{day.dayNum}</span>
                    <span className="mt-1 text-[10px] text-[var(--muted-fg)]">{day.monthLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay ? (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-fg)]">Select a time</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {DEMO_TIME_SLOTS.map((time) => {
                  const active = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        setSelectedTime(time);
                        setError(null);
                      }}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)] hover:border-[var(--accent)]/40"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-4 text-sm text-[var(--error)]">
              {error}
            </p>
          ) : null}

          <Button type="button" size="lg" className="mt-8 w-full rounded-xl" onClick={goToDetails}>
            Book a demo
          </Button>
        </>
      ) : null}

      {step === 2 ? (
        <form onSubmit={(e) => void submitBooking(e)}>
          <button
            type="button"
            className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            onClick={() => setStep(1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <StepIndicator step={2} />
          <h2 className="mt-3 font-serif text-2xl">Your details</h2>
          {selectedDayMeta && selectedTime ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-fg)]">
              <Calendar className="h-4 w-4 shrink-0" />
              {formatPreferredLabel(selectedDayMeta.iso, selectedTime)} · {DEMO_DURATION_MINUTES} min
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="demo-name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="demo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <div>
              <label htmlFor="demo-email" className="text-sm font-medium">
                Work email
              </label>
              <input
                id="demo-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <div>
              <label htmlFor="demo-company" className="text-sm font-medium">
                Company / store
              </label>
              <input
                id="demo-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="demo-platform" className="text-sm font-medium">
                  Platform
                </label>
                <select
                  id="demo-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                >
                  {DEMO_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="demo-skus" className="text-sm font-medium">
                  Catalog size
                </label>
                <select
                  id="demo-skus"
                  value={skuRange}
                  onChange={(e) => setSkuRange(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                >
                  {DEMO_SKU_RANGES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="demo-notes" className="text-sm font-medium">
                Anything we should prepare? <span className="text-[var(--muted-fg)]">(optional)</span>
              </label>
              <textarea
                id="demo-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="e.g. 2,000 SKUs on Shopify, refreshing Q4 listings"
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-4 text-sm text-[var(--error)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="mt-8 w-full rounded-xl" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Booking…
              </>
            ) : (
              "Confirm demo"
            )}
          </Button>
        </form>
      ) : null}

      {step === 3 ? (
        <div className="text-center">
          <StepIndicator step={3} />
          <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-bg)]">
            <Check className="h-7 w-7 text-[var(--success)]" strokeWidth={2.5} />
          </div>
          <h2 className="mt-4 font-serif text-2xl">Demo request received</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--muted-fg)]">
            {preferredLabel ? (
              <>
                We saved your request for <strong className="text-[var(--foreground)]">{preferredLabel}</strong>.
                {emailSent
                  ? " Check your inbox for confirmation — it depends on a verified EMAIL_FROM domain in production."
                  : " Email confirmation is skipped until Resend is configured with a verified sender."}
              </>
            ) : (
              "We saved your request. Email confirmation depends on verified Resend delivery settings."
            )}
          </p>
          {emailConfigWarning ? (
            <p className="mx-auto mt-2 max-w-sm text-xs text-[var(--warning)]">{emailConfigWarning}</p>
          ) : null}
          {calendlyUrl ? (
            <p className="mt-2 text-xs text-[var(--muted-fg)]">
              A scheduling window opened in a new tab — pick the exact slot there if you prefer.
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-xl">
              <Link href="/login">Start free in studio</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/guides/ecommerce">Get the free guide pack</Link>
            </Button>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
