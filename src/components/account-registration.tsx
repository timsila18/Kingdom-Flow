"use client";
import { useState } from "react";

export function AccountRegistration({
  churches,
  initialMode = "join",
}: {
  churches: { id: string; public_name: string; region: string | null }[];
  initialMode?: "join" | "church";
}) {
  const [mode, setMode] = useState(initialMode);
  return (
    <form method="post" action="/auth/register/submit" className="grid gap-4">
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-2 text-sm font-medium">I want to</legend>
        {(
          [
            ["join", "Join a church"],
            ["church", "Create a church"],
          ] as const
        ).map(([value, label]) => (
          <label
            key={value}
            className={`flex min-h-11 items-center gap-2 rounded-md border p-3 text-sm ${mode === value ? "border-primary bg-primary-soft" : "border-border"}`}
          >
            <input
              type="radio"
              className="h-4 w-4 shrink-0 accent-primary"
              name="mode"
              value={value}
              checked={mode === value}
              onChange={() => setMode(value)}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <label className="grid gap-2 text-sm font-medium">
        Full name
        <input name="name" autoComplete="name" maxLength={200} required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Phone number (optional)
        <input name="phone" type="tel" autoComplete="tel" maxLength={50} />
      </label>
      {mode === "join" ? (
        <label className="grid gap-2 text-sm font-medium">
          Where are you starting?
          <select name="journeyStage" defaultValue="Visitor">
            <option value="Visitor">I am visiting or joining</option>
            <option value="New convert">I am a new believer</option>
          </select>
        </label>
      ) : null}
      {mode === "join" ? (
        <label className="grid gap-2 text-sm font-medium">
          Your church
          <select name="churchId" required defaultValue="">
            <option value="">Select a church</option>
            {churches.map((church) => (
              <option key={church.id} value={church.id}>
                {church.public_name}
                {church.region ? ` (${church.region})` : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {mode === "join" && !churches.length ? (
        <p role="status" className="text-sm text-muted">
          No churches are available to join yet.
        </p>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
        />
      </label>
      <button
        disabled={mode === "join" && !churches.length}
        className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white"
      >
        Create account
      </button>
    </form>
  );
}
