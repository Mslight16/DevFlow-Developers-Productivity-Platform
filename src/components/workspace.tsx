"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";
import type { Project, Snippet, Task, TaskStatus } from "@/types/database";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceContent } from "@/components/workspace/WorkspaceContent";
import { WorkspaceToast } from "@/components/workspace/WorkspaceToast";
import { WorkspaceEditor } from "@/components/workspace/WorkspaceEditor";
import { Plus } from "lucide-react";

const supabase = createClient();

export default function Workspace() {
  const [active, setActive] = useState("Overview");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{
    table: "projects" | "tasks" | "snippets";
    id?: string;
  } | null>(null);
  const [toast, setToast] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Profile menu state
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setIsAuthenticated(false);
      setUser(null);
      setAuthReady(true);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setUser(session.user);
    setLoading(true);
    setError("");

    const [p, t, s] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("snippets")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    const issue = p.error ?? t.error ?? s.error;

    if (issue) {
      setError(issue.message);
      setProjects([]);
      setTasks([]);
      setSnippets([]);
    } else {
      setProjects(p.data ?? []);
      setTasks(t.data ?? []);
      setSnippets(s.data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      const authenticated = Boolean(session);

      setIsAuthenticated(authenticated);
      setAuthReady(true);

      if (!authenticated) {
        router.replace("/login");
        return;
      }

      if (session) {
        setUser(session.user);
      }

      await refresh();
    };

    void syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authenticated = Boolean(session);

      setIsAuthenticated(authenticated);
      setAuthReady(true);

      if (!authenticated) {
        setUser(null);
        setProfileOpen(false);
        router.replace("/login");
        return;
      }

      if (session) {
        setUser(session.user);
      }

      void refresh();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refresh, router]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const visible = tasks.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase()),
  );

  async function remove(
    table: "projects" | "tasks" | "snippets",
    id: string,
  ) {
    if (!window.confirm("Delete this item?")) return;

    const result = await supabase.from(table).delete().eq("id", id);

    if (result.error) {
      setError(result.error.message);
    } else {
      await refresh();
      notify("Deleted");
    }
  }

  async function move(task: Task, status: TaskStatus) {
    const result = await supabase
      .from("tasks")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);

    if (result.error) {
      setError(result.error.message);
    } else {
      setTasks((list) =>
        list.map((item) =>
          item.id === task.id ? { ...item, status } : item,
        ),
      );

      notify("Status saved");
    }
  }

  async function signOut() {
    setProfileOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  }

const accountName =
  user?.user_metadata?.user_name ||
  user?.user_metadata?.display_name ||
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  user?.user_metadata?.preferred_username ||
  "User";

  const avatarUrl = user?.user_metadata?.avatar_url;

  if (!authReady) {
    return <div className="state">Loading DevFlow...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-shell">
      <WorkspaceSidebar active={active} onSelect={setActive} />

      <main className="main-content">
        <WorkspaceHeader
          active={active}
          query={query}
          setQuery={setQuery}
          accountName={accountName}
          avatarUrl={avatarUrl}
          user={user}
          profileOpen={profileOpen}
          accountOpen={accountOpen}
          setProfileOpen={setProfileOpen}
          setAccountOpen={setAccountOpen}
          onSetActive={setActive}
          onOpenSettings={() => router.push("/settings")}
          onSignOut={signOut}
        />

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Your private workspace</p>

              <h1>{active}</h1>

              <p className="subtitle">
                Plan, build, and ship with less context switching.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                setEditing({
                  table:
                    active === "Projects"
                      ? "projects"
                      : active === "Snippets"
                        ? "snippets"
                        : "tasks",
                })
              }
            >
              <Plus size={17} /> New{" "}
              {active === "Projects"
                ? "project"
                : active === "Snippets"
                  ? "snippet"
                  : "task"}
            </button>
          </div>

          {error && (
            <div className="state error-state">
              {error}

              <button onClick={() => void refresh()}>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="state">Loading your workspace...</div>
          ) : (
            <WorkspaceContent
              active={active}
              projects={projects}
              tasks={visible}
              snippets={snippets}
              onEdit={(table, id) => setEditing({ table, id })}
              onDelete={remove}
              onMove={move}
              onNew={() => setEditing({ table: "tasks" })}
            />
          )}
        </div>
      </main>

      {editing && (
        <WorkspaceEditor
          table={editing.table}
          id={editing.id}
          projects={projects}
          tasks={tasks}
          snippets={snippets}
          onDone={() => {
            setEditing(null);
            void refresh();
            notify("Saved successfully");
          }}
        />
      )}

      <WorkspaceToast toast={toast} />
    </div>
  );
}
