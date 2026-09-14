import { cn } from "@/lib/utils";

export const BRAND_NAME = "movvia";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-surface-2",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <defs>
          <linearGradient id="movvia-mark" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="oklch(0.84 0.19 156)" />
            <stop offset="1" stopColor="oklch(0.7 0.16 246)" />
          </linearGradient>
        </defs>
        <path
          d="M3 17.5 8.5 5.5l3.5 8 3.5-8L21 17.5"
          fill="none"
          stroke="url(#movvia-mark)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-xl font-bold tracking-tight text-foreground">
          {BRAND_NAME}
          <span className="text-brand">.</span>
        </span>
      )}
    </span>
  );
}
