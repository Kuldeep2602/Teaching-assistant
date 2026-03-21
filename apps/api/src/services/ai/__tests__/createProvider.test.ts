import { describe, expect, it } from "vitest";
import { resolveProviderMode } from "../createProvider.js";

describe("resolveProviderMode", () => {
  it("uses groq in auto mode when a key exists", () => {
    const resolved = resolveProviderMode({
      AI_PROVIDER_MODE: "auto",
      GROQ_API_KEY: "test-key"
    });

    expect(resolved.providerName).toBe("groq");
  });

  it("fails in auto mode when no key exists", () => {
    expect(() =>
      resolveProviderMode({
        AI_PROVIDER_MODE: "auto"
      })
    ).toThrow(/No AI provider is configured/);
  });

  it("allows explicit mock mode", () => {
    const resolved = resolveProviderMode({
      AI_PROVIDER_MODE: "mock"
    });

    expect(resolved.providerName).toBe("mock");
  });
});
