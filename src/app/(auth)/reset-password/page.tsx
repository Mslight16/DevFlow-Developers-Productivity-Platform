"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await createClient().auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Your password has been updated successfully.");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center  px-5 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 text-center">
          <div className="inline-flex items-center text-4xl font-extrabold tracking-tight text-[var(--ink)]">
            dev<span className="text-[var(--primary)]">flow</span>
          </div>
        </div>

        <section className="rounded-[24px] border border-[var(--line)] bg-[var(--background)] p-6 shadow-[var(--shadow-raised)] sm:p-8">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            Account recovery
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            Create a new password
          </h1>

          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Enter your new password below.
          </p>

          <form className="mt-7 flex flex-col gap-4" onSubmit={submit}>
            <label className="flex flex-col gap-2 text-[11px] font-bold text-[var(--ink)]">
              New password

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 text-xs font-medium text-[var(--ink)] outline-none shadow-[var(--shadow-inset-sm)] transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(91,141,239,0.12),var(--shadow-inset-sm)]"
                placeholder="••••••••"
              />
            </label>

            <label className="flex flex-col gap-2 text-[11px] font-bold text-[var(--ink)]">
              Confirm new password

              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 text-xs font-medium text-[var(--ink)] outline-none shadow-[var(--shadow-inset-sm)] transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(91,141,239,0.12),var(--shadow-inset-sm)]"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 px-3.5 py-3 text-[11px] font-semibold leading-5 text-[var(--error)]"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-3.5 py-3 text-[11px] font-semibold leading-5 text-[var(--primary)]"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all duration-200 hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            <p className="pt-1 text-center text-[11px] font-medium text-[var(--muted)]">
              <Link
                href="/login"
                className="font-bold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
