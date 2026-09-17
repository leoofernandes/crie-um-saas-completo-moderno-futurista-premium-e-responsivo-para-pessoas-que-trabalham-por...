import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .maybeSingle();
        setRole(profile?.role === "admin" ? "admin" : "user");
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next);
      if (!next?.user) {
        setRole(null);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", next.user.id)
        .maybeSingle();
      setRole(profile?.role === "admin" ? "admin" : "user");
      setLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, role, isAdmin: role === "admin", loading };
}
