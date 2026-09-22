import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });

    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRole) return { user: data.user };

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const trialExpired =
      subscription?.status === "trial" &&
      subscription.trial_ends_at &&
      new Date(subscription.trial_ends_at) < new Date();

    const hasAccess =
      subscription && ["trial", "ativo"].includes(subscription.status) && !trialExpired;

    if (!hasAccess) throw redirect({ to: "/checkout" });

    return { user: data.user };
  },
  component: () => <Outlet />,
});
