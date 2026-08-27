"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const { error: authError } = await createClient().auth.signInWithPassword({ email, password }); if (authError) setError(authError.message); else router.push("/"); setLoading(false); }
  return <AuthFrame title="Welcome back" subtitle="Sign in to return to your workspace."><form className="auth-form" onSubmit={submit}><label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button><p className="auth-switch">New to DevFlow? <Link href="/signup">Create an account</Link></p></form></AuthFrame>;
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <main className="auth-page"><div className="auth-brand">dev<span>flow</span></div><section className="auth-card"><p className="eyebrow">Your developer workspace</p><h1>{title}</h1><p className="subtitle">{subtitle}</p>{children}</section></main>; }