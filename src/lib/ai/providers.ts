export type AIResponse = {
  text: string;
  provider: "groq" | "openrouter";
};

export interface AIProvider {
  generate(prompt: string): Promise<AIResponse>;
}

class ProviderError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

async function request(
  url: string,
  key: string,
  model: string,
  prompt: string,
  provider: AIResponse["provider"],
): Promise<AIResponse> {
  if (!key) {
    throw new ProviderError(`${provider} is not configured`, 401);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");

    throw new ProviderError(
      `${provider} request failed (${response.status})${
        errorText ? `: ${errorText.slice(0, 300)}` : ""
      }`,
      response.status,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new ProviderError(
      `${provider} returned an empty response`,
    );
  }

  return {
    text,
    provider,
  };
}

export const groq: AIProvider = {
  generate: (prompt) =>
    request(
      "https://api.groq.com/openai/v1/chat/completions",
      process.env.GROQ_API_KEY ?? "",
      "llama-3.3-70b-versatile",
      prompt,
      "groq",
    ),
};

export const openRouter: AIProvider = {
  generate: (prompt) =>
    request(
      "https://openrouter.ai/api/v1/chat/completions",
      process.env.OPENROUTER_API_KEY ?? "",
      "openrouter/free",
      prompt,
      "openrouter",
    ),
};

export async function generateWithFallback(
  prompt: string,
): Promise<AIResponse> {
  try {
    return await groq.generate(prompt);
  } catch (groqError) {
    console.error("Groq failed:", groqError);

    try {
      return await openRouter.generate(prompt);
    } catch (openRouterError) {
      console.error("OpenRouter failed:", openRouterError);

      throw new Error(
        "Both Groq and OpenRouter AI providers failed.",
      );
    }
  }
}