import { useEffect, useRef, useState } from "react";
import { CASES_BY_MOBILE, DEMO_MOBILES, type Applicant } from "@/data/cases";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

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

export default function ApplicationForm({ onSubmit }: Props) {
  const [mobile, setMobile] = useState("");
  const [details, setDetails] = useState(EMPTY);
  const [autoFilled, setAutoFilled] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  const validMobile = /^[6-9]\d{9}$/.test(mobile);
  const showMobileError = mobile.length > 0 && !validMobile;

  // Centralized autofill: triggered whenever the mobile state changes,
  // regardless of how it was set (typing, paste, programmatic, browser autofill).
  useEffect(() => {
    const hit = CASES_BY_MOBILE[mobile];
    if (hit) {
      const { mobile: _m, ...rest } = hit.applicant;
      setDetails(rest);
      setAutoFilled(true);
    } else if (autoFilled) {
      setDetails(EMPTY);
      setAutoFilled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  // Catch browser autofill / paste flows that set the input value without
  // dispatching a React-recognized change event. We poll the DOM value on
  // focus, blur and the native 'input'/'change' events, and sync it to state.
  useEffect(() => {
    const el = mobileInputRef.current;
    if (!el) return;
    const sync = () => {
      const next = el.value.replace(/\D/g, "").slice(0, 10);
      if (next !== mobile) setMobile(next);
    };
    el.addEventListener("input", sync);
    el.addEventListener("change", sync);
    el.addEventListener("blur", sync);
    el.addEventListener("animationstart", sync); // Chrome autofill fires this
    return () => {
      el.removeEventListener("input", sync);
      el.removeEventListener("change", sync);
      el.removeEventListener("blur", sync);
      el.removeEventListener("animationstart", sync);
    };
  }, [mobile]);

  const handleMobileChange = (raw: string) => {
    const m = raw.replace(/\D/g, "").slice(0, 10);
    setMobile(m);
  };

  const setField = <K extends keyof typeof EMPTY>(key: K, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }));
  };

  const allFilled =
    validMobile &&
    details.firstName.trim() &&
    details.lastName.trim() &&
    details.email.trim() &&
    details.dob.trim() &&
    details.aadhaar.trim() &&
    details.pan.trim() &&
    details.address.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled) return;
    onSubmit(mobile);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Anti-Fraud Case Screening</h1>
            <p className="text-xs text-muted-foreground">Risk Operations Console</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">New Application Screening</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            To enter applicant details for risk screening.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-surface shadow-[var(--shadow-card)]"
        >
          <div className="grid gap-5 px-4 py-6 sm:grid-cols-2 sm:px-6">
            <div className="sm:col-span-2">
              <label htmlFor="mobile" className="text-xs font-medium text-muted-foreground">
                Mobile Number <span className="text-destructive">*</span>
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                  +91
                </span>
                <input
                  id="mobile"
                  ref={mobileInputRef}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (text) {
                      e.preventDefault();
                      handleMobileChange(text);
                    }
                  }}
                  className={`w-full rounded-md border bg-background py-2 pl-12 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 ${
                    showMobileError ? "border-destructive focus:ring-destructive/20" : ""
                  }`}
                  aria-invalid={showMobileError}
                />
              </div>
              <div className="mt-1.5 flex min-h-5 items-center gap-2 text-xs">
                {showMobileError && (
                  <span className="text-destructive">
                    Enter a valid 10-digit Indian mobile number.
                  </span>
                )}
                {autoFilled && validMobile && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">
                    <CheckCircle2 className="h-3 w-3" /> Demo data auto-filled
                  </span>
                )}
              </div>
            </div>

            <EditableField
              label="First Name"
              value={details.firstName}
              onChange={(v) => setField("firstName", v)}
              placeholder="e.g. Ravi"
            />
            <EditableField
              label="Last Name"
              value={details.lastName}
              onChange={(v) => setField("lastName", v)}
              placeholder="e.g. Sharma"
            />
            <EditableField
              label="Email ID"
              type="email"
              value={details.email}
              onChange={(v) => setField("email", v)}
              placeholder="name@example.com"
            />
            <EditableField
              label="Date of Birth"
              type="date"
              value={details.dob}
              onChange={(v) => setField("dob", v)}
            />
            <EditableField
              label="Aadhaar"
              value={details.aadhaar}
              onChange={(v) => setField("aadhaar", v)}
              placeholder="1234 5678 9012"
              mono
            />
            <EditableField
              label="PAN"
              value={details.pan}
              onChange={(v) => setField("pan", v.toUpperCase())}
              placeholder="ABCDE1234F"
              mono
            />
            <div className="sm:col-span-2">
              <EditableField
                label="Address"
                value={details.address}
                onChange={(v) => setField("address", v)}
                placeholder="Street, City, State, PIN"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t bg-muted/40 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
            <p className="text-xs text-muted-foreground">
              Demo numbers (auto-fill): {DEMO_MOBILES.join(", ")}
            </p>
            <button
              type="submit"
              disabled={!allFilled}
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 ${
          mono ? "font-mono tracking-wide" : ""
        }`}
      />
    </div>
  );
}
