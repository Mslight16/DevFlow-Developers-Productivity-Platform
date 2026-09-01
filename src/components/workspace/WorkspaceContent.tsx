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
  onDelete: (table: "projects" | "tasks" | "snippets", id: string) => Promise<void>;
  onMove: (task: Task, status: TaskStatus) => Promise<void>;
  onNew: () => void;
}) {
  if (active === "Projects")
    return (
      <div className="record-grid">
        {projects.length ? (
          projects.map((project) => (
            <article className="record-card" key={project.id}>
              <div className="record-icon">
                <FolderKanban size={17} />
              </div>

              <div>
                <h2>{project.name}</h2>

                <p>{project.description || "No description"}</p>

                <small>
                  {project.status} - {project.progress}%
                </small>
              </div>

              <button onClick={() => onEdit("projects", project.id)}>Edit</button>

              <button
                className="row-menu"
                onClick={() => void onDelete("projects", project.id)}
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
      <div className="kanban-grid">
        {(["todo", "in-progress", "completed"] as TaskStatus[]).map((status) => (
          <div className="kanban-column" key={status}>
            <h2>{status}</h2>

            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <article className="kanban-task" key={task.id}>
                  <strong>{task.title}</strong>

                  <span>{task.priority} priority</span>

                  <select
                    value={task.status}
                    onChange={(event) => void onMove(task, event.target.value as TaskStatus)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </article>
              ))}
          </div>
        ))}
      </div>
    );

  if (active === "Analytics") return <Analytics tasks={tasks} projects={projects} />;

  if (active === "GitHub") return <GitHub />;

  if (active === "AI Assistant") return <AI />;

  return (
    <>
      <div className="stats-grid">
        <Stat title="Projects" value={String(projects.length)} />

        <Stat
          title="Open tasks"
          value={String(tasks.filter((task) => task.status !== "completed").length)}
        />

        <Stat
          title="Completed"
          value={String(tasks.filter((task) => task.status === "completed").length)}
        />

        <Stat title="Snippets" value={String(snippets.length)} />
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Recent tasks</h2>

            <p>Live Supabase data</p>
          </div>

          <button className="text-button" onClick={onNew}>Add task</button>
        </div>

        {tasks.slice(0, 6).map((task) => (
          <div className="task-row" key={task.id}>
            <button
              className={`task-check ${task.status === "completed" ? "checked" : ""}`}
              onClick={() => void onMove(task, task.status === "completed" ? "todo" : "completed")}
              aria-label="Toggle task"
            >
              {task.status === "completed" && <Check size={12} />}
            </button>

            <div className="task-info">
              <strong>{task.title}</strong>

              <span>
                {task.status} - {task.priority}
              </span>
            </div>

            <button
              className="row-menu"
              onClick={() => void onDelete("tasks", task.id)}
              aria-label="Delete task"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

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
    <article className="record-card">
      <div className="record-icon">
        <Code2 size={17} />
      </div>

      <div>
        <h2>{snippet.title}</h2>

        <p>{snippet.code.slice(0, 90)}</p>

        <small>
          {snippet.language} {snippet.category ? `- ${snippet.category}` : ""}
        </small>
      </div>

      <button
        onClick={() => {
          void navigator.clipboard.writeText(snippet.code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
        aria-label="Copy snippet"
      >
        <Copy size={15} />

        {copied ? "Copied" : ""}
      </button>

      <button onClick={onEdit}>Edit</button>

      <button onClick={onDelete} aria-label="Delete snippet">
        <Trash2 size={15} />
      </button>
    </article>
  );
}

function Analytics({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
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
    <div className="analytics-grid">
      <div className="panel analytics-chart">
        <h2>Task status distribution</h2>

        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statuses} dataKey="value" nameKey="name" outerRadius={80} label>
                {statuses.map((entry, index) => (
                  <Cell key={entry.name} fill={["#d9a04f", "#5b85b5", "#2c8c72"][index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel analytics-chart">
        <h2>Project progress</h2>

        <div className="chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projects}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="name" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Bar dataKey="progress" fill="#2c8c72" />
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
      `/api/github?action=${action}${repo ? `&repo=${encodeURIComponent(repo)}` : ""}`,
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
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h2>GitHub activity</h2>

          <p>Repositories, commits, and recent activity</p>
        </div>

        <button className="primary-button" onClick={() => void connect()}>
          Connect GitHub
        </button>
      </div>

      <div className="github-actions">
        <button className="text-button" onClick={() => void load("repos")}>Load repositories</button>
        <button className="text-button" onClick={() => void load("activity")}>Load activity</button>
      </div>

      {data.length > 0 && (
        <button
          className="text-button"
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

      {loading && <div className="state">Loading GitHub...</div>}

      {error && <div className="state error-state">{error}</div>}

      <pre className="github-results">
        {data.length ? JSON.stringify(data.slice(0, 10), null, 2) : "Connect GitHub to view repositories and activity."}
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
      setAnswer(`${result.data?.text ?? ""}\n\nProvider: ${result.data?.provider ?? "unknown"}`);
    }

    setLoading(false);
  }

  return (
    <section className="assistant panel">
      <h2>AI developer assistant</h2>

      <div className="form-two">
        <Field label="Action">
          <select value={action} onChange={(event) => setAction(event.target.value)}>
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
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Paste code or describe what you need..."
      />

      <button className="primary-button" disabled={loading} onClick={() => void ask()}>
        {loading ? "Thinking..." : "Run assistant"}
      </button>

      {error && <p className="form-error">{error}</p>}

      {answer && <pre className="ai-response">{answer}</pre>}
    </section>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon green">
        <Check size={18} />
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>Live workspace data</small>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="state">No {label} yet. Create your first one to get started.</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      {label}

      {children}

      {error && <small className="form-error">{error}</small>}
    </label>
  );
}

export { Field, Empty, Stat };
