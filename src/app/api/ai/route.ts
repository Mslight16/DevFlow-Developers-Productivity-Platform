import { NextResponse } from "next/server";
import { z } from "zod";
import { generateWithFallback } from "@/lib/ai/providers";

const requestSchema = z.object({ prompt: z.string().trim().min(1).max(12000) });
export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const result = await generateWithFallback(body.prompt);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Prompt must be between 1 and 12,000 characters."
        : "AI providers are unavailable. Check configuration and try again.";
    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof z.ZodError ? 400 : 503 },
    );
  }
}
