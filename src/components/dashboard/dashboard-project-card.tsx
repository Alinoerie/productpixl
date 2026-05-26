"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPipelinePhase, formatProductStatus, statusBadgeClass } from "@/lib/status-labels";

type Thumb = { id: string; imageUrl: string | null };

export function DashboardProjectCard({
  id,
  name,
  status: initialStatus,
  createdAt,
  hasCopy,
  thumbs: initialThumbs,
}: {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  hasCopy: boolean;
  thumbs: Thumb[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [phase, setPhase] = useState<string | null>(null);
  const isProcessing = status === "PROCESSING";

  useEffect(() => {
    if (status !== "PROCESSING") return;

    let active = true;
    const poll = async () => {
      const res = await fetch(`/api/products/${id}/status`);
      const data = await res.json();
      if (!active || !res.ok) return;

      const ps = data.pipelineStatus as { phase?: string } | null;
      setPhase(ps?.phase ?? data.status);
      setStatus(data.status);

      if (data.status === "COMPLETE" || data.status === "FAILED") {
        router.refresh();
      }
    };

    poll();
    const timer = window.setInterval(poll, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [id, status, router]);

  const thumbs = initialThumbs;

  return (
    <Card className="overflow-hidden transition-all hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)]">
      <Link href={`/products/${id}`} className="group block">
        <div className="relative aspect-[4/3] bg-[var(--muted)]">
          {thumbs.length > 1 ? (
            <div className="grid h-full grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
              {thumbs.map((a) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.id} src={a.imageUrl!} alt="" className="h-full w-full object-cover" />
              ))}
            </div>
          ) : thumbs.length === 1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbs[0].imageUrl!}
              alt={`${name} preview`}
              className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
                  <span className="text-sm text-[var(--muted-fg)]">
                    {phase ? formatPipelinePhase(phase) : formatProductStatus(status)}
                  </span>
                </>
              ) : (
                <span className="text-sm text-[var(--muted-fg)]">{formatProductStatus(status)}</span>
              )}
            </div>
          )}
          <Badge
            variant="secondary"
            className={`absolute left-3 top-3 backdrop-blur-sm ${statusBadgeClass(status)}`}
          >
            {formatProductStatus(status)}
          </Badge>
          {isProcessing && thumbs.length > 0 && phase ? (
            <span className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/55 px-2 py-1 text-center text-xs text-white backdrop-blur-sm">
              {formatPipelinePhase(phase)}
            </span>
          ) : null}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${id}`} className="group/title block">
          <p className="font-semibold leading-snug group-hover/title:text-[var(--accent)]">{name}</p>
          <p className="mt-1 text-xs text-[var(--muted-fg)]">
            {new Date(createdAt).toLocaleDateString()}
            {hasCopy ? " · Copy ready" : ""}
          </p>
        </Link>
        {status === "FAILED" ? (
          <Button asChild size="sm" variant="outline" className="mt-3 w-full">
            <Link href={`/generate?productId=${id}`}>Retry in Image studio</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
