"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        const form = new FormData(event.currentTarget);
        const password = String(form.get("password"));
        if (password.length < 12)
          return setError("Use a password of at least 12 characters.");
        if (password !== String(form.get("confirmation")))
          return setError("The passwords do not match.");
        setSaving(true);
        try {
          const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          );
          const { data, error: sessionError } = await client.auth.getSession();
          if (sessionError || !data.session)
            throw new Error(
              "This reset link is missing or expired. Request another link.",
            );
          const { error: updateError } = await client.auth.updateUser({
            password,
          });
          if (updateError) throw new Error(updateError.message);
          await client.auth.signOut();
          router.replace("/auth/logout?reset=1");
        } catch (failure) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Your password could not be updated.",
          );
          setSaving(false);
        }
      }}
    >
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        New password
        <input
          name="password"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Confirm password
        <input
          name="confirmation"
          type="password"
          minLength={12}
          autoComplete="new-password"
          required
        />
      </label>
      <button
        disabled={saving}
        className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-white"
      >
        {saving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
