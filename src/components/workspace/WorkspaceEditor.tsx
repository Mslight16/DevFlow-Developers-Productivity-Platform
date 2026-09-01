import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/browser";
import { projectSchema, snippetSchema, taskSchema, type ProjectInput, type SnippetInput, type TaskInput } from "@/lib/validation";
import type { Project, Snippet, Task } from "@/types/database";

const supabase = createClient();

export function WorkspaceEditor({
  table,
  id,
  projects,
  tasks,
  snippets,
  onDone,
}: {
  table: "projects" | "tasks" | "snippets";
  id?: string;
  projects: Project[];
  tasks: Task[];
  snippets: Snippet[];
  onDone: () => void;
}) {
  const existing =
    table === "projects"
      ? projects.find((item) => item.id === id)
      : table === "tasks"
        ? tasks.find((item) => item.id === id)
        : snippets.find((item) => item.id === id);

  if (table === "projects")
    return <ProjectForm existing={existing as Project | undefined} onDone={onDone} />;

  if (table === "tasks")
    return <TaskForm existing={existing as Task | undefined} projects={projects} onDone={onDone} />;

  return <SnippetForm existing={existing as Snippet | undefined} onDone={onDone} />;
}

function ProjectForm({ existing, onDone }: { existing?: Project; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: existing ?? { name: "", description: "", status: "planning", progress: 0 },
  });

  const submit = async (values: ProjectInput) => {
    const result = existing
      ? await supabase
          .from("projects")
          .update({ ...values, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      : await supabase
          .from("projects")
          .insert({ ...values, user_id: (await supabase.auth.getUser()).data.user?.id });

    if (!result.error) onDone();
  };

  return (
    <FormShell title={existing ? "Edit project" : "New project"} onClose={onDone}>
      <form className="editor-form" onSubmit={handleSubmit(submit)}>
        <Field label="Name" error={errors.name?.message}>
          <input {...register("name")} />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea {...register("description")} />
        </Field>

        <Field label="Status">
          <select {...register("status")}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On hold</option>
            <option value="completed">Completed</option>
          </select>
        </Field>

        <Field label="Progress" error={errors.progress?.message}>
          <input type="number" {...register("progress", { valueAsNumber: true })} />
        </Field>

        <button className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save project"}
        </button>
      </form>
    </FormShell>
  );
}

function TaskForm({ existing, projects, onDone }: { existing?: Task; projects: Project[]; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: existing
      ? {
          title: existing.title,
          description: existing.description,
          status: existing.status,
          priority: existing.priority,
          due_date: existing.due_date ?? "",
          project_id: existing.project_id,
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

  const submit = async (values: TaskInput) => {
    const row = {
      ...values,
      tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      due_date: values.due_date || null,
    };

    const result = existing
      ? await supabase
          .from("tasks")
          .update({ ...row, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      : await supabase
          .from("tasks")
          .insert({ ...row, user_id: (await supabase.auth.getUser()).data.user?.id });

    if (!result.error) onDone();
  };

  return (
    <FormShell title={existing ? "Edit task" : "New task"} onClose={onDone}>
      <form className="editor-form" onSubmit={handleSubmit(submit)}>
        <Field label="Title" error={errors.title?.message}>
          <input {...register("title")} />
        </Field>

        <Field label="Description">
          <textarea {...register("description")} />
        </Field>

        <div className="form-two">
          <Field label="Status">
            <select {...register("status")}>
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </Field>

          <Field label="Priority">
            <select {...register("priority")}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>

        <div className="form-two">
          <Field label="Due date">
            <input type="date" {...register("due_date")} />
          </Field>

          <Field label="Project">
            <select {...register("project_id")}>
              <option value="">No project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tags">
          <input placeholder="api, backend, urgent" {...register("tags")} />
        </Field>

        <button className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save task"}
        </button>
      </form>
    </FormShell>
  );
}

function SnippetForm({ existing, onDone }: { existing?: Snippet; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SnippetInput>({
    resolver: zodResolver(snippetSchema),
    defaultValues: existing
      ? { ...existing, category: existing.category ?? "", tags: existing.tags.join(",") }
      : { title: "", description: "", code: "", language: "typescript", category: "", tags: "" },
  });

  const submit = async (values: SnippetInput) => {
    const row = {
      ...values,
      tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      category: values.category || null,
    };

    const result = existing
      ? await supabase
          .from("snippets")
          .update({ ...row, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      : await supabase
          .from("snippets")
          .insert({ ...row, user_id: (await supabase.auth.getUser()).data.user?.id });

    if (!result.error) onDone();
  };

  return (
    <FormShell title={existing ? "Edit snippet" : "New snippet"} onClose={onDone}>
      <form className="editor-form" onSubmit={handleSubmit(submit)}>
        <Field label="Title" error={errors.title?.message}>
          <input {...register("title")} />
        </Field>

        <Field label="Description">
          <textarea {...register("description")} />
        </Field>

        <div className="form-two">
          <Field label="Language">
            <input {...register("language")} />
          </Field>

          <Field label="Category">
            <input {...register("category")} />
          </Field>
        </div>

        <Field label="Tags">
          <input {...register("tags")} />
        </Field>

        <Field label="Code" error={errors.code?.message}>
          <textarea className="code-input" {...register("code")} />
        </Field>

        <button className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save snippet"}
        </button>
      </form>
    </FormShell>
  );
}

function FormShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-backdrop">
      <section className="editor-modal">
        <div className="panel-heading">
          <h2>{title}</h2>

          <button onClick={onClose}>Close</button>
        </div>

        {children}
      </section>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
      {error && <small className="form-error">{error}</small>}
    </label>
  );
}
