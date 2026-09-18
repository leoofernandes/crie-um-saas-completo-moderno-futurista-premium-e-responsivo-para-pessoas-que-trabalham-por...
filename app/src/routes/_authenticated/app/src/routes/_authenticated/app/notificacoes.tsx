import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { notificationsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/notificacoes")({ component: NotificationsPage });

function NotificationsPage() {
  const q = useQuery(notificationsQuery), client = useQueryClient();
  const mark = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    client.invalidateQueries({ queryKey: ["notifications"] });
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Notificações</h1>
      {q.isLoading ? <p className="mt-8 text-muted-foreground">Carregando...</p>
        : q.isError ? <p className="mt-8 text-destructive">Não foi possível carregar as notificações.</p>
        : !q.data?.length ? <div className="mt-8 rounded-md border border-dashed border-border p-10 text-center"><Bell className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-muted-foreground">Você não tem notificações.</p></div>
        : <div className="mt-6 divide-y divide-border rounded-md border border-border">{q.data.map((n) => <div className={`p-4 ${n.read_at ? "opacity-60" : "bg-surface"}`} key={n.id}><div className="flex justify-between gap-4"><div><p className="font-medium">{n.title}</p>{n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}</div>{!n.read_at && <button className="text-sm text-brand hover:underline" onClick={() => mark(n.id)}>Marcar como lida</button>}</div></div>)}</div>}
    </div>
  );
}
