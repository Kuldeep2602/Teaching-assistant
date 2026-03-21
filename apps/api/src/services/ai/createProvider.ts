import { env } from "../../config/env.js";
import { GroqProvider } from "./groqProvider.js";
import { MockAiProvider } from "./mockProvider.js";
import type { AiProvider } from "./provider.js";

type ProviderConfig = {
  AI_PROVIDER_MODE: "auto" | "mock" | "groq";
  GROQ_API_KEY?: string;
};

export type ResolvedProvider = {
  provider: AiProvider;
  providerName: "mock" | "groq";
  reason: string;
};

export const resolveProviderMode = ({
  AI_PROVIDER_MODE,
  GROQ_API_KEY
}: ProviderConfig): Omit<ResolvedProvider, "provider"> => {
  if (AI_PROVIDER_MODE === "mock") {
    return {
      providerName: "mock",
      reason: "Explicit mock mode is enabled."
    };
  }

  if (AI_PROVIDER_MODE === "groq") {
    if (!GROQ_API_KEY) {
      throw new Error("AI_PROVIDER_MODE is set to groq but GROQ_API_KEY is missing.");
    }

    return {
      providerName: "groq",
      reason: "Explicit Groq mode is enabled."
    };
  }

  if (GROQ_API_KEY) {
    return {
      providerName: "groq",
      reason: "Auto mode detected a Groq API key."
    };
  }

  throw new Error(
    "No AI provider is configured. Add GROQ_API_KEY or set AI_PROVIDER_MODE=mock for demo content."
  );
};

export const createAiProvider = (): ResolvedProvider => {
  const resolved = resolveProviderMode({
    AI_PROVIDER_MODE: env.AI_PROVIDER_MODE,
    GROQ_API_KEY: env.GROQ_API_KEY
  });

  return {
    ...resolved,
    provider: resolved.providerName === "groq" ? new GroqProvider() : new MockAiProvider()
  };
};
