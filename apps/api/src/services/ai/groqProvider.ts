import { env } from "../../config/env.js";
import type { AiProvider, GenerationResult } from "./provider.js";

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export class GroqProvider implements AiProvider {
  private async callGroq(prompt: string, retriesLeft = 3): Promise<Response> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (response.status === 429 && retriesLeft > 0) {
      const waitSeconds = (4 - retriesLeft) * 15;
      console.log(`Groq rate limited, retrying in ${waitSeconds}s (${retriesLeft} retries left)`);
      await new Promise((r) => setTimeout(r, waitSeconds * 1000));
      return this.callGroq(prompt, retriesLeft - 1);
    }

    return response;
  }

  async generatePaper({
    prompt
  }: Parameters<AiProvider["generatePaper"]>[0]): Promise<GenerationResult> {
    if (!env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const response = await this.callGroq(prompt);

    if (!response.ok) {
      const statusMessages: Record<number, string> = {
        400: "The request to the AI service was malformed. Please try again.",
        401: "The AI service API key is invalid. Please check your configuration.",
        403: "The AI service API key does not have permission. Please check your plan.",
        404: "The AI model is unavailable. Please contact support.",
        429: "The AI service is temporarily busy due to rate limits. Please wait a minute and try again.",
        500: "The AI service encountered an internal error. Please try again later.",
        503: "The AI service is temporarily unavailable. Please try again later."
      };
      throw new Error(
        statusMessages[response.status] || "Something went wrong while generating the paper. Please try again."
      );
    }

    const json = (await response.json()) as GroqResponse;
    const text = json.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("The AI returned an empty response. Please try generating again.");
    }

    return {
      provider: "groq",
      prompt,
      rawText: text
    };
  }
}
