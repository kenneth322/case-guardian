import { useMemo, useState } from "react";
import {
  CASES_BY_MOBILE,
  SUMMARY_TO_LEVEL,
  type Insight,
  type Influence,
  type RiskLevel,
  type SummaryRisk,
} from "@/data/cases";
import {
  BUREAU_RULE_BY_CODE,
  BUREAU_CATEGORY_ORDER,
} from "@/data/bureauRules";
import RiskGauge from "./RiskGauge";
import DecisionModal, { type Decision } from "./DecisionModal";
import {
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  IdCard,
  LayoutDashboard,
  FileWarning,
  Fingerprint,
  Signal,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip as RTooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Cell,
} from "recharts";

interface Props {
  mobile: string;
  onReset: () => void;
}

type TabId = "overview" | "bureau" | "digital" | "telco";

const RISK_CLASS: Record<RiskLevel, string> = {
  Low: "bg-risk-low/15 text-risk-low border-risk-low/30",
  Medium: "bg-risk-medium/20 text-risk-medium border-risk-medium/40",
  High: "bg-risk-high/15 text-risk-high border-risk-high/30",
  "Very High": "bg-risk-veryhigh/15 text-risk-veryhigh border-risk-veryhigh/30",
};

const INFLUENCE_LABEL_LONG: Record<Influence, string> = {
  positive: "Reduces Risk",
  negative: "Increases Risk",
  neutral: "Neutral",
};

const INFLUENCE_BADGE_CLASS: Record<Influence, string> = {
  positive: "bg-success/15 text-success border-success/30",
  negative: "bg-destructive/10 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const INFLUENCE_RANK: Record<Influence, number> = {
  negative: 0,
  neutral: 1,
  positive: 2,
};

function sortByImpact(list: Insight[]): Insight[] {
  return [...list].sort((a, b) => INFLUENCE_RANK[a.influence] - INFLUENCE_RANK[b.influence]);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMobile(m: string): string {
  return `+91 ${m}`;
}

export default function ResultsScreen({ mobile, onReset }: Props) {
  const data = CASES_BY_MOBILE[mobile];
  const noHit = !data;
  const [decision, setDecision] = useState<Decision | null>(null);
  const [tab, setTab] = useState<TabId>("overview");

  const overallLevel: RiskLevel | null = noHit ? null : SUMMARY_TO_LEVEL[data.summary.overallRisk];

  const tabs = useMemo(
    () => [
      {
        id: "overview" as TabId,
        label: "Overview",
        icon: LayoutDashboard,
        risky: false,
      },
      {
        id: "bureau" as TabId,
        label: "Bureau Risk Alerts",
        icon: FileWarning,
        risky: !noHit && data.results.bureau.risky,
      },
      {
        id: "digital" as TabId,
        label: "Digital Footprint",
        icon: Fingerprint,
        risky: !noHit && data.results.digital.risky,
      },
      {
        id: "telco" as TabId,
        label: "Telecom Data",
        icon: Signal,
        risky: !noHit && data.results.telco.risky,
      },
    ],
    [data, noHit],
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-30 border-b bg-surface/95 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Screening Results</h1>
              <p className="text-xs text-muted-foreground">
                Case for <span className="font-mono">{formatMobile(mobile)}</span>
              </p>
            </div>
            {noHit || !overallLevel ? (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-risk-neutral/30 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                No Hit
              </span>
            ) : (
              <span
                className={`ml-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${RISK_CLASS[overallLevel]}`}
              >
                {data.summary.overallRisk}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <button
              onClick={onReset}
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border bg-surface px-3 py-2 text-sm font-medium transition hover:bg-muted sm:col-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Run Another Case
            </button>
            <button
              onClick={() => setDecision("Approve")}
              className="rounded-md bg-success px-4 py-2 text-sm font-medium text-success-foreground shadow-sm transition hover:bg-success/90"
            >
              Approve
            </button>
            <button
              onClick={() => setDecision("Step-up")}
              className="rounded-md bg-warning px-4 py-2 text-sm font-medium text-warning-foreground shadow-sm transition hover:bg-warning/90"
            >
              Step-up
            </button>
            <button
              onClick={() => setDecision("Reject")}
              className="col-span-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90 sm:col-auto"
            >
              Reject
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: Applicant Details */}
      <div className="border-b bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Applicant Details
            </h2>
          </div>
          {noHit ? (
            <div className="flex items-start gap-2 rounded-md border bg-muted/50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">No Hit</span> — No applicant records
                found for this mobile number.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 md:grid-cols-2">
              <ApplicantField
                icon={User}
                label="Name"
                value={`${data.applicant.firstName} ${data.applicant.lastName}`}
              />
              <ApplicantField
                icon={Phone}
                label="Mobile Number"
                value={formatMobile(data.applicant.mobile)}
                mono
              />
              <ApplicantField
                icon={Calendar}
                label="Date of Birth"
                value={formatDate(data.applicant.dob)}
              />
              <ApplicantField icon={MapPin} label="Address" value={data.applicant.address} />
              <ApplicantField icon={CreditCard} label="PAN" value={data.applicant.pan} mono />
              <ApplicantField icon={IdCard} label="Aadhaar" value={data.applicant.aadhaar} mono />
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Tabs */}
      <div className="border-b bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav
            className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
            role="tablist"
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(t.id)}
                  className={`relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4 ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 animate-[fade-in_0.4s_ease-out]">
        {tab === "overview" && (
          <OverviewTab data={data} noHit={noHit} overallLevel={overallLevel} />
        )}
        {tab === "bureau" && (
          <BureauTab
            risk={noHit ? null : data.summary.bureauRisk}
            insights={noHit ? [] : data.results.bureau.insights}
            allInsights={noHit ? [] : data.results.bureau.allInsights}
          />
        )}
        {tab === "digital" && (
          <DigitalTab
            risk={noHit ? null : data.summary.digitalRisk}
            insights={noHit ? [] : data.results.digital.insights}
            allInsights={noHit ? [] : data.results.digital.allInsights}
          />
        )}
        {tab === "telco" && (
          <SectionTab
            title="Telecom Data"
            risk={noHit ? null : data.summary.telcoRisk}
            insights={noHit ? [] : data.results.telco.insights}
            allInsights={noHit ? [] : data.results.telco.allInsights}
          />
        )}
      </main>

      <DecisionModal
        decision={decision}
        onClose={() => setDecision(null)}
        onConfirmed={() => {
          setDecision(null);
          onReset();
        }}
      />
    </div>
  );
}

/* ---------- Applicant Field ---------- */
function ApplicantField({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof User;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={`truncate text-sm font-medium ${mono ? "font-mono" : ""}`} title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* ---------- Overview Tab ---------- */
function OverviewTab({
  data,
  noHit,
  overallLevel,
}: {
  data: ReturnType<() => (typeof CASES_BY_MOBILE)[string]>;
  noHit: boolean;
  overallLevel: RiskLevel | null;
}) {
  // Build a TSNE-style scatter of every signal/rule across the three sections.
  // Each point's coordinates are derived from section + influence so that
  // similar items naturally cluster together. Pure presentation — no scoring
  // logic is added.
  const scatterClusters = useMemo(() => {
    if (noHit) return [] as Array<{
      name: string;
      color: string;
      points: Array<{ x: number; y: number; z: number; label: string; section: string; influence: Influence }>;
    }>;

    const sections: Array<{ key: string; insights: Insight[]; cx: number; cy: number }> = [
      { key: "Bureau", insights: data.results.bureau.allInsights, cx: 22, cy: 70 },
      { key: "Digital", insights: data.results.digital.allInsights, cx: 50, cy: 30 },
      { key: "Telecom", insights: data.results.telco.allInsights, cx: 78, cy: 70 },
    ];

    type Pt = { x: number; y: number; z: number; label: string; section: string; influence: Influence };
    const high: Pt[] = [];
    const mid: Pt[] = [];
    const low: Pt[] = [];

    sections.forEach((s) => {
      s.insights.forEach((ins, idx) => {
        // Deterministic pseudo-random offset around section centroid.
        const seed = (idx + 1) * 9301 + s.key.charCodeAt(0) * 49297;
        const r1 = ((seed % 1000) / 1000) - 0.5;
        const r2 = (((seed * 7) % 1000) / 1000) - 0.5;
        // Negative signals pull toward upper-right "high risk" zone, positive
        // toward lower-left, neutral stays near the centroid.
        const drift = ins.influence === "negative" ? 8 : ins.influence === "positive" ? -8 : 0;
        const x = Math.max(2, Math.min(98, s.cx + r1 * 18 + drift * 0.6));
        const y = Math.max(2, Math.min(98, s.cy + r2 * 18 - drift * 0.6));
        const label = displayNameForInsight(ins, s.key);
        const pt: Pt = { x, y, z: 80, label, section: s.key, influence: ins.influence };
        if (ins.influence === "negative") high.push(pt);
        else if (ins.influence === "neutral") mid.push(pt);
        else low.push(pt);
      });
    });

    return [
      { name: "High Risk Cluster", color: "var(--color-destructive)", points: high },
      { name: "Mid Risk Cluster", color: "var(--color-risk-medium, #d97706)", points: mid },
      { name: "Low Risk Cluster", color: "var(--color-success)", points: low },
    ].filter((c) => c.points.length > 0);
  }, [data, noHit]);

  const topFactors = useMemo(() => {
    if (noHit) return [] as Array<{
      label: string;
      section: string;
      description: string;
      influence: Influence;
    }>;
    const all: Array<{ label: string; section: string; description: string; influence: Influence }> = [];

    // Bureau
    for (const ins of data.results.bureau.allInsights) {
      const code = ins.sourceVariable;
      if (!code || code === "RULE_COUNT") continue;
      const rule = BUREAU_RULE_BY_CODE[code];
      if (!rule) continue;
      all.push({
        label: rule.description,
        section: "Bureau",
        description: `Triggered under ${formatBureauCategory(rule.category)}.`,
        influence: ins.influence,
      });
    }
    // Digital
    for (const ins of data.results.digital.allInsights) {
      const key = ins.sourceVariable ?? "";
      if (!key) continue;
      all.push({
        label: digitalLabelFor(key),
        section: "Digital Footprint",
        description: digitalDescriptionFor(key, ins) || "Digital footprint indicator.",
        influence: ins.influence,
      });
    }
    // Telecom
    for (const ins of data.results.telco.allInsights) {
      all.push({
        label: ins.title || "Telecom signal",
        section: "Telecom",
        description: extractDescription(ins.text) || "Telecom usage indicator.",
        influence: ins.influence,
      });
    }

    const negatives = all.filter((f) => f.influence === "negative");
    const pool = negatives.length > 0 ? negatives : all.filter((f) => f.influence === "positive");
    return pool.slice(0, 6);
  }, [data, noHit]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Overall Risk Area */}
        <section className="rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-sm font-semibold tracking-tight">Overall Risk Area</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Aggregate risk across bureau, digital and telecom signals.
          </p>
          <div className="mt-4">
            <RiskGauge risk={noHit ? null : data.summary.overallRisk} noHit={noHit} />
          </div>
          {!noHit && overallLevel && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <RiskMini label="Bureau" risk={data.summary.bureauRisk} />
              <RiskMini label="Digital" risk={data.summary.digitalRisk} />
              <RiskMini label="Telecom" risk={data.summary.telcoRisk} />
            </div>
          )}
        </section>

        {/* Multi-Dimensional Risk Visualization */}
        <section className="rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-sm font-semibold tracking-tight">Multi-Dimensional Risk Map</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Population-style clustering of bureau rules, digital footprint and telecom signals.
          </p>
          {noHit || scatterClusters.length === 0 ? (
            <div className="mt-6 flex h-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              No signals available
            </div>
          ) : (
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[0, 100]}
                    tick={false}
                    axisLine={{ stroke: "var(--color-border)" }}
                    label={{
                      value: "Bureau ←  signal space  → Telecom",
                      position: "insideBottom",
                      offset: -2,
                      style: { fill: "var(--color-muted-foreground)", fontSize: 11 },
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0, 100]}
                    tick={false}
                    axisLine={{ stroke: "var(--color-border)" }}
                    label={{
                      value: "Risk intensity",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: { fill: "var(--color-muted-foreground)", fontSize: 11 },
                    }}
                  />
                  <ZAxis type="number" dataKey="z" range={[60, 180]} />
                  <RTooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(_v, _n, p: { payload?: { label: string; section: string } }) => {
                      const pl = p?.payload;
                      if (!pl) return ["", ""];
                      return [pl.label, pl.section];
                    }}
                  />
                  {scatterClusters.map((c) => (
                    <Scatter key={c.name} name={c.name} data={c.points} fill={c.color} fillOpacity={0.55}>
                      {c.points.map((_, i) => (
                        <Cell key={i} stroke={c.color} strokeOpacity={0.9} />
                      ))}
                    </Scatter>
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
          {!noHit && scatterClusters.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {scatterClusters.map((c) => (
                <LegendDot key={c.name} color={c.color} label={c.name} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top Risk Factors */}
      {!noHit && topFactors.length > 0 && (
        <section className="rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Top Risk Factors</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Most impactful drivers across Bureau, Digital Footprint and Telecom.
              </p>
            </div>
            <span className="rounded-full border bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {topFactors[0]?.influence === "negative" ? "Risk-increasing" : "Risk-reducing"}
            </span>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {topFactors.map((f, i) => {
              const accent =
                f.influence === "negative"
                  ? "border-l-destructive"
                  : f.influence === "positive"
                    ? "border-l-success"
                    : "border-l-muted-foreground/40";
              return (
                <li
                  key={`${f.section}-${i}-${f.label}`}
                  className={`rounded-md border border-l-4 ${accent} bg-muted/20 p-3`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{f.label}</p>
                    <span className="shrink-0 rounded-full border bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {f.section}
                    </span>
                  </div>
                  {f.description && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{f.description}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function displayNameForInsight(ins: Insight, section: string): string {
  if (section === "Bureau") {
    const code = ins.sourceVariable;
    if (code && BUREAU_RULE_BY_CODE[code]) return BUREAU_RULE_BY_CODE[code].description;
    return ins.title || "Bureau rule";
  }
  if (section === "Digital") {
    return digitalLabelFor(ins.sourceVariable ?? "");
  }
  return ins.title || "Telecom signal";
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function RiskMini({ label, risk }: { label: string; risk: SummaryRisk }) {
  const level = SUMMARY_TO_LEVEL[risk];
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${RISK_CLASS[level]}`}
      >
        {risk}
      </div>
    </div>
  );
}

/* ---------- Generic Section Tab (Bureau / Digital / Telco) ---------- */
function SectionTab({
  title,
  risk,
  insights,
  allInsights,
  isBureau,
}: {
  title: string;
  risk: SummaryRisk | null;
  insights: Insight[];
  allInsights: Insight[];
  isBureau?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  // For Bureau: extract rule count and exclude RULE_COUNT entries from insight lists
  const isRuleCount = (i: Insight) => i.sourceVariable === "RULE_COUNT";
  const ruleCount = useMemo(() => {
    if (!isBureau) return null;
    const rc = allInsights.find(isRuleCount) ?? insights.find(isRuleCount);
    if (!rc) return null;
    const m = rc.text.match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  }, [isBureau, insights, allInsights]);

  const filteredInsights = isBureau ? insights.filter((i) => !isRuleCount(i)) : insights;
  const filteredAll = isBureau ? allInsights.filter((i) => !isRuleCount(i)) : allInsights;

  const list = expanded ? filteredAll : filteredInsights.length ? filteredInsights : filteredAll;
  const sorted = sortByImpact(list);
  const hasMore = filteredAll.length > filteredInsights.length && filteredInsights.length > 0;
  const level = risk ? SUMMARY_TO_LEVEL[risk] : null;

  return (
    <section className="space-y-4">
      {/* Risk Status header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "insight" : "insights"} surfaced
          </p>
        </div>
        <div className="flex items-center gap-2">
          {risk && level ? (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${RISK_CLASS[level]}`}
            >
              {risk}
            </span>
          ) : (
            <span className="rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
              No data
            </span>
          )}
        </div>
      </div>

      {/* Insights list */}
      <div className="rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No risk indicators available</p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {expanded ? `All Signals (${filteredAll.length})` : "Top Signals"}
              </p>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="text-xs font-medium text-primary transition hover:underline"
                >
                  {expanded ? "Show top only" : `Show all ${filteredAll.length}`}
                </button>
              )}
            </div>
            <ul className="space-y-2.5">
              {sorted.map((ins, i) => (
                <InsightCard key={`${ins.title}-${i}`} insight={ins} />
              ))}
            </ul>
          </>
        )}
        {isBureau && ruleCount !== null && (
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            {ruleCount} {ruleCount === 1 ? "alert" : "alerts"} triggered
          </p>
        )}
      </div>
    </section>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const Icon =
    insight.influence === "positive"
      ? TrendingDown
      : insight.influence === "negative"
        ? TrendingUp
        : Minus;
  const accentBorder =
    insight.influence === "negative"
      ? "border-l-destructive"
      : insight.influence === "positive"
        ? "border-l-success"
        : "border-l-muted-foreground/40";

  return (
    <li
      className={`rounded-md border border-l-4 ${accentBorder} bg-muted/20 px-4 py-3 transition hover:bg-muted/40`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold leading-tight">{insight.title}</h4>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${INFLUENCE_BADGE_CLASS[insight.influence]}`}
        >
          <Icon className="h-3 w-3" />
          {INFLUENCE_LABEL_LONG[insight.influence]}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{insight.text}</p>
    </li>
  );
}

/* ---------- Bureau presentation helpers ---------- */
// Words that must stay uppercase even after sentence/title casing.
const BUREAU_KEEP_UPPER = new Set([
  "PAN", "GST", "KYC", "ID", "DL", "VID", "EMI",
]);

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, " ");
}

function titleCaseWord(w: string): string {
  if (!w) return w;
  const stripped = w.replace(/[^A-Za-z]/g, "");
  if (stripped && BUREAU_KEEP_UPPER.has(stripped.toUpperCase())) {
    return w.toUpperCase();
  }
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function formatBureauCategory(cat: string): string {
  return decodeHtmlEntities(cat)
    .toLowerCase()
    .split(/(\s+)/)
    .map((tok) => (/\s+/.test(tok) ? tok : titleCaseWord(tok)))
    .join("");
}

function formatBureauDescription(desc: string): string {
  const decoded = decodeHtmlEntities(desc);
  // Sentence case: first letter uppercase, rest lowercase, but preserve
  // acronyms (PAN, GST, etc.) and keep numbers/symbols intact.
  const lower = decoded.toLowerCase();
  // Restore acronyms by tokenising on non-letter boundaries.
  const restored = lower.replace(/[a-z]+/g, (word) => {
    const upper = word.toUpperCase();
    return BUREAU_KEEP_UPPER.has(upper) ? upper : word;
  });
  // Capitalise the first alphabetic character.
  return restored.replace(/[a-z]/, (c) => c.toUpperCase());
}

/* ---------- Bureau Tab (grouped by Rule Category from Risk Alerts Rules.xlsx) ---------- */
function BureauTab({
  risk,
  insights,
  allInsights,
}: {
  risk: SummaryRisk | null;
  insights: Insight[];
  allInsights: Insight[];
}) {
  const level = risk ? SUMMARY_TO_LEVEL[risk] : null;

  // Use allInsights if available, fall back to insights. Bureau rules are
  // "triggered" when the JSON includes them — they are filtered upstream so
  // any non-RULE_COUNT entry whose sourceVariable maps to a known rule is
  // a triggered alert.
  const source = allInsights.length ? allInsights : insights;

  // Build category -> descriptions[], preserving Excel rule order within each
  // category and excluding any unmapped / RULE_COUNT entries.
  const grouped = useMemo(() => {
    const triggeredCodes = new Set<string>();
    for (const ins of source) {
      const code = ins.sourceVariable;
      if (!code) continue;
      if (code === "RULE_COUNT") continue;
      if (BUREAU_RULE_BY_CODE[code]) {
        triggeredCodes.add(code);
      }
    }
    const map = new Map<string, string[]>();
    for (const cat of BUREAU_CATEGORY_ORDER) map.set(cat, []);
    // Iterate BUREAU_RULES to preserve Excel ordering
    for (const rule of Object.values(BUREAU_RULE_BY_CODE)) {
      if (triggeredCodes.has(rule.code)) {
        const list = map.get(rule.category) ?? [];
        list.push(rule.description);
        map.set(rule.category, list);
      }
    }
    // Drop empty categories, keep Excel order
    return BUREAU_CATEGORY_ORDER
      .map((cat) => ({ category: cat, descriptions: map.get(cat) ?? [] }))
      .filter((g) => g.descriptions.length > 0);
  }, [source]);

  const totalTriggered = grouped.reduce((acc, g) => acc + g.descriptions.length, 0);

  return (
    <section className="space-y-4">
      {/* Risk Status header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Bureau Risk Alerts</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalTriggered} {totalTriggered === 1 ? "alert" : "alerts"} triggered
          </p>
        </div>
        <div className="flex items-center gap-2">
          {risk && level ? (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${RISK_CLASS[level]}`}
            >
              {risk}
            </span>
          ) : (
            <span className="rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
              No data
            </span>
          )}
        </div>
      </div>

      {/* Grouped rule list */}
      <div className="rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No risk indicators available</p>
        ) : (
          <div className="space-y-5">
            {grouped.map((g) => (
              <div key={g.category}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-destructive">
                    {formatBureauCategory(g.category)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {g.descriptions.length} {g.descriptions.length === 1 ? "alert" : "alerts"}
                  </span>
                </div>
                <ul className="space-y-2">
                  {g.descriptions.map((desc, i) => (
                    <li
                      key={`${g.category}-${i}`}
                      className="rounded-md border border-l-4 border-l-destructive bg-muted/20 px-4 py-2.5 text-sm leading-snug"
                    >
                      {formatBureauDescription(desc)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Digital Footprint Tab ---------- */
// Master list of all Digital Footprint variables observed across cases,
// in a stable display order. Used so we always show every indicator,
// even when not triggered for the current case.
const DIGITAL_VARIABLES: string[] = [
  "Phone to Name.nameMatchScore_BUREAUID",
  "Phone Social Advance.phoneSocialCount_BUREAUID",
  "ecomScore_BUREAUID",
  "daysSinceRevocation_BUREAUID",
  "Mobile GIN.l1Count_BUREAUID",
  "Mobile GIN.l1Confidence_BUREAUID",
  "Mobile GIN.l2Count_BUREAUID",
  "Mobile GIN.l2Confidence_BUREAUID",
  "Mobile GIN.nameDiversity_BUREAUID",
  "Mobile GIN.nodeTypeCounts.mobile_BUREAUID",
  "Mobile GIN.nodeTypeCounts.email_BUREAUID",
  "Mobile GIN.nodeTypeCounts.fullName_BUREAUID",
  "Mobile GIN.industryCounts.relationshipCount_BUREAUID",
  "Mobile GIN.industryCounts.industryFinance_BUREAUID",
  "Mobile GIN.industryCounts.industryFintech_BUREAUID",
  "Mobile GIN.industryCounts.industryGaming_BUREAUID",
  "Mobile GIN.industryCounts.industryBreached_BUREAUID",
  "Mobile GIN.industryCounts.industryOther_BUREAUID",
];

// Friendly labels for known Digital Footprint variables.
const DIGITAL_LABELS: Record<string, string> = {
  "Phone to Name.nameMatchScore_BUREAUID": "Name Match Score",
  "Phone Social Advance.phoneSocialCount_BUREAUID": "Social Presence Count",
  "ecomScore_BUREAUID": "E-commerce Presence Score",
  "daysSinceRevocation_BUREAUID": "Days Since Number Revocation",
  "Mobile GIN.l1Count_BUREAUID": "Network Connections (Level 1)",
  "Mobile GIN.l1Confidence_BUREAUID": "Network Confidence (Level 1)",
  "Mobile GIN.l2Count_BUREAUID": "Network Connections (Level 2)",
  "Mobile GIN.l2Confidence_BUREAUID": "Network Confidence (Level 2)",
  "Mobile GIN.nameDiversity_BUREAUID": "Name Diversity in Network",
  "Mobile GIN.nodeTypeCounts.mobile_BUREAUID": "Connected Mobile Numbers",
  "Mobile GIN.nodeTypeCounts.email_BUREAUID": "Connected Email Addresses",
  "Mobile GIN.nodeTypeCounts.fullName_BUREAUID": "Connected Full Names",
  "Mobile GIN.industryCounts.relationshipCount_BUREAUID": "Industry Relationship Count",
  "Mobile GIN.industryCounts.industryFinance_BUREAUID": "Finance Industry Presence",
  "Mobile GIN.industryCounts.industryFintech_BUREAUID": "Fintech Industry Presence",
  "Mobile GIN.industryCounts.industryGaming_BUREAUID": "Gaming Industry Presence",
  "Mobile GIN.industryCounts.industryBreached_BUREAUID": "Breached Database Presence",
  "Mobile GIN.industryCounts.industryOther_BUREAUID": "Other Industry Presence",
};

// Fallback descriptions for each indicator (used when the case data does not
// supply a textual description).
const DIGITAL_DESCRIPTIONS: Record<string, string> = {
  "Phone to Name.nameMatchScore_BUREAUID":
    "Match similarity between the provided name and the name found in official records.",
  "Phone Social Advance.phoneSocialCount_BUREAUID":
    "Total number of platforms where an account is registered with the phone number.",
  "ecomScore_BUREAUID":
    "Reflects the user's presence and activity across major e-commerce platforms.",
  "daysSinceRevocation_BUREAUID":
    "Days since the phone number was last revoked or reassigned.",
  "Mobile GIN.l1Count_BUREAUID":
    "Number of distinct first-degree connections to the primary node.",
  "Mobile GIN.l1Confidence_BUREAUID":
    "Confidence score for first-degree network connections.",
  "Mobile GIN.l2Count_BUREAUID":
    "Number of distinct second-degree connections to the primary node; larger counts are linked to higher risk.",
  "Mobile GIN.l2Confidence_BUREAUID":
    "Confidence score for second-degree network connections.",
  "Mobile GIN.nameDiversity_BUREAUID":
    "Diversity of names linked to the primary node across the network.",
  "Mobile GIN.nodeTypeCounts.mobile_BUREAUID":
    "Number of distinct mobile numbers connected to the primary node.",
  "Mobile GIN.nodeTypeCounts.email_BUREAUID":
    "Number of distinct email addresses connected to the primary node.",
  "Mobile GIN.nodeTypeCounts.fullName_BUREAUID":
    "Number of distinct full names connected to the primary node.",
  "Mobile GIN.industryCounts.relationshipCount_BUREAUID":
    "Number of times the primary node has been seen across industries in the network.",
  "Mobile GIN.industryCounts.industryFinance_BUREAUID":
    "Presence of the primary node across finance-related platforms.",
  "Mobile GIN.industryCounts.industryFintech_BUREAUID":
    "Presence of the primary node across fintech platforms.",
  "Mobile GIN.industryCounts.industryGaming_BUREAUID":
    "Presence of the primary node across gaming platforms.",
  "Mobile GIN.industryCounts.industryBreached_BUREAUID":
    "Presence of the primary node in known breached databases.",
  "Mobile GIN.industryCounts.industryOther_BUREAUID":
    "Presence of the primary node across other industry platforms.",
};

// Group → ordered indicator keys.
const DIGITAL_GROUPS: { key: string; label: string; keys: string[] }[] = [
  {
    key: "key",
    label: "Key Indicators",
    keys: [
      "Phone to Name.nameMatchScore_BUREAUID",
      "Phone Social Advance.phoneSocialCount_BUREAUID",
      "ecomScore_BUREAUID",
      "daysSinceRevocation_BUREAUID",
    ],
  },
  {
    key: "industry",
    label: "Industry",
    keys: [
      "Mobile GIN.industryCounts.relationshipCount_BUREAUID",
      "Mobile GIN.industryCounts.industryFinance_BUREAUID",
      "Mobile GIN.industryCounts.industryFintech_BUREAUID",
      "Mobile GIN.industryCounts.industryGaming_BUREAUID",
      "Mobile GIN.industryCounts.industryBreached_BUREAUID",
      "Mobile GIN.industryCounts.industryOther_BUREAUID",
    ],
  },
  {
    key: "connections",
    label: "Connections",
    keys: [
      "Mobile GIN.nodeTypeCounts.mobile_BUREAUID",
      "Mobile GIN.nodeTypeCounts.email_BUREAUID",
      "Mobile GIN.nodeTypeCounts.fullName_BUREAUID",
      "Mobile GIN.nameDiversity_BUREAUID",
    ],
  },
  {
    key: "network",
    label: "Network",
    keys: [
      "Mobile GIN.l1Count_BUREAUID",
      "Mobile GIN.l1Confidence_BUREAUID",
      "Mobile GIN.l2Count_BUREAUID",
      "Mobile GIN.l2Confidence_BUREAUID",
    ],
  },
];

const DIGITAL_DEFAULT_VALUE = 0.4;

function humanizeDigitalKey(key: string): string {
  // Fallback humanizer for unknown variables.
  let s = key.replace(/_BUREAUID$/i, "");
  s = s.split(".").pop() ?? s;
  s = s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_]+/g, " ");
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function digitalLabelFor(key: string): string {
  return DIGITAL_LABELS[key] ?? humanizeDigitalKey(key);
}

function extractObservedValue(text: string): number | null {
  const m = text.match(/Observed value:\s*(-?\d+(?:\.\d+)?)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function extractDescription(text: string): string {
  // Strip "Observed value: ..." trailing sentence and any " nan " filler.
  let s = text.replace(/\s*Observed value:\s*-?\d+(?:\.\d+)?\.?\s*$/i, "");
  s = s.replace(/\s+nan\s+/gi, " ").replace(/\s{2,}/g, " ").trim();
  return s;
}

function digitalDescriptionFor(key: string, ins?: Insight): string {
  if (ins) {
    const d = extractDescription(ins.text);
    if (d) return d;
  }
  return DIGITAL_DESCRIPTIONS[key] ?? "";
}

function formatDigitalValue(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function DigitalTab({
  risk,
  insights,
  allInsights,
}: {
  risk: SummaryRisk | null;
  insights: Insight[];
  allInsights: Insight[];
}) {
  const level = risk ? SUMMARY_TO_LEVEL[risk] : null;
  const source = allInsights.length ? allInsights : insights;

  // Index insights by sourceVariable for value/description lookup.
  const bySource = useMemo(() => {
    const map = new Map<string, Insight>();
    for (const ins of source) {
      if (ins.sourceVariable && !map.has(ins.sourceVariable)) {
        map.set(ins.sourceVariable, ins);
      }
    }
    return map;
  }, [source]);

  // Build grouped rows. Any extra variables present in the case but not in
  // any predefined group are appended to "Key Indicators" so nothing is hidden.
  const groups = useMemo(() => {
    const knownKeys = new Set(DIGITAL_GROUPS.flatMap((g) => g.keys));
    const extras: string[] = [];
    for (const key of bySource.keys()) {
      if (!knownKeys.has(key) && !DIGITAL_VARIABLES.includes(key)) {
        extras.push(key);
      }
    }
    return DIGITAL_GROUPS.map((g, idx) => {
      const keys = idx === 0 ? [...g.keys, ...extras] : g.keys;
      const items = keys.map((key) => {
        const ins = bySource.get(key);
        const observed = ins ? extractObservedValue(ins.text) : null;
        const value = observed ?? DIGITAL_DEFAULT_VALUE;
        return {
          key,
          label: digitalLabelFor(key),
          description: digitalDescriptionFor(key, ins),
          value,
          isDefault: observed === null,
        };
      });
      return { ...g, items };
    });
  }, [bySource]);

  const totalIndicators = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <section className="space-y-4">
      {/* Risk Status header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Digital Footprint</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalIndicators} {totalIndicators === 1 ? "indicator" : "indicators"} tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          {risk && level ? (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${RISK_CLASS[level]}`}
            >
              {risk}
            </span>
          ) : (
            <span className="rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
              No data
            </span>
          )}
        </div>
      </div>

      {/* Grouped indicators list (mirrors Bureau Risk Alerts layout) */}
      <div className="rounded-xl border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary">
                  {g.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {g.items.length} {g.items.length === 1 ? "indicator" : "indicators"}
                </span>
              </div>
              <ul className="space-y-2">
                {g.items.map((it) => (
                  <li
                    key={it.key}
                    className="rounded-md border border-l-4 border-l-primary/60 bg-muted/20 px-4 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm font-semibold text-foreground">
                        {it.label}
                      </span>
                      <span
                        className="font-mono text-sm tabular-nums text-foreground"
                        title={it.isDefault ? "Default value (no data)" : "Observed value"}
                      >
                        {formatDigitalValue(it.value)}
                      </span>
                    </div>
                    {it.description && (
                      <p className="mt-1 text-xs leading-snug text-muted-foreground">
                        {it.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
