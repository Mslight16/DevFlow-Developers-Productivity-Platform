"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState(""); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const { data, error: authError } = await createClient().auth.signUp({ email, password, options: { data: { display_name: name } } }); if (authError) setError(authError.message); else if (data.session) router.push("/"); else setMessage("Check your email to confirm your account."); setLoading(false); }
  return <main className="auth-page"><div className="auth-brand">dev<span>flow</span></div><section className="auth-card"><p className="eyebrow">Your developer workspace</p><h1>Create your account</h1><p className="subtitle">A calmer place to plan, build, and ship.</p><form className="auth-form" onSubmit={submit}><label>Display name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="form-error">{error}</p>}{message && <p className="form-success">{message}</p>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</button><p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p></form></section></main>;
}