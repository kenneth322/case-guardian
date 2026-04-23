import { useState } from "react";
import {
  CASES_BY_MOBILE,
  SUMMARY_TO_LEVEL,
  type Insight,
  type Influence,
  type RiskLevel,
  type SummaryRisk,
} from "@/data/cases";
import RiskGauge from "./RiskGauge";
import CollapsibleCard from "./CollapsibleCard";
import DecisionModal, { type Decision } from "./DecisionModal";
import {
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface Props {
  mobile: string;
  onReset: () => void;
}

const RISK_CLASS: Record<RiskLevel, string> = {
  Low: "bg-risk-low/15 text-risk-low border-risk-low/30",
  Medium: "bg-risk-medium/20 text-risk-medium border-risk-medium/40",
  High: "bg-risk-high/15 text-risk-high border-risk-high/30",
  "Very High": "bg-risk-veryhigh/15 text-risk-veryhigh border-risk-veryhigh/30",
};

const INFLUENCE_CLASS: Record<Influence, string> = {
  positive: "bg-success/15 text-success border-success/30",
  negative: "bg-destructive/10 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const INFLUENCE_LABEL: Record<Influence, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
};

export default function ResultsScreen({ mobile, onReset }: Props) {
  const data = CASES_BY_MOBILE[mobile];
  const noHit = !data;
  const [decision, setDecision] = useState<Decision | null>(null);

  const overallLevel: RiskLevel | null = noHit ? null : SUMMARY_TO_LEVEL[data.summary.overallRisk];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-surface/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Screening Results</h1>
                <p className="text-xs text-muted-foreground">
                  Mobile Number: <span className="font-mono">+91 {mobile}</span>
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-6 py-8 animate-[fade-in_0.4s_ease-out]">
        {/* Section 1: Overall Risk Gauge */}
        <section className="rounded-xl border bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Case Overview</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Aggregate risk across bureau, digital and telco signals.
              </p>
              {noHit ? (
                <div className="mt-4 flex items-start gap-2 rounded-md border bg-muted/50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">No Hit</span> — No records found
                    for this mobile number.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2 text-sm">
                  <Row
                    label="Applicant"
                    value={`${data.applicant.firstName} ${data.applicant.lastName}`}
                  />
                  <Row label="PAN" value={data.applicant.pan} mono />
                  <Row label="Email" value={data.applicant.email} />
                </div>
              )}
            </div>
            <RiskGauge risk={noHit ? null : data.summary.overallRisk} noHit={noHit} />
          </div>
        </section>

        {/* Section 2: Bureau */}
        <CollapsibleCard
          title="Bureau Risk Alerts"
          defaultOpen
          summary={
            noHit ? (
              <NoDataChip />
            ) : (
              <>
                {data.results.bureau.risky && <RiskyBadge />}
                <SummaryChip risk={data.summary.bureauRisk} />
              </>
            )
          }
        >
          {noHit ? (
            <NoData />
          ) : (
            <InsightBlock
              top={data.results.bureau.insights}
              all={data.results.bureau.allInsights}
            />
          )}
        </CollapsibleCard>

        {/* Section 3: Digital */}
        <CollapsibleCard
          title="Digital Footprints"
          summary={
            noHit ? (
              <NoDataChip />
            ) : (
              <>
                {data.results.digital.risky && <RiskyBadge />}
                <SummaryChip risk={data.summary.digitalRisk} />
              </>
            )
          }
        >
          {noHit ? (
            <NoData />
          ) : (
            <InsightBlock
              top={data.results.digital.insights}
              all={data.results.digital.allInsights}
            />
          )}
        </CollapsibleCard>

        {/* Section 4: Telco */}
        <CollapsibleCard
          title="Telco Data"
          summary={
            noHit ? (
              <NoDataChip />
            ) : (
              <>
                {data.results.telco.risky && <RiskyBadge />}
                <SummaryChip risk={data.summary.telcoRisk} />
              </>
            )
          }
        >
          {noHit ? (
            <NoData />
          ) : (
            <InsightBlock
              top={data.results.telco.insights}
              all={data.results.telco.allInsights}
            />
          )}
        </CollapsibleCard>
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

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed py-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function SummaryChip({ risk }: { risk: SummaryRisk }) {
  const level = SUMMARY_TO_LEVEL[risk];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${RISK_CLASS[level]}`}
    >
      {risk}
    </span>
  );
}

function RiskyBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
      <AlertTriangle className="h-3 w-3" />
      Risky
    </span>
  );
}

function InfluenceBadge({ influence }: { influence: Influence }) {
  const Icon =
    influence === "positive" ? TrendingUp : influence === "negative" ? TrendingDown : Minus;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${INFLUENCE_CLASS[influence]}`}
    >
      <Icon className="h-3 w-3" />
      {INFLUENCE_LABEL[influence]}
    </span>
  );
}

function InsightBlock({ top, all }: { top: Insight[]; all: Insight[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!all.length && !top.length) {
    return <p className="text-sm text-muted-foreground">No risk indicators available</p>;
  }

  const visible = expanded ? all : top.length ? top : all;
  const hasMore = all.length > top.length && top.length > 0;

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {expanded ? `All insights (${all.length})` : `Top insights`}
      </p>
      <ul className="space-y-2">
        {visible.map((ins, i) => (
          <li
            key={`${ins.title}-${i}`}
            className="rounded-md border bg-muted/30 px-3 py-2.5 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-medium leading-tight">{ins.title}</h4>
              <InfluenceBadge influence={ins.influence} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ins.text}</p>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:underline"
        >
          {expanded ? "Show top insights only" : `Show all ${all.length} insights`}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

function NoDataChip() {
  return (
    <span className="rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      No data
    </span>
  );
}

function NoData() {
  return <p className="text-sm text-muted-foreground">No risk indicators available</p>;
}
