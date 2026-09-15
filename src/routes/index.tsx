import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Car,
  CheckCircle2,
  Globe,
  MessageCircle,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { PublicHeader } from "@/components/site/PublicHeader";
import { PublicFooter } from "@/components/site/PublicFooter";
import { DashboardMockup } from "@/components/site/DashboardMockup";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "movvia — controle seus carros alugados em um só lugar" },
      {
        name: "description",
        content:
          "Sistema para aluguel de carros: organize veículos, clientes, pagamentos, manutenções e aluguéis sem planilhas. Comece com poucos carros e cresça.",
      },
      { property: "og:title", content: "movvia — controle seus carros alugados" },
      {
        property: "og:description",
        content:
          "Gestão de aluguel de carros para quem trabalha por conta própria. Veículos, clientes, pagamentos e mini-site em um só painel.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "movvia — controle seus carros alugados" },
      {
        name: "twitter:description",
        content: "Seus carros. Seus clientes. Seus pagamentos. Tudo sob controle.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "movvia",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "Gestão de aluguel de carros: controle de veículos, clientes, pagamentos, manutenções e catálogo público.",
        }),
      },
    ],
  }),
  component: LandingPage,
});

const problems = [
  "Quem está com qual carro?",
  "Quem já pagou esta semana?",
  "Quem está atrasado?",
  "Qual carro está disponível?",
  "Quando é a próxima manutenção?",
  "Quanto cada carro está gerando?",
  "Quanto estou gastando com manutenção?",
  "Tudo espalhado em WhatsApp, planilhas e anotações?",
];

const features = [
  { icon: Car, title: "Seus carros", text: "Fotos, status, valor e histórico de cada veículo." },
  { icon: Users, title: "Seus clientes", text: "Contatos, documentos e histórico de aluguéis." },
  { icon: Wallet, title: "Seus pagamentos", text: "Recebidos, pendentes e atrasados em tempo real." },
  { icon: Calendar, title: "Seus aluguéis", text: "Períodos, valores e cobranças futuras geradas." },
  { icon: Wrench, title: "Suas manutenções", text: "Registros, custos e alertas da próxima revisão." },
  { icon: BarChart3, title: "Seus resultados", text: "Receita, despesa e rentabilidade por carro." },
  { icon: Globe, title: "Seu mini-site", text: "Um catálogo público com a sua marca e seu link." },
  { icon: MessageCircle, title: "WhatsApp", text: "Contato direto com clientes e interessados." },
];

const steps = [
  { n: "01", title: "Cadastre seus carros", text: "Fotos, valor e status em poucos toques." },
  { n: "02", title: "Cadastre seus clientes", text: "Contato e documentos sempre à mão." },
  { n: "03", title: "Defina o valor do aluguel", text: "Semanal, quinzenal, mensal ou personalizado." },
  { n: "04", title: "Controle os pagamentos", text: "Veja quem pagou e quem está atrasado." },
  { n: "05", title: "Acompanhe sua frota", text: "Ocupação, receita e manutenções em um painel." },
  { n: "06", title: "Compartilhe seu catálogo", text: "Divulgue seus carros com um link só seu." },
];

const faq = [
  {
    q: "Preciso ter CNPJ?",
    a: "Não. O sistema foi pensado também para quem trabalha por conta própria.",
  },
  {
    q: "Posso começar com poucos carros?",
    a: "Sim. Você pode começar com poucos veículos e aumentar sua frota quando quiser.",
  },
  {
    q: "Posso cadastrar muitos carros?",
    a: "Sim. Escolha o plano de acordo com o tamanho da sua frota.",
  },
  {
    q: "Meus clientes conseguem ver meus carros?",
    a: "Sim. Você terá um mini-site personalizado para compartilhar seu catálogo.",
  },
  {
    q: "Posso receber pagamentos?",
    a: "Você já controla todas as cobranças no sistema. A cobrança automática por Pix e gateways está em preparação.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {/* HERO */}
        <section className="aurora grid-backdrop relative overflow-hidden border-b border-border/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-brand" />
                Feito para quem aluga os próprios carros
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                Controle seus carros alugados{" "}
                <span className="brand-gradient-text">em um só lugar.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Organize seus veículos, clientes, pagamentos, manutenções e aluguéis sem depender de
                planilhas.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="glow-brand">
                  <Link to="/planos">
                    Começar agora <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Já tenho uma conta →{" "}
                <Link to="/login" className="font-medium text-brand hover:underline">
                  Entrar
                </Link>
              </p>
            </div>

            <div className="relative">
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* PROBLEMAS */}
        <section className="border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="max-w-2xl font-display text-3xl font-bold sm:text-4xl">
              Cada carro na rua é uma pergunta na sua cabeça.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((problem) => (
                <div
                  key={problem}
                  className="rounded-xl border border-border bg-surface/50 p-4 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
                >
                  {problem}
                </div>
              ))}
            </div>
            <p className="mt-8 font-display text-xl font-semibold text-brand sm:text-2xl">
              Você não precisa controlar tudo na cabeça.
            </p>
          </div>
        </section>

        {/* SOLUÇÃO */}
        <section id="recursos" className="scroll-mt-20 border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="max-w-2xl">
              <span className="text-xs font-medium uppercase tracking-widest text-tech">
                Centro de controle
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Tudo o que sua operação precisa, em um painel só.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border bg-surface/50 p-5 transition-all hover:-translate-y-1 hover:border-brand/40"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-brand transition-colors group-hover:bg-brand/15">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="scroll-mt-20 border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Como funciona</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {steps.map((step) => (
                <div key={step.n} className="relative rounded-2xl border border-border bg-surface/40 p-5">
                  <span className="font-display text-3xl font-bold text-brand/30">{step.n}</span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROVA VISUAL */}
        <section className="border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Seu painel de controle.</h2>
              <p className="mt-4 text-muted-foreground">
                Veja a frota inteira em segundos: quem está com cada carro, quanto entrou na semana,
                quem está atrasado e qual veículo precisa de manutenção. No computador ou no celular.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Cards de veículos com foto e status",
                  "Pagamentos recebidos, pendentes e atrasados",
                  "Alertas de manutenção por carro",
                  "Mini-site público com seus veículos",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="size-4 shrink-0 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <DashboardMockup />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-b border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
            <Accordion type="single" collapsible className="mt-8">
              {faq.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="aurora py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Seus carros. Seus clientes. Seus pagamentos.{" "}
              <span className="brand-gradient-text">Tudo sob controle.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Comece com poucos carros e tenha uma gestão profissional desde o primeiro aluguel.
            </p>
            <Button asChild size="lg" className="mt-8 glow-brand">
              <Link to="/planos">
                Começar agora <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
