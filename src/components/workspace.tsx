"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type {
  Project,
  Snippet,
  Task,
  TaskStatus,
} from "@/types/database";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceContent } from "@/components/workspace/WorkspaceContent";
import { WorkspaceToast } from "@/components/workspace/WorkspaceToast";
import { WorkspaceEditor } from "@/components/workspace/WorkspaceEditor";

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

  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        setAccountOpen(false);
        setMobileSidebarOpen(false);
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

  // Prevent the page behind the mobile drawer from scrolling.
  useEffect(() => {
    if (!mobileSidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const notify = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2000);
  };

  const visible = tasks.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase()),
  );

  async function remove(
    table: "projects" | "tasks" | "snippets",
    id: string,
  ) {
    if (!window.confirm("Delete this item?")) return;

    const result = await supabase
      .from(table)
      .delete()
      .eq("id", id);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    await refresh();
    notify("Deleted");
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
      return;
    }

    setTasks((list) =>
      list.map((item) =>
        item.id === task.id
          ? { ...item, status }
          : item,
      ),
    );

    notify("Status saved");
  }

  async function signOut() {
    setProfileOpen(false);
    setAccountOpen(false);
    setMobileSidebarOpen(false);

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5">
        <div className="flex items-center gap-3 rounded-2xl bg-[var(--background)] px-5 py-4 text-xs font-semibold text-[var(--muted)] shadow-[var(--shadow-raised)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
          Loading DevFlow...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const newItemLabel =
    active === "Projects"
      ? "project"
      : active === "Snippets"
        ? "snippet"
        : "task";

  function handleNavigation(label: string) {
    setActive(label);
    setProfileOpen(false);
    setMobileSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar + mobile drawer */}
        <WorkspaceSidebar
          active={active}
          onSelect={handleNavigation}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main workspace */}
        <div className="min-w-0 flex-1">
          {/* Header */}
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
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            onSetActive={handleNavigation}
            onSignOut={signOut}
          />

          {/* Page content */}
          <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            {/* Page heading */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                  Your private workspace
                </p>

                <h1 className="truncate text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
                  {active}
                </h1>

                <p className="mt-1.5 max-w-xl text-[11px] leading-5 text-[var(--muted)] sm:text-xs">
                  Plan, build, and ship with less context switching.
                </p>
              </div>

              <button
                type="button"
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all duration-200 hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)] sm:w-auto"
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
                <Plus size={16} />
                New {newItemLabel}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-[var(--background)] p-4 text-xs text-[var(--error)] shadow-[var(--shadow-inset)] sm:flex-row sm:items-center sm:justify-between">
                <span className="break-words">{error}</span>

                <button
                  type="button"
                  className="w-fit rounded-lg px-3 py-2 text-[10px] font-bold text-[var(--primary)] shadow-[var(--shadow-raised-sm)] transition-all hover:shadow-[var(--shadow-inset-sm)]"
                  onClick={() => void refresh()}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Workspace content */}
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-[var(--background)] shadow-[var(--shadow-inset)]">
                <div className="flex items-center gap-3 text-xs font-semibold text-[var(--muted)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
                  Loading your workspace...
                </div>
              </div>
            ) : (
              <WorkspaceContent
                active={active}
                projects={projects}
                tasks={visible}
                snippets={snippets}
                onEdit={(table, id) =>
                  setEditing({ table, id })
                }
                onDelete={remove}
                onMove={move}
                onNew={() =>
                  setEditing({ table: "tasks" })
                }
              />
            )}
          </main>
        </div>
      </div>

      {/* Editor */}
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

      {/* Toast */}
      <WorkspaceToast toast={toast} />
    </div>
  );
}

