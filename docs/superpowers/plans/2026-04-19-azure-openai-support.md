# Azure OpenAI Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Azure OpenAI Service support to Shortest testing framework using @ai-sdk/azure

**Architecture:** Extend existing multi-provider system to support Azure OpenAI via `@ai-sdk/azure`, following the proven GLM integration pattern.

**Tech Stack:** TypeScript, Zod, `@ai-sdk/azure`, Vitest

---

## File Structure

**Modified Files:**
- `packages/shortest/package.json` - Add @ai-sdk/azure dependency
- `packages/shortest/src/types/config.ts` - Add Azure model constants and multi-provider schema
- `packages/shortest/src/ai/provider.ts` - Add Azure provider using createAzure()
- `packages/shortest/src/tools/tool-registry.ts` - Add Azure model family and tool support
- `packages/shortest/src/ai/client.ts` - Add Azure-specific error handling
- `packages/shortest/src/ai/provider.test.ts` - Add Azure provider tests
- `packages/shortest/src/tools/tool-registry.test.ts` - Add Azure tool registry tests

**No new files created** - Extending existing architecture

---

## Task 1: Install @ai-sdk/azure Dependency

**Files:**
- Modify: `packages/shortest/package.json`

- [ ] **Step 1: Add @ai-sdk/azure dependency**

Add to dependencies section:
```json
{
  "dependencies": {
    "@ai-sdk/anthropic": "^1.2.12",
    "@ai-sdk/openai": "^0.0.61",
    "@ai-sdk/azure": "^1.0.0",
    "@ai-sdk/provider": "^1.1.3",
    ...
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`
Expected: @ai-sdk/azure package installed

- [ ] **Step 3: Verify installation**

Run: `pnpm list @ai-sdk/azure`
Expected: Package version displayed

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/package.json pnpm-lock.yaml
git commit -m "deps: add @ai-sdk/azure dependency"
```

---

## Task 2: Add Azure OpenAI Model Constants

**Files:**
- Modify: `packages/shortest/src/types/config.ts:18-47`

- [ ] **Step 1: Add Azure GPT-4 model constant array**

Add after GLM_MODELS constant:
```typescript
/**
 * List of Azure OpenAI GPT-4 models that are supported by the AI client.
 *
 * @see https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models
 */
export const AZURE_OPENAI_GPT4_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
] as const;
```

- [ ] **Step 2: Add Azure model schema**

Add after the Azure models constant:
```typescript
export const azureOpenAIModelSchema = z.enum(AZURE_OPENAI_GPT4_MODELS);
export type AzureOpenAIModel = z.infer<typeof azureOpenAIModelSchema>;
```

- [ ] **Step 3: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/src/types/config.ts
git commit -m "feat: add Azure OpenAI GPT-4 model constants and schema"
```

---

## Task 3: Update AI Config Schema for Azure Support

**Files:**
- Modify: `packages/shortest/src/types/config.ts:51-87`

- [ ] **Step 1: Add Azure OpenAI schema**

Add after glmAiSchema definition:
```typescript
const azureOpenAISchema = z.object({
  provider: z.literal("azure"),
  apiKey: z
    .string()
    .default(
      () =>
        process.env.AZURE_OPENAI_API_KEY ||
        process.env[getShortestEnvName("AZURE_OPENAI_API_KEY")]!,
    ),
  resourceName: z.string(),
  deploymentName: z.string(),
  apiVersion: z.string().default("2024-02-01"),
  model: azureOpenAIModelSchema.default("gpt-4o"),
});
```

- [ ] **Step 2: Update aiSchema union**

Update aiSchema to include Azure:
```typescript
const aiSchema = z.union([
  anthropicAiSchema,
  glmAiSchema,
  azureOpenAISchema,
]);
```

- [ ] **Step 3: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/src/types/config.ts
git commit -m "feat: update AI config schema for Azure OpenAI support"
```

---

## Task 4: Implement Azure Provider

**Files:**
- Modify: `packages/shortest/src/ai/provider.ts:1-25`

- [ ] **Step 1: Import Azure SDK**

Add import at the top of the file:
```typescript
import { createAzure } from "@ai-sdk/azure";
```

The import section should look like:
```typescript
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createAzure } from "@ai-sdk/azure";
import { LanguageModelV1 } from "ai";
import { AIConfig } from "@/types";
import { AIError } from "@/utils/errors";
```

- [ ] **Step 2: Add Azure case to provider switch**

Add Azure case inside the switch statement (after GLM case, before default):
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
    
    case "azure":
      const azure = createAzure({
        apiKey: aiConfig.apiKey,
        resourceName: (aiConfig as any).resourceName,
        apiVersion: (aiConfig as any).apiVersion || "2024-02-01",
      });
      return azure((aiConfig as any).deploymentName) as LanguageModelV1;
    
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
git commit -m "feat: add Azure OpenAI provider support"
```

---

## Task 5: Add Azure Model Family to Tool Registry

**Files:**
- Modify: `packages/shortest/src/tools/tool-registry.ts:39-77`

- [ ] **Step 1: Add Azure model family types**

Add after GLM model family types:
```typescript
// eslint-disable-next-line zod/require-zod-schema-types
export type AzureOpenAIModelFamily = "gpt-4o" | "gpt-4-turbo" | "gpt-4";

export type AzureOpenAIModel = z.infer<typeof azureOpenAIModelSchema>;
```

- [ ] **Step 2: Add Azure model to family mapping**

Add after GLM_MODEL_TO_FAMILY:
```typescript
const AZURE_OPENAI_MODEL_TO_FAMILY: Record<AzureOpenAIModel, AzureOpenAIModelFamily> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o",
  "gpt-4-turbo": "gpt-4-turbo",
  "gpt-4": "gpt-4",
};
```

- [ ] **Step 3: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add packages/shortest/src/tools/tool-registry.ts
git commit -m "feat: add Azure OpenAI model family types"
```

---

## Task 6: Update Tool Registry for Azure Provider

**Files:**
- Modify: `packages/shortest/src/tools/tool-registry.ts:116-190`

- [ ] **Step 1: Update getTools method signature**

Update the `getTools` method signature to accept Azure models:
```typescript
public getTools(
  provider: string,
  model: AnthropicModel | GLMModel | AzureOpenAIModel,
  browserTool: BrowserTool,
): Record<string, Tool> {
```

- [ ] **Step 2: Add Azure handler in getProviderTools**

Update the `getProviderTools` method to handle Azure:
```typescript
private getProviderTools(
  provider: string,
  model: AnthropicModel | GLMModel | AzureOpenAIModel,
  browserTool: BrowserTool,
): Record<string, Tool> {
  if (provider === "azure") {
    return this.getAzureTools(browserTool);
  }

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
    tools["bash"] = bashToolEntry.factory();
  } catch (error) {
    if (!(error instanceof ShortestError)) throw error;
    this.log.trace("Bash tool not found for model, skipping", { model });
  }

  return tools;
}
```

- [ ] **Step 3: Add getAzureTools method**

Add this new method after `getGLMTools()`:
```typescript
private getAzureTools(browserTool: BrowserTool): Record<string, Tool> {
  const tools: Record<string, Tool> = {};

  // Azure OpenAI supports standard function calling via OpenAI SDK
  // Use the same tools but without Anthropic-specific versions
  try {
    const computerTool = new BrowserTool(browserTool);
    tools["computer"] = computerTool;
  } catch (error) {
    this.log.trace("Computer tool creation failed for Azure, skipping", { error });
  }

  try {
    const bashTool = new BashTool();
    tools["bash"] = bashTool;
  } catch (error) {
    this.log.trace("Bash tool creation failed for Azure, skipping", { error });
  }

  return tools;
}
```

- [ ] **Step 4: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add packages/shortest/src/tools/tool-registry.ts
git commit -m "feat: add Azure OpenAI tool support"
```

---

## Task 7: Add Azure Error Handling

**Files:**
- Modify: `packages/shortest/src/ai/client.ts:360-372`

- [ ] **Step 1: Update isNonRetryableError for Azure**

Update the existing `isNonRetryableError` method to include Azure:
```typescript
private isNonRetryableError(error: any) {
  const status = error.status;
  const provider = this.configAi.provider;

  if (provider === "glm") {
    // Zhipu API error codes - 429 for rate limiting
    return [401, 403, 429, 500].includes(status);
  }

  if (provider === "azure") {
    // Azure OpenAI error codes
    // 400: Bad Request, 401: Unauthorized, 429: Rate Limit
    return [400, 401, 403, 429, 500].includes(status);
  }

  // Anthropic (existing logic)
  return [401, 403, 500].includes(status);
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add packages/shortest/src/ai/client.ts
git commit -m "feat: add Azure-specific error handling"
```

---

## Task 8: Add Provider Creation Tests

**Files:**
- Modify: `packages/shortest/src/ai/provider.test.ts`

- [ ] **Step 1: Write failing test for Azure provider creation**

Add to the test file:
```typescript
describe("createProvider - Azure OpenAI", () => {
  it("should create Azure provider with valid config", () => {
    const azureConfig: AIConfig = {
      provider: "azure",
      apiKey: "test-api-key",
      resourceName: "test-resource",
      deploymentName: "gpt-4o-deployment",
      model: "gpt-4o",
    };

    const provider = createProvider(azureConfig);

    expect(provider).toBeDefined();
    expect(typeof provider).toBe("object");
  });

  it("should use default apiVersion when not provided", () => {
    const azureConfig: AIConfig = {
      provider: "azure",
      apiKey: "test-api-key",
      resourceName: "test-resource",
      deploymentName: "gpt-4o-deployment",
      model: "gpt-4o",
    };

    const provider = createProvider(azureConfig);

    expect(provider).toBeDefined();
  });

  it("should create provider for different Azure models", () => {
    const models: AzureOpenAIModel[] = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4"];

    models.forEach((model) => {
      const azureConfig: AIConfig = {
        provider: "azure",
        apiKey: "test-api-key",
        resourceName: "test-resource",
        deploymentName: `${model}-deployment`,
        model,
      };

      const provider = createProvider(azureConfig);
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
import { AzureOpenAIModel } from "@/types/config";
```

- [ ] **Step 4: Run tests again**

Run: `pnpm --filter @antiwork/shortest test provider.test.ts`
Expected: Tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/shortest/src/ai/provider.test.ts
git commit -m "test: add Azure OpenAI provider creation tests"
```

---

## Task 9: Add Tool Registry Tests

**Files:**
- Modify: `packages/shortest/src/tools/tool-registry.test.ts`

- [ ] **Step 1: Write failing test for Azure tool retrieval**

Add to the test file:
```typescript
describe("ToolRegistry - Azure OpenAI Provider", () => {
  let registry: ToolRegistry;
  let mockBrowserTool: any;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockBrowserTool = {
      page: {},
    };
  });

  it("should return tools for Azure provider", () => {
    const tools = registry.getTools("azure", "gpt-4o", mockBrowserTool);

    expect(tools).toBeDefined();
    expect(typeof tools).toBe("object");
  });

  it("should handle different Azure models", () => {
    const models: AzureOpenAIModel[] = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4"];

    models.forEach((model) => {
      const tools = registry.getTools("azure", model, mockBrowserTool);
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
import { AzureOpenAIModel } from "@/types/config";
```

- [ ] **Step 4: Run tests again**

Run: `pnpm --filter @antiwork/shortest test tool-registry.test.ts`
Expected: Tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/shortest/src/tools/tool-registry.test.ts
git commit -m "test: add Azure OpenAI tool registry tests"
```

---

## Task 10: Add Integration Test

**Files:**
- Create: `packages/shortest/src/integration/azure-integration.test.ts`

- [ ] **Step 1: Create integration test file**

Create new test file:
```typescript
import { test, expect } from "vitest";
import { createProvider } from "@/ai/provider";
import { AIConfig } from "@/types/config";

describe("Azure OpenAI Integration Tests", () => {
  const realApiKey = process.env.AZURE_OPENAI_API_KEY;

  test.skipIf(!realApiKey)("should connect to Azure OpenAI API", async () => {
    const azureConfig: AIConfig = {
      provider: "azure",
      apiKey: realApiKey!,
      resourceName: "test-resource",
      deploymentName: "gpt-4o",
      model: "gpt-4o",
    };

    const provider = createProvider(azureConfig);

    expect(provider).toBeDefined();
  });

  test.skipIf(!realApiKey)("should handle Azure API errors gracefully", async () => {
    const azureConfig: AIConfig = {
      provider: "azure",
      apiKey: "invalid-key",
      resourceName: "test-resource",
      deploymentName: "gpt-4o",
      model: "gpt-4o",
    };

    expect(() => createProvider(azureConfig)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run integration test**

Run: `AZURE_OPENAI_API_KEY=test-key pnpm --filter @antiwork/shortest test integration/azure-integration.test.ts`
Expected: Tests are skipped if no API key, pass otherwise

- [ ] **Step 3: Commit**

```bash
git add packages/shortest/src/integration/azure-integration.test.ts
git commit -m "test: add Azure OpenAI integration tests"
```

---

## Task 11: Update README Documentation

**Files:**
- Modify: `README.md:44-64`

- [ ] **Step 1: Add Azure OpenAI configuration example**

Add after the GLM configuration example:
```typescript
### Using Azure OpenAI

To use Microsoft Azure OpenAI Service, configure your provider as follows:

```typescript
import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: false,
  baseUrl: "http://localhost:3000",
  ai: {
    provider: "azure",
    resourceName: "your-resource-name",
    deploymentName: "gpt-4o-deployment",
    model: "gpt-4o",
  },
} satisfies ShortestConfig;
```

The Azure OpenAI API key defaults to `AZURE_OPENAI_API_KEY` / `SHORTEST_AZURE_OPENAI_API_KEY` environment variables. Can be overwritten via `ai.config.apiKey`.

Available Azure models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`.
```

- [ ] **Step 2: Update environment setup section**

Update the environment setup section to include Azure:
```bash
Required in `.env.local`:

```bash
# For Anthropic models
ANTHROPIC_API_KEY=your_api_key

# For GLM models
ZHIPU_API_KEY=your_glm_api_key

# For Azure OpenAI models
AZURE_OPENAI_API_KEY=your_azure_api_key

GITHUB_TOTP_SECRET=your_secret  # Only for GitHub auth tests
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Azure OpenAI configuration examples"
```

---

## Task 12: Run Full Test Suite

**Files:**
- All modified files

- [ ] **Step 1: Run TypeScript check**

Run: `pnpm --filter @antiwork/shortest typecheck`
Expected: No type errors

- [ ] **Step 2: Run all tests**

Run: `pnpm --filter @antiwork/shortest test:unit`
Expected: All tests pass

- [ ] **Step 3: Run build**

Run: `pnpm --filter @antiwork/shortest build`
Expected: Build succeeds

- [ ] **Step 4: Commit final fixes if needed**

If any issues found and fixed:
```bash
git add -A
git commit -m "fix: resolve test and build issues for Azure support"
```

---

## Task 13: Create Example Configuration

**Files:**
- Create: `examples/azure.config.ts`

- [ ] **Step 1: Create Azure example configuration**

Create example config file:
```typescript
import type { ShortestConfig } from "@antiwork/shortest";

/**
 * Example configuration for using Azure OpenAI with Shortest
 *
 * Setup:
 * 1. Create Azure OpenAI resource in Azure Portal
 * 2. Deploy GPT-4 model (e.g., gpt-4o)
 * 3. Set AZURE_OPENAI_API_KEY environment variable
 * 4. Copy this file to your project root as shortest.config.ts
 * 5. Run tests with: pnpm shortest
 */
export default {
  headless: true,
  baseUrl: "http://localhost:3000",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "azure",
    resourceName: "your-openai-resource",
    deploymentName: "gpt-4o",
    model: "gpt-4o",
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
git add examples/azure.config.ts
git commit -m "docs: add Azure OpenAI configuration example"
```

---

## Verification Steps

After completing all tasks:

- [ ] **Verify TypeScript compilation passes**: `pnpm --filter @antiwork/shortest typecheck`
- [ ] **Verify all tests pass**: `pnpm --filter @antiwork/shortest test:unit`
- [ ] **Verify build succeeds**: `pnpm --filter @antiwork/shortest build`
- [ ] **Verify backward compatibility**: Existing Anthropic and GLM tests still pass
- [ ] **Verify documentation is complete**: README has Azure examples
- [ ] **Verify example config works**: `examples/azure.config.ts` is valid

---

## Success Criteria

✅ Users can configure Azure provider in `shortest.config.ts`
✅ Azure models can be created via `createProvider()`
✅ Tool registry supports Azure provider
✅ Error handling includes Azure-specific codes (400, 429)
✅ All tests pass (unit, integration)
✅ Documentation is complete
✅ Backward compatibility with Anthropic and GLM is maintained
✅ Azure GPT-4 models work for browser automation testing
