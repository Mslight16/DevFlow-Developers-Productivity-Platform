"use client";

import { ArrowLeft, Github, LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ email?: string | null; user_metadata?: { full_name?: string; name?: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const syncUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    void syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <div className="state">Loading settings...</div>;
  }

  if (!user) {
    return null;
  }

  const name = user.user_metadata?.full_name || user.user_metadata?.name || "Your account";

  return (
    <main className="auth-page">
      <div className="auth-brand">
        dev<span>flow</span>
      </div>

      <section className="auth-card" style={{ maxWidth: 520 }}>
        <button
          type="button"
          className="text-button"
          onClick={() => router.push("/")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14 }}
        >
          <ArrowLeft size={14} />
          Back to workspace
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div className="workspace-avatar" style={{ width: 42, height: 42, fontSize: 14 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Settings</h1>
            <p style={{ margin: 4, color: "#7f8d87" }}>Manage your DevFlow account</p>
          </div>
        </div>

        <div className="panel" style={{ padding: 18 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <UserCircle size={18} />
              <div>
                <strong style={{ display: "block" }}>{name}</strong>
                <span style={{ color: "#7f8d87", fontSize: 12 }}>{user.email || "No email on file"}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Github size={18} />
              <div>
                <strong style={{ display: "block" }}>GitHub</strong>
                <span style={{ color: "#7f8d87", fontSize: 12 }}>Connect from the GitHub workspace panel if needed.</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <button className="primary-button" type="button" onClick={() => router.push("/")}>
            Open workspace
          </button>

          <button className="nav-item" type="button" onClick={() => void handleSignOut()} style={{ justifyContent: "center" }}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}
