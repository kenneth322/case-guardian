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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RTooltip,
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
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md border bg-surface px-3 py-2 text-sm font-medium transition hover:bg-muted"
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
              className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm transition hover:bg-destructive/90"
            >
              Reject
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: Sticky Applicant Details */}
      <div className="sticky top-0 z-20 border-b bg-surface/95 shadow-[var(--shadow-card)] backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
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
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex flex-wrap gap-1" role="tablist">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(t.id)}
                  className={`relative inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
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

      <main className="mx-auto max-w-6xl space-y-5 px-6 py-6 animate-[fade-in_0.4s_ease-out]">
        {tab === "overview" && (
          <OverviewTab data={data} noHit={noHit} overallLevel={overallLevel} />
        )}
        {tab === "bureau" && (
          <SectionTab
            title="Bureau Risk Alerts"
            risk={noHit ? null : data.summary.bureauRisk}
            insights={noHit ? [] : data.results.bureau.insights}
            allInsights={noHit ? [] : data.results.bureau.allInsights}
            isBureau
          />
        )}
        {tab === "digital" && (
          <SectionTab
            title="Digital Footprint"
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
  const chartData = useMemo(() => {
    if (noHit) return [];
    const sections = [
      { key: "Bureau", insights: data.results.bureau.allInsights },
      { key: "Digital", insights: data.results.digital.allInsights },
      { key: "Telecom", insights: data.results.telco.allInsights },
    ];
    return sections.map((s) => {
      const neg = s.insights.filter((i) => i.influence === "negative").length;
      const pos = s.insights.filter((i) => i.influence === "positive").length;
      const total = s.insights.length || 1;
      // riskIntensity: 0..100 weighted by negative share
      const riskIntensity = Math.round((neg / total) * 100);
      return {
        dimension: s.key,
        "Risk Signals": neg,
        "Positive Signals": pos,
        riskIntensity,
      };
    });
  }, [data, noHit]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Overall Risk Area */}
      <section className="rounded-xl border bg-surface p-6 shadow-[var(--shadow-card)]">
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

      {/* Risk Contribution Chart */}
      <section className="rounded-xl border bg-surface p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold tracking-tight">Risk Contribution by Dimension</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Comparing risk-increasing vs risk-reducing signals across data sources.
        </p>
        {noHit || chartData.length === 0 ? (
          <div className="mt-6 flex h-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            No signals available
          </div>
        ) : (
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} outerRadius="75%">
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "var(--color-foreground)", fontSize: 12, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                />
                <RTooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Radar
                  name="Risk Signals"
                  dataKey="Risk Signals"
                  stroke="var(--color-destructive)"
                  fill="var(--color-destructive)"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Positive Signals"
                  dataKey="Positive Signals"
                  stroke="var(--color-success)"
                  fill="var(--color-success)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
        {!noHit && chartData.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <LegendDot color="var(--color-destructive)" label="Risk-increasing" />
            <LegendDot color="var(--color-success)" label="Risk-reducing" />
          </div>
        )}
      </section>
    </div>
  );
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-surface p-5 shadow-[var(--shadow-card)]">
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
      <div className="rounded-xl border bg-surface p-5 shadow-[var(--shadow-card)]">
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
