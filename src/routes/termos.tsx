import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { PublicFooter } from "@/components/site/PublicFooter";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — movvia" },
      { name: "description", content: "Termos de uso da plataforma movvia." },
      { property: "og:title", content: "Termos de Uso — movvia" },
      { property: "og:description", content: "Termos de uso da plataforma movvia." },
      { property: "og:url", content: "/termos" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
  component: TermsPage,
});

function TermsPage() {
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
        <h1 className="font-display text-3xl font-bold">Termos de Uso</h1>
        <p className="mt-4 text-muted-foreground">
          Última atualização: {new Date().getFullYear()}.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Aceitação</h2>
            <p className="mt-2">
              Ao usar o movvia, você aceita estes Termos de Uso e nossa Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Serviço</h2>
            <p className="mt-2">
              O movvia é uma plataforma de gestão de aluguel de veículos para autônomos e pequenas
              frotas. Não exigimos CNPJ nem do locador nem do cliente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Conta e segurança</h2>
            <p className="mt-2">
              Você é responsável por manter sua senha segura. Cada conta vê apenas seus próprios
              dados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Pagamentos</h2>
            <p className="mt-2">
              Os planos são cobrados conforme periodicidade escolhida. O período de teste é
              oferecido conforme descrito na página de planos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Cancelamento</h2>
            <p className="mt-2">
              Você pode cancelar sua assinatura a qualquer momento. Os dados permanecem acessíveis
              durante o período pago.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Alterações</h2>
            <p className="mt-2">
              Podemos atualizar estes termos. Mudanças significativas serão comunicadas por e-mail
              ou dentro da plataforma.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
