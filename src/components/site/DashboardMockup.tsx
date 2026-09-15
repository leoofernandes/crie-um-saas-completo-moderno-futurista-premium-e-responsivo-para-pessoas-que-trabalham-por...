import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer } from "recharts";

const revenue = [
  { d: "S1", v: 9200 },
  { d: "S2", v: 12400 },
  { d: "S3", v: 11100 },
  { d: "S4", v: 15600 },
  { d: "S5", v: 14200 },
  { d: "S6", v: 18450 },
];

const occupancy = [
  { d: "Seg", v: 22 },
  { d: "Ter", v: 24 },
  { d: "Qua", v: 25 },
  { d: "Qui", v: 23 },
  { d: "Sex", v: 25 },
  { d: "Sáb", v: 26 },
  { d: "Dom", v: 25 },
];

function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "brand" | "tech" | "danger";
}) {
  const toneClass =
    tone === "brand"
      ? "text-brand"
      : tone === "tech"
        ? "text-tech"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border/70 bg-surface-2/60 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-lg font-bold ${toneClass}`}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div className="glass-panel overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold">Minha frota</p>
          <p className="truncate text-xs text-muted-foreground">Visão geral de hoje</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-brand" />
          <span className="size-2.5 rounded-full bg-tech" />
          <span className="size-2.5 rounded-full bg-muted" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Metric label="Veículos" value="32" hint="frota total" />
        <Metric label="Alugados" value="25" tone="brand" />
        <Metric label="Disponíveis" value="5" tone="tech" />
        <Metric label="Manutenção" value="2" hint="em oficina" />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border/70 bg-surface-2/40 p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Receita da semana
              </p>
              <p className="font-display text-2xl font-bold text-brand">R$ 18.450</p>
            </div>
            <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand">
              +18%
            </span>
          </div>
          <div className="mt-2 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mockRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  fill="url(#mockRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-2.5">
          <Metric label="A receber" value="R$ 3.250" tone="tech" hint="próximos 7 dias" />
          <Metric label="Em atraso" value="R$ 650" tone="danger" hint="2 clientes" />
          <div className="rounded-xl border border-border/70 bg-surface-2/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ocupação</p>
            <div className="mt-1 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancy} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="v" radius={3}>
                    {occupancy.map((entry, index) => (
                      <Cell
                        key={entry.d}
                        fill={index === occupancy.length - 1 ? "var(--brand)" : "var(--tech)"}
                        fillOpacity={index === occupancy.length - 1 ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
