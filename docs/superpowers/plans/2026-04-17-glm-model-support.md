# GLM Model Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add support for Zhipu AI's GLM models to Shortest testing framework using OpenAI SDK integration

**Architecture:** Extend existing provider system to support GLM via `@ai-sdk/openai` with Zhipu's base URL. Add GLM model constants, update configuration schema to support multiple providers, extend provider factory, add GLM tool support, and implement provider-specific error handling.

**Tech Stack:** TypeScript, Zod, `@ai-sdk/openai`, Vitest

---

## File Structure

**Modified Files:**
- `packages/shortest/src/types/config.ts` - Add GLM model constants and update AI config schema
- `packages/shortest/src/ai/provider.ts` - Add GLM provider case using OpenAI SDK
- `packages/shortest/src/tools/tool-registry.ts` - Add GLM model family and tool support
- `packages/shortest/src/ai/client.ts` - Add GLM-specific error handling
- `packages/shortest/src/ai/provider.test.ts` - Add GLM provider tests
- `packages/shortest/src/tools/tool-registry.test.ts` - Add GLM tool registry tests

**No new files created** - Extending existing architecture

---

## Task 1: Add GLM Model Constants

**Files:**
- Modify: `packages/shortest/src/types/config.ts:18-29`

- [ ] **Step 1: Add GLM model constant array**

Add after `ANTHROPIC_MODELS` constant (after line 27):

```typescript
/**
 * List of Zhipu GLM models that are supported by the AI client.
 *
 * @see https://open.bigmodel.cn/dev/api
 */
export const GLM_MODELS = [
  "glm-4-plus",
  "glm-4-0520",
  "glm-4",
  "glm-4-air",
  "glm-4-flash",
  "glm-3-turbo",
] as const;
```

- [ ] **Step 2: Add GLM model schema**

Add after the GLM models constant:

```typescript
export const glmModelSchema = z.enum(GLM_MODELS);
export type GLMModel = z.infer<typeof glmModelSchema>;
```

- [ ] **Step 3: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/src/types/config.ts
git commit -m "feat: add GLM model constants and schema"
```

---

## Task 2: Update AI Config Schema for Multi-Provider Support

**Files:**
- Modify: `packages/shortest/src/types/config.ts:31-44`

- [ ] **Step 1: Refactor AI schema to support multiple providers**

Replace the existing `aiSchema` (lines 31-43) with:

```typescript
const anthropicAiSchema = z.object({
  provider: z.literal("anthropic"),
  apiKey: z
    .string()
    .default(
      () =>
        process.env[getShortestEnvName("ANTHROPIC_API_KEY")] ||
        process.env.ANTHROPIC_API_KEY!,
    ),
  model: anthropicModelSchema.default(ANTHROPIC_MODELS[0]),
});

const glmAiSchema = z.object({
  provider: z.literal("glm"),
  apiKey: z
    .string()
    .default(
      () =>
        process.env.ZHIPU_API_KEY ||
        process.env[getShortestEnvName("GLM_API_KEY")!,
    ),
  model: glmModelSchema.default("glm-4"),
  baseURL: z.string().default("https://open.bigmodel.cn/api/paas/v4/"),
});

const aiSchema = z.union([anthropicAiSchema, glmAiSchema]);
```

- [ ] **Step 2: Update configSchema to use new aiSchema**

The `configSchema` at line 76 already uses `aiSchema`, no changes needed there.

- [ ] **Step 3: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/src/types/config.ts
git commit -m "feat: update AI config schema for multi-provider support"
```

---

## Task 3: Add GLM Provider Case

**Files:**
- Modify: `packages/shortest/src/ai/provider.ts:1-22`

- [ ] **Step 1: Import OpenAI SDK**

Add import at the top of the file:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
```

The import section should look like:

```typescript
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModelV1 } from "ai";
import { AIConfig } from "@/types";
import { AIError } from "@/utils/errors";
```

- [ ] **Step 2: Add GLM case to provider switch**

Add GLM case inside the switch statement (after the anthropic case, before default):

```typescript
export const createProvider = (aiConfig: AIConfig): LanguageModelV1 => {
  switch (aiConfig.provider) {
    case "anthropic":
      const anthropic = createAnthropic({ apiKey: aiConfig.apiKey });
      return anthropic(aiConfig.model) as LanguageModelV1;
    case "glm":
      const glm = createOpenAI({
        apiKey: aiConfig.apiKey,
        baseURL: (aiConfig as any).baseURL || "https://open.bigmodel.cn/api/paas/v4/",
      });
      return glm(aiConfig.model) as LanguageModelV1;
    default:
      throw new AIError(
        "unsupported-provider",
        `${aiConfig.provider} is not supported.`,
      );
  }
};
```

- [ ] **Step 3: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/src/ai/provider.ts
git commit -m "feat: add GLM provider support"
```

---

## Task 4: Add GLM Model Family to Tool Registry

**Files:**
- Modify: `packages/shortest/src/tools/tool-registry.ts:39-47`

- [ ] **Step 1: Add GLM model family types**

Add after `AnthropicToolVersion` type definition (after line 47):

```typescript
// eslint-disable-next-line zod/require-zod-schema-types
export type GLMModelFamily = "glm-4" | "glm-3";

export type GLMModel = z.infer<typeof glmModelSchema>;
```

- [ ] **Step 2: Add GLM model to family mapping**

Add after `ANTHROPIC_MODEL_TO_FAMILY` (after line 59):

```typescript
const GLM_MODEL_TO_FAMILY: Record<GLMModel, GLMModelFamily> = {
  "glm-4-plus": "glm-4",
  "glm-4-0520": "glm-4",
  "glm-4": "glm-4",
  "glm-4-air": "glm-4",
  "glm-4-flash": "glm-4",
  "glm-3-turbo": "glm-3",
};
```

- [ ] **Step 3: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/src/tools/tool-registry.ts
git commit -m "feat: add GLM model family types"
```

---

## Task 5: Update Tool Registry for GLM Provider

**Files:**
- Modify: `packages/shortest/src/tools/tool-registry.ts:84-236`

- [ ] **Step 1: Update getTools method signature**

Update the `getTools` method signature to accept GLM models (line 116):

```typescript
public getTools(
  provider: string,
  model: AnthropicModel | GLMModel,
  browserTool: BrowserTool,
): Record<string, Tool> {
```

- [ ] **Step 2: Add GLM handler in getProviderTools**

Update the `getProviderTools` method (lines 160-190) to handle GLM:

```typescript
private getProviderTools(
  provider: string,
  model: AnthropicModel | GLMModel,
  browserTool: BrowserTool,
): Record<string, Tool> {
  if (provider === "glm") {
    return this.getGLMTools(browserTool);
  }

  const tools: Record<string, Tool> = {};

  try {
    const computerToolEntry = this.getProviderToolEntry(
      provider,
      model as AnthropicModel,
      "computer",
    );
    tools[computerToolEntry.name] = computerToolEntry.factory(browserTool);
  } catch (error) {
    if (!(error instanceof ShortestError)) throw error;
    this.log.trace("Computer tool not found for model, skipping", { model });
  }

  try {
    const bashToolEntry = this.getProviderToolEntry(
      provider,
      model as AnthropicModel,
      "bash",
    );
    // @ts-ignore
    // For some reason, it expects an argument, but it doesn't take any
    tools["bash"] = bashToolEntry.factory();
  } catch (error) {
    if (!(error instanceof ShortestError)) throw error;
    this.log.trace("Bash tool not found for model, skipping", { model });
  }

  return tools;
}
```

- [ ] **Step 3: Add imports for GLM tools**

Add these imports at the top of the file alongside existing imports:

```typescript
import { BrowserTool } from "@/browser/core/browser-tool";
import { BashTool } from "@/browser/core/bash-tool";
```

- [ ] **Step 4: Add getGLMTools method**

Add this new method after `getCustomTools` (after line 148):

```typescript
private getGLMTools(browserTool: BrowserTool): Record<string, Tool> {
  const tools: Record<string, Tool> = {};

  // GLM uses standard function calling via OpenAI SDK
  // Directly create tool instances without Anthropic-specific versions
  try {
    const computerTool = new BrowserTool(browserTool);
    tools["computer"] = computerTool;
  } catch (error) {
    this.log.trace("Computer tool creation failed for GLM, skipping", { error });
  }

  try {
    const bashTool = new BashTool();
    tools["bash"] = bashTool;
  } catch (error) {
    this.log.trace("Bash tool creation failed for GLM, skipping", { error });
  }

  return tools;
}
```

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add packages/shortest/src/tools/tool-registry.ts
git commit -m "feat: add GLM tool support"
```

---

## Task 6: Add GLM Error Handling

**Files:**
- Modify: `packages/shortest/src/ai/client.ts:360-362`

- [ ] **Step 1: Update isNonRetryableError for GLM**

Replace the existing `isNonRetryableError` method (lines 360-362) with:

```typescript
private isNonRetryableError(error: any) {
  const status = error.status;
  const provider = this.configAi.provider;

  if (provider === "glm") {
    // Zhipu API error codes - 429 for rate limiting
    return [401, 403, 429, 500].includes(status);
  }

  return [401, 403, 500].includes(status);
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shortest/src/ai/client.ts
git commit -m "feat: add GLM-specific error handling"
```

---

## Task 7: Add Provider Creation Tests

**Files:**
- Modify: `packages/shortest/src/ai/provider.test.ts`

- [ ] **Step 1: Write failing test for GLM provider creation**

Add to the test file:

```typescript
describe("createProvider - GLM", () => {
  it("should create GLM provider with valid config", () => {
    const glmConfig: AIConfig = {
      provider: "glm",
      apiKey: "test-api-key",
      model: "glm-4",
      baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    };

    const provider = createProvider(glmConfig);

    expect(provider).toBeDefined();
    expect(typeof provider).toBe("object");
  });

  it("should use default base URL when not provided", () => {
    const glmConfig: AIConfig = {
      provider: "glm",
      apiKey: "test-api-key",
      model: "glm-4",
    };

    const provider = createProvider(glmConfig);

    expect(provider).toBeDefined();
  });

  it("should create provider for different GLM models", () => {
    const models: GLMModel[] = ["glm-4-plus", "glm-4", "glm-4-flash", "glm-3-turbo"];

    models.forEach((model) => {
      const glmConfig: AIConfig = {
        provider: "glm",
        apiKey: "test-api-key",
        model,
      };

      const provider = createProvider(glmConfig);
      expect(provider).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @antiwork/shortest test provider.test.ts`
Expected: Tests fail with missing imports/types

- [ ] **Step 3: Add missing imports**

Add to imports at top of file:

```typescript
import { GLMModel } from "@/types/config";
```

- [ ] **Step 4: Run tests again**

Run: `pnpm --filter @antiwork/shortest test provider.test.ts`
Expected: Tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/shortest/src/ai/provider.test.ts
git commit -m "test: add GLM provider creation tests"
```

---

## Task 8: Add Tool Registry Tests

**Files:**
- Modify: `packages/shortest/src/tools/tool-registry.test.ts`

- [ ] **Step 1: Write failing test for GLM tool retrieval**

Add to the test file:

```typescript
describe("ToolRegistry - GLM Provider", () => {
  let registry: ToolRegistry;
  let mockBrowserTool: any;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockBrowserTool = {
      page: {},
    };
  });

  it("should return tools for GLM provider", () => {
    const tools = registry.getTools("glm", "glm-4", mockBrowserTool);

    expect(tools).toBeDefined();
    expect(typeof tools).toBe("object");
  });

  it("should handle different GLM models", () => {
    const models: GLMModel[] = ["glm-4-plus", "glm-4", "glm-4-flash", "glm-3-turbo"];

    models.forEach((model) => {
      const tools = registry.getTools("glm", model, mockBrowserTool);
      expect(tools).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @antiwork/shortest test tool-registry.test.ts`
Expected: Tests fail with missing imports

- [ ] **Step 3: Add missing imports**

Add to imports at top of file:

```typescript
import { GLMModel } from "@/types/config";
```

- [ ] **Step 4: Run tests again**

Run: `pnpm --filter @antiwork/shortest test tool-registry.test.ts`
Expected: Tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/shortest/src/tools/tool-registry.test.ts
git commit -m "test: add GLM tool registry tests"
```

---

## Task 9: Add Integration Test

**Files:**
- Create: `packages/shortest/src/integration/glm-integration.test.ts`

- [ ] **Step 1: Create integration test file**

Create new test file:

```typescript
import { test, expect } from "vitest";
import { createProvider } from "@/ai/provider";
import { AIConfig } from "@/types/config";

describe("GLM Integration Tests", () => {
  const realApiKey = process.env.ZHIPU_API_KEY;

  test.skipIf(!realApiKey)("should connect to GLM API", async () => {
    const glmConfig: AIConfig = {
      provider: "glm",
      apiKey: realApiKey!,
      model: "glm-4-flash",
    };

    const provider = createProvider(glmConfig);

    expect(provider).toBeDefined();
  });

  test.skipIf(!realApiKey)("should handle GLM API errors gracefully", async () => {
    const glmConfig: AIConfig = {
      provider: "glm",
      apiKey: "invalid-key",
      model: "glm-4-flash",
    };

    expect(() => createProvider(glmConfig)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run integration test**

Run: `ZHIPU_API_KEY=test-key pnpm --filter @antiwork/shortest test integration/glm-integration.test.ts`
Expected: Tests are skipped if no API key, pass otherwise

- [ ] **Step 3: Commit**

```bash
git add packages/shortest/src/integration/glm-integration.test.ts
git commit -m "test: add GLM integration tests"
```

---

## Task 10: Update README Documentation

**Files:**
- Modify: `README.md:44-64`

- [ ] **Step 1: Add GLM configuration example**

Add after the Anthropic configuration example (after line 63):

```typescript
### Using GLM Models

To use Zhipu AI's GLM models, configure your provider as follows:

```typescript
import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: false,
  baseUrl: "http://localhost:3000",
  ai: {
    provider: "glm",
    model: "glm-4-plus",
  },
} satisfies ShortestConfig;
```

The GLM API key defaults to `ZHIPU_API_KEY` / `SHORTEST_GLM_API_KEY` environment variables. Can be overwritten via `ai.config.apiKey`.

Available GLM models: `glm-4-plus`, `glm-4-0520`, `glm-4`, `glm-4-air`, `glm-4-flash`, `glm-3-turbo`.
```

- [ ] **Step 2: Update environment setup section**

Update the environment setup section (around line 232) to include GLM:

```bash
Required in `.env.local`:

```bash
# For Anthropic models
ANTHROPIC_API_KEY=your_api_key

# For GLM models (optional)
ZHIPU_API_KEY=your_glm_api_key

GITHUB_TOTP_SECRET=your_secret  # Only for GitHub auth tests
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add GLM configuration examples"
```

---

## Task 11: Run Full Test Suite

**Files:**
- All modified files

- [ ] **Step 1: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 2: Run all tests**

Run: `pnpm --filter @antiwork/shortest test`
Expected: All tests pass

- [ ] **Step 3: Run build**

Run: `pnpm --filter @antiwork/shortest build`
Expected: Build succeeds

- [ ] **Step 4: Commit final fixes if needed**

If any issues found and fixed:

```bash
git add -A
git commit -m "fix: resolve test and build issues"
```

---

## Task 12: Create Example Configuration

**Files:**
- Create: `examples/glm.config.ts`

- [ ] **Step 1: Create GLM example configuration**

Create example config file:

```typescript
import type { ShortestConfig } from "@antiwork/shortest";

/**
 * Example configuration for using GLM models with Shortest
 *
 * Setup:
 * 1. Set ZHIPU_API_KEY environment variable
 * 2. Copy this file to your project root as shortest.config.ts
 * 3. Run tests with: pnpm shortest
 */
export default {
  headless: true,
  baseUrl: "http://localhost:3000",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "glm",
    model: "glm-4-flash", // Faster for testing
  },
  browser: {
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
} satisfies ShortestConfig;
```

- [ ] **Step 2: Commit**

```bash
git add examples/glm.config.ts
git commit -m "docs: add GLM configuration example"
```

---

## Verification Steps

After completing all tasks:

- [ ] **Verify TypeScript compilation passes**: `pnpm --filter @antiwork/shortest typecheck`
- [ ] **Verify all tests pass**: `pnpm --filter @antiwork/shortest test`
- [ ] **Verify build succeeds**: `pnpm --filter @antiwork/shortest build`
- [ ] **Verify backward compatibility**: Existing Anthropic tests still pass
- [ ] **Verify documentation is complete**: README has GLM examples
- [ ] **Verify example config works**: `examples/glm.config.ts` is valid

---

## Success Criteria

✅ Users can configure GLM provider in `shortest.config.ts`
✅ GLM models can be created via `createProvider()`
✅ Tool registry supports GLM provider
✅ Error handling includes GLM-specific codes
✅ All tests pass (unit, integration)
✅ Documentation is complete
✅ Backward compatibility with Anthropic is maintained
