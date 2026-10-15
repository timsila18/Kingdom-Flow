"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
const steps = [
  "Church details",
  "Leadership",
  "Departments",
  "Review",
  "Submit",
];
const groups = [
  [
    { key: "publicName", label: "Church name", required: true },
    {
      key: "contactEmail",
      label: "Contact email",
      type: "email",
      required: true,
    },
    { key: "contactPhone", label: "Contact phone", type: "tel" },
    { key: "country", label: "Country", required: true },
    { key: "region", label: "Region" },
    { key: "physicalAddress", label: "Address" },
  ],
  [
    { key: "principalLeaderName", label: "Church leader name", required: true },
    { key: "ministryHeadTitle", label: "Church leader title", required: true },
    { key: "principalLeaderEmail", label: "Leader email", type: "email" },
    { key: "firstBranchName", label: "Main church or branch name" },
  ],
  [
    {
      key: "departments",
      label: "Departments (one per line)",
      type: "textarea",
    },
    {
      key: "programmes",
      label: "Classes or programmes (one per line)",
      type: "textarea",
    },
  ],
] as const;
export function ChurchOnboarding({ userId }: { userId: string }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const draftKey = `kingdomflow-church-draft-${userId}`;
  const current = step < 3 ? groups[step] : [];
  const currentKeys = new Set<string>(current.map((field) => field.key));
  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify(values));
      return true;
    } catch {
      setError("Your browser could not save this draft.");
      return false;
    }
  }
  function resume() {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return setError("No saved setup was found on this browser.");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setValues(parsed);
        setError("");
      }
    } catch {
      setError("The saved setup could not be loaded.");
    }
  }
  function next() {
    if (form.current && !form.current.reportValidity()) return;
    setError("");
    setStep(Math.min(4, step + 1));
    saveDraft();
  }
  return (
    <div className="mt-6">
      <ol className="mb-8 flex flex-wrap gap-3">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            className={`flex items-center gap-2 text-sm ${step === index ? "font-semibold text-primary" : "text-muted"}`}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full ${index <= step ? "bg-primary text-white" : "border border-border bg-surface"}`}
            >
              {index < step ? <Check size={16} /> : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      {error ? (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <form
        ref={form}
        action="/onboarding/submit"
        method="post"
        onSubmit={() => setSubmitting(true)}
        className="grid max-w-2xl gap-5"
      >
        <input type="hidden" name="intent" value="submit" />
        {Object.entries(values)
          .filter(([key]) => !currentKeys.has(key))
          .map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        <h2 className="text-xl font-semibold">{steps[step]}</h2>
        {current.map((field) => {
          const type = "type" in field ? field.type : "text";
          const required = "required" in field && field.required;
          return (
            <label key={field.key} className="grid gap-2 text-sm font-medium">
              {field.label}
              {required ? " *" : ""}
              {type === "textarea" ? (
                <textarea
                  rows={4}
                  name={field.key}
                  value={values[field.key] ?? ""}
                  onChange={(event) =>
                    setValues({ ...values, [field.key]: event.target.value })
                  }
                />
              ) : (
                <input
                  type={type}
                  name={field.key}
                  required={required}
                  value={values[field.key] ?? ""}
                  onChange={(event) =>
                    setValues({ ...values, [field.key]: event.target.value })
                  }
                />
              )}
            </label>
          );
        })}
        {step === 3 ? (
          <dl className="grid gap-4">
            {groups.flat().map((field) => (
              <div key={field.key}>
                <dt className="text-sm text-muted">{field.label}</dt>
                <dd className="whitespace-pre-wrap break-words font-medium">
                  {values[field.key] || "Not provided"}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {step === 4 ? (
          <>
            <p className="text-sm text-muted">
              {values.publicName} will be sent for platform approval.
            </p>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="authorized"
                required
                className="mt-1"
              />
              <span>
                I am authorised to register this church and agree to its data
                being managed in KingdomFlow.
              </span>
            </label>
          </>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : null}
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              className="flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              disabled={submitting}
              className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white"
            >
              {submitting ? "Submitting..." : "Submit church"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (saveDraft()) router.push("/auth/workspaces");
            }}
            className="flex min-h-11 items-center gap-2 px-2 text-sm text-primary"
          >
            <Save size={16} />
            Save for later
          </button>
          {step === 0 ? (
            <button
              type="button"
              onClick={resume}
              className="min-h-11 px-2 text-sm text-primary"
            >
              Resume saved setup
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
