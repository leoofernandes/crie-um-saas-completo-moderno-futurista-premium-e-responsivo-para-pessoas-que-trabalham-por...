import { cn } from "@/lib/utils";

const steps = ["Plano", "Conta", "Pagamento", "Pronto"];

export function Steps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => {
        const position = index + 1;
        const done = position < current;
        const active = position === current;
        return (
          <li key={step} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-brand/20 text-brand"
                    : "bg-surface-2 text-muted-foreground",
              )}
            >
              {position}
            </span>
            <span
              className={cn(
                "hidden truncate text-xs sm:block",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
