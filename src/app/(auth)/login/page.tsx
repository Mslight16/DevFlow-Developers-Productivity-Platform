"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error: authError } = await createClient().auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      router.push("/");
    }

    setLoading(false);
  }

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to return to your workspace."
    >
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

        <label className="flex flex-col gap-2 text-[11px] font-bold text-[var(--ink)]">
          Password

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 pr-11 text-xs font-medium text-[var(--ink)] outline-none shadow-[var(--shadow-inset-sm)] transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(91,141,239,0.12),var(--shadow-inset-sm)]"
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-[var(--muted)] transition-colors hover:text-[var(--ink)] focus:outline-none focus:text-[var(--primary)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={17} strokeWidth={2} />
              ) : (
                <Eye size={17} strokeWidth={2} />
              )}
            </button>
          </div>
        </label>

        <div className="flex justify-end">
  <Link
    href="/forgot-password"
    className="text-[11px] font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
  >
    Forgot password?
  </Link>
</div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 px-3.5 py-3 text-[11px] font-semibold leading-5 text-[var(--error)]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 h-11 rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all duration-200 hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="pt-1 text-center text-[11px] font-medium text-[var(--muted)]">
          New to DevFlow?{" "}
          <Link
            href="/signup"
            className="font-bold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}

function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
            Your developer workspace
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
            {title}
          </h1>

          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            {subtitle}
          </p>

          {children}
        </section>
      </div>
    </main>
  );
}

