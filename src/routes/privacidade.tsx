import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { PublicFooter } from "@/components/site/PublicFooter";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — movvia" },
      { name: "description", content: "Política de privacidade da plataforma movvia." },
      { property: "og:title", content: "Política de Privacidade — movvia" },
      { property: "og:description", content: "Política de privacidade da plataforma movvia." },
      { property: "og:url", content: "/privacidade" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="font-display text-3xl font-bold">Política de Privacidade</h1>
        <p className="mt-4 text-muted-foreground">
          Última atualização: {new Date().getFullYear()}.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Dados que coletamos</h2>
            <p className="mt-2">
              Coletamos nome, e-mail, WhatsApp e dados que você insere sobre veículos, clientes,
              aluguéis e pagamentos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Uso dos dados</h2>
            <p className="mt-2">
              Usamos seus dados para operar a plataforma, enviar notificações e melhorar o produto.
              Não vendemos dados a terceiros.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Armazenamento</h2>
            <p className="mt-2">
              Seus dados são armazenados em infraestrutura segura e criptografada em trânsito. Cada
              usuário acessa apenas seus próprios dados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Seus direitos</h2>
            <p className="mt-2">
              Você pode solicitar a exclusão da sua conta e dados entrando em contato pelo e-mail de
              suporte.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Alterações</h2>
            <p className="mt-2">
              Podemos atualizar esta política. Mudanças significativas serão comunicadas por e-mail
              ou dentro da plataforma.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
