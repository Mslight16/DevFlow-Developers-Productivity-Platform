"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/browser";
import type { Project, Snippet, Task, TaskStatus } from "@/types/database";
import {
  aiSchema,
  projectSchema,
  snippetSchema,
  taskSchema,
  type ProjectInput,
  type SnippetInput,
  type TaskInput,
} from "@/lib/validation";
import {
  BarChart3,
  Check,
  Code2,
  Copy,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Sparkles,
  Terminal,
  Trash2,
  UserCircle,
} from "lucide-react";

const icons = [
  LayoutDashboard,
  FolderKanban,
  Check,
  Check,
  GitBranch,
  Code2,
  BarChart3,
  Sparkles,
];

const sections = [
  "Overview",
  "Projects",
  "Tasks",
  "Kanban",
  "GitHub",
  "Snippets",
  "Analytics",
  "AI Assistant",
];

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
  const [user, setUser] = useState<{
    email?: string | null;
   user_metadata?: {
  user_name?: string;
  display_name?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  preferred_username?: string;
};
  } | null>(null);

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
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Terminal size={18} />
          </div>

          <span>
            dev<span>flow</span>
          </span>
        </div>

        <nav>
          <p className="nav-label">Workspace</p>

          {sections.map((label, index) => {
            const Icon = icons[index];

            return (
              <button
                className={`nav-item ${
                  active === label ? "active" : ""
                }`}
                key={label}
                onClick={() => setActive(label)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <Sparkles size={16} />

            <strong>Developer assistant</strong>

            <p>Groq first, OpenRouter fallback.</p>

            <button onClick={() => setActive("AI Assistant")}>
              Open assistant
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header
          className="topbar"
          style={{
            position: "relative",
          }}
        >
          <div className="breadcrumbs">
            <span>Workspace</span>
            <i>/</i>
            <strong>{active}</strong>
          </div>

          <label className="search-trigger">
            <Search size={17} />

            <input
              aria-label="Search tasks"
              placeholder="Search tasks"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          {/* Profile button + attached profile dialog */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
          <span className="welcome-user">
  Hi, <strong>{accountName}!</strong>
</span>
            <button
              className="icon-button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              style={{
                width: 38,
                height: 38,
                padding: 0,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <UserCircle size={30} />
              )}
            </button>

            {profileOpen && (
              <div
                role="dialog"
                aria-label="Profile menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 300,
                  background: "#252d38",
                  border: "1px solid #3a4552",
                  borderRadius: 14,
                  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.4)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                {/* Account header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      minWidth: 42,
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#17382e",
                      color: "#d8eee5",
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      accountName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 14,
                        color: "#f1f5f4",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {accountName}
                    </strong>

                    <span
                      style={{
                        fontSize: 12,
                        color: "#8d9995",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 210,
                      }}
                    >
                      {user?.email || "No email on file"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    height: 1,
                    background: "#3a4552",
                  }}
                />

                {/* Account */}
                <button
                  type="button"
                onClick={() => {
  setProfileOpen(false);
  setAccountOpen(true);
}}
                  style={{
                    width: "100%",
                    border: 0,
                    background: "transparent",
                    color: "#d8dfdd",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <UserCircle size={18} />

                  <span>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      Account
                    </strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: 2,
                        color: "#7f8d87",
                        fontSize: 11,
                      }}
                    >
                      {user?.email || "Manage your account"}
                    </small>
                  </span>
                </button>
                

                {/* GitHub */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    setActive("GitHub");
                  }}
                  style={{
                    width: "100%",
                    border: 0,
                    background: "transparent",
                    color: "#d8dfdd",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <GitBranch size={18} />

                  <span>
                    <strong
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      GitHub
                    </strong>

                    <small
                      style={{
                        display: "block",
                        marginTop: 2,
                        color: "#7f8d87",
                        fontSize: 11,
                      }}
                    >
                      Connect and manage GitHub
                    </small>
                  </span>
                </button>

                <div
                  style={{
                    height: 1,
                    background: "#3a4552",
                    margin: "4px 0",
                  }}
                />

                {/* Sign out */}
                <button
                  type="button"
                  onClick={() => void signOut()}
                  style={{
                    width: "100%",
                    border: 0,
                    background: "transparent",
                    color: "#ef9a9a",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "rgba(239,154,154,0.08)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={18} />

                  <span>Sign out</span>
                </button>
              </div>
            )}

            {accountOpen && (
              <div className="modal-backdrop">
                <section className="account-dialog">
                  <div className="account-dialog-header">
                    <div>
                      <p className="eyebrow">Account</p>
                      <h2>Account details</h2>
                      <p className="subtitle">
                        Manage your DevFlow account.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => setAccountOpen(false)}
                      aria-label="Close account dialog"
                    >
                      ×
                    </button>
                  </div>
                  <div className="account-details">
                    <div className="account-profile-preview">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={accountName} />
                      ) : (
                        <span>
                          {accountName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="account-field">
                      <span className="account-field-label">
                        Display name
                      </span>
                      <strong>{accountName}</strong>
                    </div>
                    <div className="account-field">
                      <span className="account-field-label">
                        Email
                      </span>
                      <strong>
                        {user?.email || "No email"}
                      </strong>
                    </div>
                    <div className="account-actions">
                      <button
                        type="button"
                        className="primary-button"
                      >
                        Edit profile
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </header>

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
            <div className="state">
              Loading your workspace...
            </div>
          ) : (
            <Content
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
        </div>
      </main>

      {editing && (
        <Editor
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

      {toast && (
        <div className="toast">
          <Check size={15} /> {toast}
        </div>
      )}
    </div>
  );
}
function Content({
  active,
  projects,
  tasks,
  snippets,
  onEdit,
  onDelete,
  onMove,
  onNew,
}: {
  active: string;
  projects: Project[];
  tasks: Task[];
  snippets: Snippet[];
  onEdit: (
    table: "projects" | "tasks" | "snippets",
    id: string,
  ) => void;
  onDelete: (
    table: "projects" | "tasks" | "snippets",
    id: string,
  ) => Promise<void>;
  onMove: (
    task: Task,
    status: TaskStatus,
  ) => Promise<void>;
  onNew: () => void;
}) {
  if (active === "Projects")
    return (
      <div className="record-grid">
        {projects.length ? (
          projects.map((project) => (
            <article
              className="record-card"
              key={project.id}
            >
              <div className="record-icon">
                <FolderKanban size={17} />
              </div>

              <div>
                <h2>{project.name}</h2>

                <p>
                  {project.description ||
                    "No description"}
                </p>

                <small>
                  {project.status} -{" "}
                  {project.progress}%
                </small>
              </div>

              <button
                onClick={() =>
                  onEdit("projects", project.id)
                }
              >
                Edit
              </button>

              <button
                className="row-menu"
                onClick={() =>
                  void onDelete(
                    "projects",
                    project.id,
                  )
                }
                aria-label="Delete project"
              >
                <Trash2 size={15} />
              </button>
            </article>
          ))
        ) : (
          <Empty label="projects" />
        )}
      </div>
    );

  if (active === "Snippets")
    return (
      <div className="record-grid">
        {snippets.length ? (
          snippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={() =>
                onEdit(
                  "snippets",
                  snippet.id,
                )
              }
              onDelete={() =>
                void onDelete(
                  "snippets",
                  snippet.id,
                )
              }
            />
          ))
        ) : (
          <Empty label="snippets" />
        )}
      </div>
    );

  if (active === "Kanban")
    return (
      <div className="kanban-grid">
        {(
          [
            "todo",
            "in-progress",
            "completed",
          ] as TaskStatus[]
        ).map((status) => (
          <div
            className="kanban-column"
            key={status}
          >
            <h2>{status}</h2>

            {tasks
              .filter(
                (task) =>
                  task.status === status,
              )
              .map((task) => (
                <article
                  className="kanban-task"
                  key={task.id}
                >
                  <strong>
                    {task.title}
                  </strong>

                  <span>
                    {task.priority} priority
                  </span>

                  <select
                    value={task.status}
                    onChange={(event) =>
                      void onMove(
                        task,
                        event.target
                          .value as TaskStatus,
                      )
                    }
                  >
                    <option value="todo">
                      Todo
                    </option>

                    <option value="in-progress">
                      In progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                </article>
              ))}
          </div>
        ))}
      </div>
    );

  if (active === "Analytics")
    return (
      <Analytics
        tasks={tasks}
        projects={projects}
      />
    );

  if (active === "GitHub")
    return <GitHub />;

  if (active === "AI Assistant")
    return <AI />;

  return (
    <>
      <div className="stats-grid">
        <Stat
          title="Projects"
          value={String(projects.length)}
        />

        <Stat
          title="Open tasks"
          value={String(
            tasks.filter(
              (task) =>
                task.status !==
                "completed",
            ).length,
          )}
        />

        <Stat
          title="Completed"
          value={String(
            tasks.filter(
              (task) =>
                task.status ===
                "completed",
            ).length,
          )}
        />

        <Stat
          title="Snippets"
          value={String(snippets.length)}
        />
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent tasks</h2>

            <p>Live Supabase data</p>
          </div>

          <button
            className="text-button"
            onClick={onNew}
          >
            Add task
          </button>
        </div>

        {tasks.slice(0, 6).map((task) => (
          <div
            className="task-row"
            key={task.id}
          >
            <button
              className={`task-check ${
                task.status ===
                "completed"
                  ? "checked"
                  : ""
              }`}
              onClick={() =>
                void onMove(
                  task,
                  task.status ===
                    "completed"
                    ? "todo"
                    : "completed",
                )
              }
              aria-label="Toggle task"
            >
              {task.status ===
                "completed" && (
                <Check size={12} />
              )}
            </button>

            <div className="task-info">
              <strong>
                {task.title}
              </strong>

              <span>
                {task.status} -{" "}
                {task.priority}
              </span>
            </div>

            <button
              className="row-menu"
              onClick={() =>
                void onDelete(
                  "tasks",
                  task.id,
                )
              }
              aria-label="Delete task"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {!tasks.length && (
          <Empty label="tasks" />
        )}
      </div>
    </>
  );
}

function Editor({
  table,
  id,
  projects,
  tasks,
  snippets,
  onDone,
}: {
  table:
    | "projects"
    | "tasks"
    | "snippets";
  id?: string;
  projects: Project[];
  tasks: Task[];
  snippets: Snippet[];
  onDone: () => void;
}) {
  const existing =
    table === "projects"
      ? projects.find(
          (item) => item.id === id,
        )
      : table === "tasks"
        ? tasks.find(
            (item) => item.id === id,
          )
        : snippets.find(
            (item) => item.id === id,
          );

  if (table === "projects")
    return (
      <ProjectForm
        existing={
          existing as
            | Project
            | undefined
        }
        onDone={onDone}
      />
    );

  if (table === "tasks")
    return (
      <TaskForm
        existing={
          existing as
            | Task
            | undefined
        }
        projects={projects}
        onDone={onDone}
      />
    );

  return (
    <SnippetForm
      existing={
        existing as
          | Snippet
          | undefined
      }
      onDone={onDone}
    />
  );
}

function ProjectForm({
  existing,
  onDone,
}: {
  existing?: Project;
  onDone: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ProjectInput>({
    resolver:
      zodResolver(projectSchema),

    defaultValues:
      existing ?? {
        name: "",
        description: "",
        status: "planning",
        progress: 0,
      },
  });

  const submit = async (
    values: ProjectInput,
  ) => {
    const result = existing
      ? await supabase
          .from("projects")
          .update({
            ...values,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existing.id)
      : await supabase
          .from("projects")
          .insert({
            ...values,
            user_id: (
              await supabase.auth.getUser()
            ).data.user?.id,
          });

    if (!result.error)
      onDone();
  };

  return (
    <FormShell
      title={
        existing
          ? "Edit project"
          : "New project"
      }
      onClose={onDone}
    >
      <form
        className="editor-form"
        onSubmit={handleSubmit(submit)}
      >
        <Field
          label="Name"
          error={errors.name?.message}
        >
          <input {...register("name")} />
        </Field>

        <Field
          label="Description"
          error={
            errors.description?.message
          }
        >
          <textarea
            {...register("description")}
          />
        </Field>

        <Field label="Status">
          <select {...register("status")}>
            <option value="planning">
              Planning
            </option>

            <option value="active">
              Active
            </option>

            <option value="on-hold">
              On hold
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </Field>

        <Field
          label="Progress"
          error={errors.progress?.message}
        >
          <input
            type="number"
            {...register("progress", {
              valueAsNumber: true,
            })}
          />
        </Field>

        <button
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : "Save project"}
        </button>
      </form>
    </FormShell>
  );
}
function TaskForm({
  existing,
  projects,
  onDone,
}: {
  existing?: Task;
  projects: Project[];
  onDone: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<TaskInput>({
    resolver:
      zodResolver(taskSchema),

    defaultValues: existing
      ? {
          title: existing.title,
          description:
            existing.description,
          status: existing.status,
          priority: existing.priority,
          due_date:
            existing.due_date ?? "",
          project_id:
            existing.project_id,
          tags: existing.tags.join(","),
        }
      : {
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          due_date: "",
          project_id: null,
          tags: "",
        },
  });

  const submit = async (
    values: TaskInput,
  ) => {
    const row = {
      ...values,

      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      due_date:
        values.due_date || null,
    };

    const result = existing
      ? await supabase
          .from("tasks")
          .update({
            ...row,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existing.id)
      : await supabase
          .from("tasks")
          .insert({
            ...row,
            user_id: (
              await supabase.auth.getUser()
            ).data.user?.id,
          });

    if (!result.error)
      onDone();
  };

  return (
    <FormShell
      title={
        existing
          ? "Edit task"
          : "New task"
      }
      onClose={onDone}
    >
      <form
        className="editor-form"
        onSubmit={handleSubmit(submit)}
      >
        <Field
          label="Title"
          error={errors.title?.message}
        >
          <input {...register("title")} />
        </Field>

        <Field label="Description">
          <textarea
            {...register("description")}
          />
        </Field>

        <div className="form-two">
          <Field label="Status">
            <select {...register("status")}>
              <option value="todo">
                Todo
              </option>

              <option value="in-progress">
                In progress
              </option>

              <option value="completed">
                Completed
              </option>
            </select>
          </Field>

          <Field label="Priority">
            <select
              {...register("priority")}
            >
              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>
            </select>
          </Field>
        </div>

        <div className="form-two">
          <Field label="Due date">
            <input
              type="date"
              {...register("due_date")}
            />
          </Field>

          <Field label="Project">
            <select
              {...register("project_id")}
            >
              <option value="">
                No project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tags">
          <input
            placeholder="api, backend, urgent"
            {...register("tags")}
          />
        </Field>

        <button
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : "Save task"}
        </button>
      </form>
    </FormShell>
  );
}

function SnippetForm({
  existing,
  onDone,
}: {
  existing?: Snippet;
  onDone: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<SnippetInput>({
    resolver:
      zodResolver(snippetSchema),

    defaultValues: existing
      ? {
          ...existing,
          category:
            existing.category ?? "",
          tags: existing.tags.join(","),
        }
      : {
          title: "",
          description: "",
          code: "",
          language: "typescript",
          category: "",
          tags: "",
        },
  });

  const submit = async (
    values: SnippetInput,
  ) => {
    const row = {
      ...values,

      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      category:
        values.category || null,
    };

    const result = existing
      ? await supabase
          .from("snippets")
          .update({
            ...row,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existing.id)
      : await supabase
          .from("snippets")
          .insert({
            ...row,
            user_id: (
              await supabase.auth.getUser()
            ).data.user?.id,
          });

    if (!result.error)
      onDone();
  };

  return (
    <FormShell
      title={
        existing
          ? "Edit snippet"
          : "New snippet"
      }
      onClose={onDone}
    >
      <form
        className="editor-form"
        onSubmit={handleSubmit(submit)}
      >
        <Field
          label="Title"
          error={errors.title?.message}
        >
          <input {...register("title")} />
        </Field>

        <Field label="Description">
          <textarea
            {...register("description")}
          />
        </Field>

        <div className="form-two">
          <Field label="Language">
            <input
              {...register("language")}
            />
          </Field>

          <Field label="Category">
            <input
              {...register("category")}
            />
          </Field>
        </div>

        <Field label="Tags">
          <input {...register("tags")} />
        </Field>

        <Field
          label="Code"
          error={errors.code?.message}
        >
          <textarea
            className="code-input"
            {...register("code")}
          />
        </Field>

        <button
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : "Save snippet"}
        </button>
      </form>
    </FormShell>
  );
}

function FormShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-backdrop">
      <section className="editor-modal">
        <div className="panel-heading">
          <h2>{title}</h2>

          <button onClick={onClose}>
            Close
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      {label}

      {children}

      {error && (
        <small className="form-error">
          {error}
        </small>
      )}
    </label>
  );
}

function SnippetCard({
  snippet,
  onEdit,
  onDelete,
}: {
  snippet: Snippet;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] =
    useState(false);

  return (
    <article className="record-card">
      <div className="record-icon">
        <Code2 size={17} />
      </div>

      <div>
        <h2>{snippet.title}</h2>

        <p>
          {snippet.code.slice(0, 90)}
        </p>

        <small>
          {snippet.language}{" "}
          {snippet.category
            ? `- ${snippet.category}`
            : ""}
        </small>
      </div>

      <button
        onClick={() => {
          void navigator.clipboard.writeText(
            snippet.code,
          );

          setCopied(true);

          window.setTimeout(
            () => setCopied(false),
            1200,
          );
        }}
        aria-label="Copy snippet"
      >
        <Copy size={15} />

        {copied ? "Copied" : ""}
      </button>

      <button onClick={onEdit}>
        Edit
      </button>

      <button
        onClick={onDelete}
        aria-label="Delete snippet"
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}

function Analytics({
  tasks,
  projects,
}: {
  tasks: Task[];
  projects: Project[];
}) {
  const statuses = [
    {
      name: "Todo",
      value: tasks.filter(
        (task) =>
          task.status === "todo",
      ).length,
    },
    {
      name: "Active",
      value: tasks.filter(
        (task) =>
          task.status ===
          "in-progress",
      ).length,
    },
    {
      name: "Done",
      value: tasks.filter(
        (task) =>
          task.status ===
          "completed",
      ).length,
    },
  ];

  return (
    <div className="analytics-grid">
      <div className="panel analytics-chart">
        <h2>
          Task status distribution
        </h2>

        <div className="chart">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={statuses}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {statuses.map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        [
                          "#d9a04f",
                          "#5b85b5",
                          "#2c8c72",
                        ][index]
                      }
                    />
                  ),
                )}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel analytics-chart">
        <h2>
          Project progress
        </h2>

        <div className="chart">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={projects}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="name" />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip />

              <Bar
                dataKey="progress"
                fill="#2c8c72"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function GitHub() {
  const [data, setData] =
    useState<unknown[]>([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function load(
    action: string,
    repo?: string,
  ) {
    setLoading(true);
    setError("");

    const response = await fetch(
      `/api/github?action=${action}${
        repo
          ? `&repo=${encodeURIComponent(
              repo,
            )}`
          : ""
      }`,
    );

    const result =
      (await response.json()) as {
        success: boolean;
        data?: unknown[];
        error?: string;
      };

    if (
      !response.ok ||
      !result.success
    ) {
      setError(
        result.error ??
          "GitHub unavailable",
      );
    } else {
      setData(result.data ?? []);
    }

    setLoading(false);
  }

  async function connect() {
    const response = await fetch(
      "/api/github",
      {
        method: "POST",
      },
    );

    const result =
      (await response.json()) as {
        data?: {
          url: string;
        };
      };

    if (result.data?.url) {
      window.location.assign(
        result.data.url,
      );
    }
  }

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h2>
            GitHub activity
          </h2>

          <p>
            Repositories, commits,
            and recent activity
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            void connect()
          }
        >
          Connect GitHub
        </button>
      </div>

      <div className="github-actions">
        <button
          className="text-button"
          onClick={() =>
            void load("repos")
          }
        >
          Load repositories
        </button>

        <button
          className="text-button"
          onClick={() =>
            void load("activity")
          }
        >
          Load activity
        </button>
      </div>

      {data.length > 0 && (
        <button
          className="text-button"
          onClick={() => {
            const first =
              data[0] as {
                full_name?: string;
              };

            if (first.full_name) {
              void load(
                "commits",
                first.full_name,
              );
            }
          }}
        >
          Load commits for first
          repository
        </button>
      )}

      {loading && (
        <div className="state">
          Loading GitHub...
        </div>
      )}

      {error && (
        <div className="state error-state">
          {error}
        </div>
      )}

      <pre className="github-results">
        {data.length
          ? JSON.stringify(
              data.slice(0, 10),
              null,
              2,
            )
          : "Connect GitHub to view repositories and activity."}
      </pre>
    </div>
  );
}
function AI() {
  const [action, setAction] =
    useState("assistant");

  const [prompt, setPrompt] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function ask() {
    const parsed =
      aiSchema.safeParse({
        action,
        prompt,
      });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]
          ?.message ??
          "Invalid request",
      );
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch(
      "/api/ai",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          prompt: `${action}: ${prompt}`,
        }),
      },
    );

    const result =
      (await response.json()) as {
        success: boolean;
        data?: {
          text: string;
          provider: string;
        };
        error?: string;
      };

    if (
      !response.ok ||
      !result.success
    ) {
      setError(
        result.error ??
          "Assistant unavailable",
      );
    } else {
      setAnswer(
        `${result.data?.text ?? ""}\n\nProvider: ${
          result.data?.provider ??
          "unknown"
        }`,
      );
    }

    setLoading(false);
  }

  return (
    <section className="assistant panel">
      <h2>
        AI developer assistant
      </h2>

      <div className="form-two">
        <Field label="Action">
          <select
            value={action}
            onChange={(event) =>
              setAction(
                event.target.value,
              )
            }
          >
            <option value="explain">
              Explain Code
            </option>

            <option value="debug">
              Debug Code
            </option>

            <option value="tasks">
              Generate Tasks
            </option>

            <option value="plan">
              Project Planning
            </option>

            <option value="github">
              GitHub Summary
            </option>

            <option value="assistant">
              Developer Assistant
            </option>
          </select>
        </Field>
      </div>

      <textarea
        value={prompt}
        onChange={(event) =>
          setPrompt(event.target.value)
        }
        placeholder="Paste code or describe what you need..."
      />

      <button
        className="primary-button"
        disabled={loading}
        onClick={() => void ask()}
      >
        {loading
          ? "Thinking..."
          : "Run assistant"}
      </button>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      {answer && (
        <pre className="ai-response">
          {answer}
        </pre>
      )}
    </section>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon green">
        <Check size={18} />
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>
          Live workspace data
        </small>
      </div>
    </div>
  );
}

function Empty({
  label,
}: {
  label: string;
}) {
  return (
    <div className="state">
      No {label} yet. Create your
      first one to get started.
    </div>
  );
}