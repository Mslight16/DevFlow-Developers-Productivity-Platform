"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error: resetError } = await createClient().auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage(
        "If an account exists with this email, you will receive a password reset link shortly."
      );
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
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
            Forgot your password?
          </h1>

          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Enter your email address and we&apos;ll send you a link to create a
            new password.
          </p>

          <form className="mt-7 flex flex-col gap-4" onSubmit={submit}>
            <label className="flex flex-col gap-2 text-[11px] font-bold text-[var(--ink)]">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 text-xs font-medium text-[var(--ink)] outline-none shadow-[var(--shadow-inset-sm)] transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(91,141,239,0.12),var(--shadow-inset-sm)]"
                placeholder="you@example.com"
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
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <p className="pt-1 text-center text-[11px] font-medium text-[var(--muted)]">
              Remember your password?{" "}
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