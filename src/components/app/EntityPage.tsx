import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EntityPage({ title, description, actionLabel, onAction, children, loading, error, empty, emptyTitle, emptyText, icon: Icon }: { title: string; description: string; actionLabel?: string; onAction?: () => void; children: ReactNode; loading?: boolean; error?: Error | null; empty?: boolean; emptyTitle?: string; emptyText?: string; icon: LucideIcon }) {
  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-brand">Sua operação</p><h1 className="mt-1 font-display text-3xl font-bold">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{actionLabel && <Button onClick={onAction}><Plus />{actionLabel}</Button>}</div>
    {error ? <Alert variant="destructive" className="mt-6"><AlertCircle className="size-4" /><AlertTitle>Não foi possível carregar</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert> : loading ? <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-md" />)}</div> : empty ? <div className="mt-8 flex min-h-72 flex-col items-center justify-center border-y border-border text-center"><div className="grid size-12 place-items-center rounded-md bg-muted"><Icon className="size-5 text-muted-foreground" /></div><h2 className="mt-4 font-display text-lg font-semibold">{emptyTitle}</h2><p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyText}</p>{actionLabel && <Button className="mt-5" onClick={onAction}><Plus />{actionLabel}</Button>}</div> : <div className="mt-7">{children}</div>}
  </div>;
}
