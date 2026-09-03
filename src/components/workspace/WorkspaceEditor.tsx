import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/browser";
import {
  projectSchema,
  snippetSchema,
  taskSchema,
  type ProjectInput,
  type SnippetInput,
  type TaskInput,
} from "@/lib/validation";
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

  if (table === "projects") {
    return (
      <ProjectForm
        existing={existing as Project | undefined}
        onDone={onDone}
      />
    );
  }

  if (table === "tasks") {
    return (
      <TaskForm
        existing={existing as Task | undefined}
        projects={projects}
        onDone={onDone}
      />
    );
  }

  return (
    <SnippetForm
      existing={existing as Snippet | undefined}
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
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues:
      existing ?? {
        name: "",
        description: "",
        status: "planning",
        progress: 0,
      },
  });

  const submit = async (values: ProjectInput) => {
    const result = existing
      ? await supabase
          .from("projects")
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
      : await supabase
          .from("projects")
          .insert({
            ...values,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });

    if (!result.error) onDone();
  };

  return (
    <FormShell
      title={existing ? "Edit project" : "New project"}
      onClose={onDone}
    >
      <form
        className="grid gap-5"
        onSubmit={handleSubmit(submit)}
      >
        <Field label="Name" error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Enter project name"
            className={inputClass}
          />
        </Field>

        <Field
          label="Description"
          error={errors.description?.message}
        >
          <textarea
            {...register("description")}
            placeholder="What is this project about?"
            className={`${inputClass} min-h-[110px] resize-y`}
          />
        </Field>

        <Field label="Status">
          <select
            {...register("status")}
            className={inputClass}
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On hold</option>
            <option value="completed">Completed</option>
          </select>
        </Field>

        <Field label="Progress" error={errors.progress?.message}>
          <input
            type="number"
            min="0"
            max="100"
            {...register("progress", {
              valueAsNumber: true,
            })}
            className={inputClass}
          />
        </Field>

        <SubmitButton
          disabled={isSubmitting}
          label="Save project"
          loadingLabel="Saving..."
        />
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
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      due_date: values.due_date || null,
    };

    const result = existing
      ? await supabase
          .from("tasks")
          .update({
            ...row,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
      : await supabase
          .from("tasks")
          .insert({
            ...row,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });

    if (!result.error) onDone();
  };

  return (
    <FormShell
      title={existing ? "Edit task" : "New task"}
      onClose={onDone}
    >
      <form
        className="grid gap-5"
        onSubmit={handleSubmit(submit)}
      >
        <Field label="Title" error={errors.title?.message}>
          <input
            {...register("title")}
            placeholder="What needs to be done?"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            {...register("description")}
            placeholder="Add more details..."
            className={`${inputClass} min-h-[110px] resize-y`}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select
              {...register("status")}
              className={inputClass}
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </Field>

          <Field label="Priority">
            <select
              {...register("priority")}
              className={inputClass}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Due date">
            <input
              type="date"
              {...register("due_date")}
              className={inputClass}
            />
          </Field>

          <Field label="Project">
            <select
              {...register("project_id")}
              className={inputClass}
            >
              <option value="">No project</option>

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
            className={inputClass}
          />
        </Field>

        <SubmitButton
          disabled={isSubmitting}
          label="Save task"
          loadingLabel="Saving..."
        />
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
    formState: { errors, isSubmitting },
  } = useForm<SnippetInput>({
    resolver: zodResolver(snippetSchema),
    defaultValues: existing
      ? {
          ...existing,
          category: existing.category ?? "",
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

  const submit = async (values: SnippetInput) => {
    const row = {
      ...values,
      tags: values.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      category: values.category || null,
    };

    const result = existing
      ? await supabase
          .from("snippets")
          .update({
            ...row,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
      : await supabase
          .from("snippets")
          .insert({
            ...row,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });

    if (!result.error) onDone();
  };

  return (
    <FormShell
      title={existing ? "Edit snippet" : "New snippet"}
      onClose={onDone}
    >
      <form
        className="grid gap-5"
        onSubmit={handleSubmit(submit)}
      >
        <Field label="Title" error={errors.title?.message}>
          <input
            {...register("title")}
            placeholder="Snippet title"
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            {...register("description")}
            placeholder="What does this snippet do?"
            className={`${inputClass} min-h-[90px] resize-y`}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Language">
            <input
              {...register("language")}
              placeholder="typescript"
              className={inputClass}
            />
          </Field>

          <Field label="Category">
            <input
              {...register("category")}
              placeholder="utility"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Tags">
          <input
            {...register("tags")}
            placeholder="react, hooks, utility"
            className={inputClass}
          />
        </Field>

        <Field label="Code" error={errors.code?.message}>
          <textarea
            className={`${inputClass} min-h-[260px] resize-y font-mono text-[12px] leading-6`}
            {...register("code")}
            placeholder="// Write your code here..."
            spellCheck={false}
          />
        </Field>

        <SubmitButton
          disabled={isSubmitting}
          label="Save snippet"
          loadingLabel="Saving..."
        />
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
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[3px]">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--background)] p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[var(--ink)]">
              {title}
            </h2>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              Keep your workspace data organized.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-[var(--muted)] transition-all hover:bg-[var(--background)] hover:text-[var(--ink)] hover:shadow-[var(--shadow-raised-sm)]"
          >
            Close
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

function SubmitButton({
  disabled,
  label,
  loadingLabel,
}: {
  disabled: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-1 w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-xs font-bold text-white shadow-[var(--shadow-raised-sm)] transition-all duration-200 hover:bg-[var(--primary-hover)] active:shadow-[var(--shadow-inset-sm)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {disabled ? loadingLabel : label}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--background)] px-3.5 py-3 text-xs text-[var(--ink)] shadow-[var(--shadow-inset-sm)] outline-none transition-all placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:shadow-[var(--shadow-inset)]";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-bold text-[var(--ink)]">
        {label}
      </span>

      {children}

      {error && (
        <small className="text-[10px] font-medium text-[var(--error)]">
          {error}
        </small>
      )}
    </label>
  );
}