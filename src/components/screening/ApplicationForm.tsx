import { useEffect, useRef, useState } from "react";
import { CASES_BY_MOBILE, type Applicant } from "@/data/cases";
import { ShieldCheck, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (mobile: string) => void;
}

const EMPTY: Omit<Applicant, "mobile"> = {
  email: "",
  aadhaar: "",
  pan: "",
  firstName: "",
  lastName: "",
  address: "",
  dob: "",
};

type LookupStatus = "idle" | "searching" | "found" | "nohit";

export default function ApplicationForm({ onSubmit }: Props) {
  const [mobile, setMobile] = useState("");
  const [details, setDetails] = useState(EMPTY);
  const [status, setStatus] = useState<LookupStatus>("idle");
  const debounceRef = useRef<number | null>(null);

  const valid = /^[6-9]\d{9}$/.test(mobile);
  const showError = mobile.length > 0 && !valid;

  const runLookup = (m: string) => {
    if (!/^[6-9]\d{9}$/.test(m)) {
      setStatus("idle");
      setDetails(EMPTY);
      return;
    }
    setStatus("searching");
    window.setTimeout(() => {
      const hit = CASES_BY_MOBILE[m];
      if (hit) {
        const { mobile: _m, ...rest } = hit.applicant;
        setDetails(rest);
        setStatus("found");
      } else {
        setDetails(EMPTY);
        setStatus("nohit");
      }
    }, 350);
  };

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (mobile.length === 0) {
      setStatus("idle");
      setDetails(EMPTY);
      return;
    }
    debounceRef.current = window.setTimeout(() => runLookup(mobile), 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [mobile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit(mobile);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Anti-Fraud Case Screening</h1>
            <p className="text-xs text-muted-foreground">Risk Operations Console</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">New Application Screening</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the applicant's mobile number to fetch existing case details, then submit for risk
            screening.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-surface shadow-[var(--shadow-card)]"
        >
          <div className="border-b px-6 py-5">
            <label htmlFor="mobile" className="text-sm font-medium">
              Mobile Number <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                +91
              </span>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                onBlur={() => runLookup(mobile)}
                className={`w-full rounded-md border bg-background py-2.5 pl-12 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 ${
                  showError ? "border-destructive focus:ring-destructive/20" : ""
                }`}
                aria-invalid={showError}
                aria-describedby="mobile-help"
              />
              <span className="absolute inset-y-0 right-3 flex items-center">
                {status === "searching" && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {status === "found" && <CheckCircle2 className="h-4 w-4 text-success" />}
                {status === "idle" && <Search className="h-4 w-4 text-muted-foreground" />}
                {status === "nohit" && <AlertCircle className="h-4 w-4 text-warning" />}
              </span>
            </div>
            <div id="mobile-help" className="mt-2 flex min-h-5 items-center gap-2 text-xs">
              {showError && (
                <span className="text-destructive">
                  Enter a valid 10-digit Indian mobile number.
                </span>
              )}
              {status === "found" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">
                  <CheckCircle2 className="h-3 w-3" /> Case Found — details auto-filled
                </span>
              )}
              {status === "nohit" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2 py-0.5 font-medium text-warning-foreground">
                  <AlertCircle className="h-3 w-3" /> No Hit — proceed to screening
                </span>
              )}
              {status === "searching" && (
                <span className="text-muted-foreground">Fetching details…</span>
              )}
            </div>
          </div>

          <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
            <ReadOnlyField label="First Name" value={details.firstName} />
            <ReadOnlyField label="Last Name" value={details.lastName} />
            <ReadOnlyField label="Email ID" value={details.email} />
            <ReadOnlyField label="Date of Birth" value={details.dob} />
            <ReadOnlyField label="Aadhaar" value={details.aadhaar} mono />
            <ReadOnlyField label="PAN" value={details.pan} mono />
            <div className="sm:col-span-2">
              <ReadOnlyField label="Address" value={details.address} />
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              Try: 9876543210, 9123456789, 9988776655, 9001122233, 9090909090
            </p>
            <button
              type="submit"
              disabled={!valid}
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit for Screening
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={`mt-1 min-h-9 rounded-md border bg-muted/40 px-3 py-2 text-sm ${
          mono ? "font-mono tracking-wide" : ""
        } ${value ? "text-foreground" : "text-muted-foreground/60"}`}
      >
        {value || "—"}
      </div>
    </div>
  );
}
