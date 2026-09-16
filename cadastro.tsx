import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { plansQuery } from "@/lib/queries";
import { Steps } from "@/components/site/Steps";

const searchSchema = z.object({
  plano: z.string().optional(),
  ciclo: z.enum(["mensal", "anual"]).optional(),
});

export const Route = createFileRoute("/cadastro")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Criar conta — movvia" },
      { name: "description", content: "Crie sua conta e comece a controlar seus carros alugados." },
      { property: "og:title", content: "Criar conta — movvia" },
      { property: "og:description", content: "Crie sua conta no movvia em menos de um minuto." },
      { property: "og:url", content: "/cadastro" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cadastro" }],
  }),
  component: SignupPage,
});

const formSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    whatsapp: z.string().trim().min(10, "Informe seu WhatsApp com DDD").max(20),
    password: z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

function SignupPage() {
  const { plano, ciclo } = Route.useSearch();
  const navigate = useNavigate();
  const { data: plans = [] } = useQuery(plansQuery);
  const plan = plans.find((item) => item.code === plano) ?? plans[0];

  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", password: "", confirm: "" });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    if (!accepted) {
      toast.error("É preciso aceitar os Termos de Uso e a Política de Privacidade");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      // A senha é recebida pelo formulário e nunca fica exposta no código.
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: parsed.data.name, whatsapp: parsed.data.whatsapp },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível criar a conta", {
        description: error.message.includes("already")
          ? "Este e-mail já está cadastrado. Tente entrar."
          : error.message,
      });
      return;
    }
    navigate({ to: "/checkout", search: { plano: plan?.code, ciclo: ciclo ?? "mensal" } });
  }

  return (...) 
}
