import { z } from "zod";

export const projectSchema = z.object({ name: z.string().trim().min(1, "Name is required").max(120), description: z.string().max(1000), status: z.enum(["planning", "active", "on-hold", "completed"]), progress: z.number().int().min(0).max(100) });
export const taskSchema = z.object({ title: z.string().trim().min(1, "Title is required").max(200), description: z.string().max(2000), status: z.enum(["todo", "in-progress", "completed"]), priority: z.enum(["low", "medium", "high"]), due_date: z.string().optional(), project_id: z.string().nullable(), tags: z.string() });
export const snippetSchema = z.object({ title: z.string().trim().min(1, "Title is required").max(160), description: z.string().max(1000), code: z.string().min(1, "Code is required").max(50000), language: z.string().min(1), category: z.string().max(80), tags: z.string() });
export const aiSchema = z.object({ action: z.enum(["explain", "debug", "tasks", "plan", "github", "assistant"]), prompt: z.string().trim().min(1, "Add a prompt first").max(12000) });
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type SnippetInput = z.infer<typeof snippetSchema>;
