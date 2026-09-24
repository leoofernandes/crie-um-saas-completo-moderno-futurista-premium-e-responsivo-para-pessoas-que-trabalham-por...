import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EntityPage({ title, description, actionLabel, onAction, children, loading, error, empty, emptyTitle, emptyText, icon: Icon }: { title: string; description: string; actionLabel?: string; onAction?: () => void; children: ReactNode; loading?: boolean; error?: Error | null; empty?: boolean; emptyTitle?: string; emptyText?: string; icon: LucideIcon }) {
  return <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
    <div className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">Sua operação</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>{actionLabel && <Button onClick={onAction} className="ring-1 ring-inset ring-white/15 transition-all hover:brightness-110"><Plus />{actionLabel}</Button>}</div>
    {error ? <Alert variant="destructive" className="mt-7"><AlertCircle className="size-4" /><AlertTitle>Não foi possível carregar</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert> : loading ? <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-44 rounded-xl bg-surface/70" />)}</div> : empty ? <div className="mt-10 flex min-h-72 flex-col items-center justify-center border-y border-border text-center"><div className="grid size-12 place-items-center rounded-md bg-muted"><Icon className="size-5 text-muted-foreground" /></div><h2 className="mt-4 font-display text-lg font-semibold">{emptyTitle}</h2><p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyText}</p>{actionLabel && <Button className="mt-5" onClick={onAction}><Plus />{actionLabel}</Button>}</div> : <div className="mt-7">{children}</div>}
  </div>;
}
