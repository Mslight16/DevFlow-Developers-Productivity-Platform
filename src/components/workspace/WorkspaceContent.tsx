"use client";

import { useState } from "react";
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
import {
  Check,
  Code2,
  Copy,
  FolderKanban,
  Trash2,
} from "lucide-react";
import type { Project, Snippet, Task, TaskStatus } from "@/types/database";
import { aiSchema } from "@/lib/validation";

export function WorkspaceContent({
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
  onEdit: (table: "projects" | "tasks" | "snippets", id: string) => void;
  onDelete: (
    table: "projects" | "tasks" | "snippets",
    id: string,
  ) => Promise<void>;
  onMove: (task: Task, status: TaskStatus) => Promise<void>;
  onNew: () => void;
}) {
  if (active === "Projects")
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.length ? (
          projects.map((project) => (
            <article
              className="group flex items-start gap-3 rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)] transition-all duration-200 hover:-translate-y-0.5"
              key={project.id}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-inset-sm)]">
                <FolderKanban size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold tracking-tight text-[var(--ink)]">
                  {project.name}
                </h2>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                  {project.description || "No description"}
                </p>

                <small className="mt-2 block text-[10px] font-medium capitalize text-[var(--muted)]">
                  {project.status} · {project.progress}%
                </small>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
                  onClick={() => onEdit("projects", project.id)}
                >
                  Edit
                </button>

                <button
                  className="rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-[var(--error)] hover:shadow-[var(--shadow-raised-sm)]"
                  onClick={() => void onDelete("projects", project.id)}
                  aria-label="Delete project"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <Empty label="projects" />
        )}
      </div>
    );

  if (active === "Snippets")
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {snippets.length ? (
          snippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onEdit={() => onEdit("snippets", snippet.id)}
              onDelete={() => void onDelete("snippets", snippet.id)}
            />
          ))
        ) : (
          <Empty label="snippets" />
        )}
      </div>
    );

  if (active === "Kanban")
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {(["todo", "in-progress", "completed"] as TaskStatus[]).map(
          (status) => (
            <div
              className="min-h-[300px] rounded-2xl bg-[var(--background)] p-4 shadow-[var(--shadow-inset)]"
              key={status}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold capitalize text-[var(--ink)]">
                  {status === "in-progress" ? "In progress" : status}
                </h2>

                <span className="rounded-full bg-[var(--background)] px-2.5 py-1 text-[10px] font-semibold text-[var(--muted)] shadow-[var(--shadow-inset-sm)]">
                  {tasks.filter((task) => task.status === status).length}
                </span>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <article
                      className="grid gap-2.5 rounded-xl bg-[var(--background)] p-4 shadow-[var(--shadow-raised-sm)] transition-transform duration-200 hover:-translate-y-0.5"
                      key={task.id}
                    >
                      <strong className="text-xs font-semibold leading-5 text-[var(--ink)]">
                        {task.title}
                      </strong>

                      <span className="text-[10px] capitalize text-[var(--muted)]">
                        {task.priority} priority
                      </span>

                      <select
                        className="w-full rounded-lg border border-[var(--line)] bg-[var(--background)] px-2.5 py-2 text-[10px] text-[var(--muted)] shadow-[var(--shadow-inset-sm)] outline-none"
                        value={task.status}
                        onChange={(event) =>
                          void onMove(
                            task,
                            event.target.value as TaskStatus,
                          )
                        }
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </article>
                  ))}
              </div>
            </div>
          ),
        )}
      </div>
    );

  if (active === "Analytics") {
    return <Analytics tasks={tasks} projects={projects} />;
  }

  if (active === "GitHub") {
    return <GitHub />;
  }

  if (active === "AI Assistant") {
    return <AI />;
  }

  return (
    <>
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Projects" value={String(projects.length)} />

        <Stat
          title="Open tasks"
          value={String(
            tasks.filter((task) => task.status !== "completed").length,
          )}
        />

        <Stat
          title="Completed"
          value={String(
            tasks.filter((task) => task.status === "completed").length,
          )}
        />

        <Stat title="Snippets" value={String(snippets.length)} />
      </div>

      <div className="rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[var(--ink)]">
              Recent tasks
            </h2>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              Live Supabase data
            </p>
          </div>

          <button
            className="rounded-xl px-3 py-2 text-xs font-bold text-[var(--primary)] transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
            onClick={onNew}
          >
            Add task
          </button>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {tasks.slice(0, 6).map((task) => (
            <div
              className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              key={task.id}
            >
              <button
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                  task.status === "completed"
                    ? "bg-[var(--success)] text-white shadow-none"
                    : "bg-[var(--background)] text-transparent shadow-[var(--shadow-inset-sm)] hover:shadow-[var(--shadow-raised-sm)]"
                }`}
                onClick={() =>
                  void onMove(
                    task,
                    task.status === "completed" ? "todo" : "completed",
                  )
                }
                aria-label="Toggle task"
              >
                {task.status === "completed" && <Check size={12} />}
              </button>

              <div className="min-w-0 flex-1">
                <strong
                  className={`block truncate text-xs font-semibold ${
                    task.status === "completed"
                      ? "text-[var(--muted)] line-through"
                      : "text-[var(--ink)]"
                  }`}
                >
                  {task.title}
                </strong>

                <span className="mt-1 block text-[10px] capitalize text-[var(--muted)]">
                  {task.status} · {task.priority}
                </span>
              </div>

              <button
                className="rounded-lg p-2 text-[var(--muted)] opacity-60 transition-all hover:bg-[var(--background)] hover:text-[var(--error)] hover:shadow-[var(--shadow-raised-sm)] group-hover:opacity-100"
                onClick={() => void onDelete("tasks", task.id)}
                aria-label="Delete task"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {!tasks.length && <Empty label="tasks" />}
      </div>
    </>
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
  const [copied, setCopied] = useState(false);

  return (
    <article className="group flex items-start gap-3 rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)] transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-inset-sm)]">
        <Code2 size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-[var(--ink)]">
          {snippet.title}
        </h2>

        <p className="mt-1 line-clamp-3 font-mono text-[11px] leading-5 text-[var(--muted)]">
          {snippet.code.slice(0, 90)}
        </p>

        <small className="mt-2 block text-[10px] capitalize text-[var(--muted)]">
          {snippet.language}
          {snippet.category ? ` · ${snippet.category}` : ""}
        </small>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          className="rounded-lg p-2 text-[var(--muted)] transition-all hover:bg-[var(--background)] hover:text-[var(--primary)] hover:shadow-[var(--shadow-raised-sm)]"
          onClick={() => {
            void navigator.clipboard.writeText(snippet.code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          aria-label="Copy snippet"
        >
          <Copy size={15} />
        </button>

        {copied && (
          <span className="hidden text-[10px] font-semibold text-[var(--success)] sm:block">
            Copied
          </span>
        )}

        <button
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--primary)] transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
          onClick={onEdit}
        >
          Edit
        </button>

        <button
          className="rounded-lg p-2 text-[var(--muted)] transition-all hover:bg-[var(--background)] hover:text-[var(--error)] hover:shadow-[var(--shadow-raised-sm)]"
          onClick={onDelete}
          aria-label="Delete snippet"
        >
          <Trash2 size={15} />
        </button>
      </div>
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
      value: tasks.filter((task) => task.status === "todo").length,
    },
    {
      name: "Active",
      value: tasks.filter((task) => task.status === "in-progress").length,
    },
    {
      name: "Done",
      value: tasks.filter((task) => task.status === "completed").length,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)]">
        <h2 className="text-sm font-bold text-[var(--ink)]">
          Task status distribution
        </h2>

        <div className="mt-5 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statuses}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                label
              >
                {statuses.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={["#d9a04f", "#5b85b5", "#2c8c72"][index]}
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)]">
        <h2 className="text-sm font-bold text-[var(--ink)]">
          Project progress
        </h2>

        <div className="mt-5 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projects}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />

              <Bar dataKey="progress" fill="#5b8def" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function GitHub() {
  const [data, setData] = useState<unknown[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(action: string, repo?: string) {
    setLoading(true);
    setError("");

    const response = await fetch(
      `/api/github?action=${action}${
        repo ? `&repo=${encodeURIComponent(repo)}` : ""
      }`,
    );

    const result = (await response.json()) as {
      success: boolean;
      data?: unknown[];
      error?: string;
    };

    if (!response.ok || !result.success) {
      setError(result.error ?? "GitHub unavailable");
    } else {
      setData(result.data ?? []);
    }

    setLoading(false);
  }

  async function connect() {
    const response = await fetch("/api/github", {
      method: "POST",
    });

    const result = (await response.json()) as {
      data?: {
        url: string;
      };
    };

    if (result.data?.url) {
      window.location.assign(result.data.url);
    }
  }

  return (
    <div className="rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-[var(--ink)]">
            GitHub activity
          </h2>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            Repositories, commits, and recent activity
          </p>
        </div>

        <button
          className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)]"
          onClick={() => void connect()}
        >
          Connect GitHub
        </button>
      </div>

      <div className="my-4 flex flex-wrap gap-2">
        <button
          className="rounded-xl px-3 py-2 text-[11px] font-bold text-[var(--primary)] transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
          onClick={() => void load("repos")}
        >
          Load repositories
        </button>

        <button
          className="rounded-xl px-3 py-2 text-[11px] font-bold text-[var(--primary)] transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
          onClick={() => void load("activity")}
        >
          Load activity
        </button>
      </div>

      {data.length > 0 && (
        <button
          className="mb-4 rounded-xl px-3 py-2 text-[11px] font-bold text-[var(--primary)] transition-all hover:bg-[var(--background)] hover:shadow-[var(--shadow-raised-sm)]"
          onClick={() => {
            const first = data[0] as { full_name?: string };

            if (first.full_name) {
              void load("commits", first.full_name);
            }
          }}
        >
          Load commits for first repository
        </button>
      )}

      {loading && <Empty label="GitHub data is loading" />}

      {error && (
        <div className="rounded-xl bg-[var(--background)] p-4 text-center text-xs text-[var(--error)] shadow-[var(--shadow-inset)]">
          {error}
        </div>
      )}

      <pre className="max-h-[420px] overflow-auto rounded-xl bg-[var(--ink)] p-4 font-mono text-[11px] leading-6 text-[#dce6f5] shadow-[var(--shadow-inset)]">
        {data.length
          ? JSON.stringify(data.slice(0, 10), null, 2)
          : "Connect GitHub to view repositories and activity."}
      </pre>
    </div>
  );
}

function AI() {
  const [action, setAction] = useState("assistant");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    const parsed = aiSchema.safeParse({ action, prompt });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid request");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${action}: ${prompt}`,
      }),
    });

    const result = (await response.json()) as {
      success: boolean;
      data?: {
        text: string;
        provider: string;
      };
      error?: string;
    };

    if (!response.ok || !result.success) {
      setError(result.error ?? "Assistant unavailable");
    } else {
      setAnswer(
        `${result.data?.text ?? ""}\n\nProvider: ${
          result.data?.provider ?? "unknown"
        }`,
      );
    }

    setLoading(false);
  }

  return (
    <section className="grid gap-4 rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)]">
      <div>
        <h2 className="text-sm font-bold text-[var(--ink)]">
          AI developer assistant
        </h2>

        <p className="mt-1 text-[10px] text-[var(--muted)]">
          Explain, debug, plan, or work through development problems.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Field label="Action">
          <select
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3 py-2.5 text-xs font-medium text-[var(--ink)] shadow-[var(--shadow-inset-sm)] outline-none"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          >
            <option value="explain">Explain Code</option>
            <option value="debug">Debug Code</option>
            <option value="tasks">Generate Tasks</option>
            <option value="plan">Project Planning</option>
            <option value="github">GitHub Summary</option>
            <option value="assistant">Developer Assistant</option>
          </select>
        </Field>
      </div>

      <textarea
        className="min-h-[150px] w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--background)] p-3 text-xs leading-6 text-[var(--ink)] shadow-[var(--shadow-inset-sm)] outline-none transition-shadow focus:shadow-[var(--shadow-inset)]"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Paste code or describe what you need..."
      />

      <button
        className="w-fit rounded-xl bg-[var(--primary)] px-5 py-2.5 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        onClick={() => void ask()}
      >
        {loading ? "Thinking..." : "Run assistant"}
      </button>

      {error && <p className="text-xs text-[var(--error)]">{error}</p>}

      {answer && (
        <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl bg-[var(--ink)] p-4 font-mono text-[11px] leading-6 text-[#dce6f5] shadow-[var(--shadow-inset)]">
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
    <div className="group flex items-center gap-4 rounded-2xl bg-[var(--background)] p-5 shadow-[var(--shadow-raised)] transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--background)] text-[var(--primary)] shadow-[var(--shadow-inset-sm)]">
        <Check size={18} />
      </div>

      <div className="min-w-0">
        <span className="block text-[10px] font-semibold text-[var(--muted)]">
          {title}
        </span>

        <strong className="mt-1 block text-2xl font-bold tracking-tight text-[var(--ink)]">
          {value}
        </strong>

        <small className="mt-1 block text-[9px] text-[var(--muted)]">
          Live workspace data
        </small>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-[var(--background)] px-6 py-10 text-center text-xs text-[var(--muted)] shadow-[var(--shadow-inset)]">
      No {label} yet. Create your first one to get started.
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
    <label className="grid gap-1.5 text-[11px] font-bold text-[var(--ink)]">
      {label}

      {children}

      {error && (
        <small className="text-[11px] font-medium text-[var(--error)]">
          {error}
        </small>
      )}
    </label>
  );
}

export { Field, Empty, Stat };