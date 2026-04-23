import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export type Decision = "Approve" | "Step-up" | "Reject";

interface Props {
  decision: Decision | null;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function DecisionModal({ decision, onClose, onConfirmed }: Props) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!decision) setConfirmed(false);
  }, [decision]);

  useEffect(() => {
    if (!confirmed) return;
    const t = window.setTimeout(onConfirmed, 1400);
    return () => window.clearTimeout(t);
  }, [confirmed, onConfirmed]);

  if (!decision) return null;

  const pastTense =
    decision === "Approve" ? "Approved" : decision === "Reject" ? "Rejected" : "Step-up";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}
      >
        {!confirmed && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {!confirmed ? (
          <>
            <h3 className="text-lg font-semibold tracking-tight">Confirm Decision</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to{" "}
              <span className="font-medium text-foreground">{decision}</span> this case?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                No
              </button>
              <button
                onClick={() => setConfirmed(true)}
                className={`rounded-md px-4 py-2 text-sm font-medium text-primary-foreground transition ${
                  decision === "Reject"
                    ? "bg-destructive hover:bg-destructive/90"
                    : decision === "Approve"
                    ? "bg-success hover:bg-success/90"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                Yes, {decision}
              </button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center animate-[fade-in_0.3s_ease-out]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">Success</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Case has been{" "}
              <span className="font-medium text-foreground">{pastTense}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
