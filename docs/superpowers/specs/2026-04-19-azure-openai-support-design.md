# Azure OpenAI Support Design

**Date:** 2026-04-19
**Status:** Proposed
**Author:** Claude Sonnet 4.6

## Overview

Add support for Microsoft Azure OpenAI Service to the Shortest testing framework, enabling users to leverage Azure's GPT-4 models for AI-powered natural language end-to-end testing.

## Background

Shortest currently supports Anthropic Claude models and Zhipu AI's GLM models. Users want to add Azure OpenAI Service as a third provider to access GPT-4 models hosted on Azure's infrastructure.

## Requirements

### Functional Requirements

1. **Provider Support**: Add "azure" as a new AI provider alongside "anthropic" and "glm"
2. **Model Coverage**: Support Azure OpenAI GPT-4 series models (gpt-4o, gpt-4-turbo, gpt-4)
3. **Azure Configuration**: Support Azure-specific parameters (resourceName, deploymentName, apiVersion)
4. **API Configuration**: Support both config file and environment variable API key configuration
5. **Function Calling**: Enable Azure's function calling support for browser automation tools
6. **Backward Compatibility**: Maintain full compatibility with existing Anthropic and GLM providers
7. **Error Handling**: Handle Azure-specific error responses and status codes

### Non-Functional Requirements

1. **Minimal Changes**: Use existing infrastructure where possible
2. **Performance**: No performance degradation for existing providers
3. **Maintainability**: Follow established code patterns from GLM integration
4. **Testability**: Comprehensive test coverage for new Azure functionality

## Architecture

### System Context

```
User Config (shortest.config.ts)
    ↓
AIConfig (provider: "azure", resourceName, deploymentName)
    ↓
createProvider() → @ai-sdk/azure → Azure OpenAI API
                                                   ↓
                                              ToolRegistry (Azure tools)
```

### Component Changes

#### 1. Configuration Layer (`packages/shortest/src/types/config.ts`)

**Changes:**
- Add Azure GPT-4 model constants and schema
- Update AI config schema to support Azure provider
- Add Azure-specific configuration fields (resourceName, deploymentName, apiVersion)

**Azure Models to Support:**
```typescript
export const AZURE_OPENAI_GPT4_MODELS = [
  "gpt-4o",          // Latest GPT-4 Omni model
  "gpt-4o-mini",    // Compact GPT-4 Omni model
  "gpt-4-turbo",    // GPT-4 Turbo
  "gpt-4",         // Standard GPT-4
] as const;
```

**Configuration Schema:**
```typescript
const azureOpenAISchema = z.object({
  provider: z.literal("azure"),
  apiKey: z.string().default(
    () => process.env.AZURE_OPENAI_API_KEY || 
           process.env.SHORTEST_AZURE_OPENAI_API_KEY!
  ),
  resourceName: z.string(),
  deploymentName: z.string(),
  apiVersion: z.string().default("2024-02-01"),
  model: azureOpenAIModelSchema.default("gpt-4o"),
});

const aiSchema = z.union([
  anthropicAiSchema,
  glmAiSchema,
  azureOpenAISchema,
]);
```

#### 2. Provider Layer (`packages/shortest/src/ai/provider.ts`)

**Changes:**
- Import `createAzure` from `@ai-sdk/azure`
- Add Azure case to provider switch statement
- Configure Azure OpenAI with required parameters

**Implementation:**
```typescript
import { createAzure } from "@ai-sdk/azure";

case "azure":
  const azure = createAzure({
    apiKey: aiConfig.apiKey,
    resourceName: (aiConfig as any).resourceName,
    apiVersion: (aiConfig as any).apiVersion || "2024-02-01",
  });
  return azure((aiConfig as any).deploymentName) as LanguageModelV1;
```

#### 3. Tool Registry (`packages/shortest/src/tools/tool-registry.ts`)

**Changes:**
- Add Azure model family types and mappings
- Update `getTools()` method to handle Azure provider
- Add `getAzureTools()` method for Azure tool setup

**Implementation:**
```typescript
export type AzureOpenAIModelFamily = "gpt-4o" | "gpt-4-turbo" | "gpt-4";

const AZURE_OPENAI_MODEL_TO_FAMILY: Record<AzureOpenAIModel, AzureOpenAIModelFamily> = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o",
  "gpt-4-turbo": "gpt-4-turbo",
  "gpt-4": "gpt-4",
};

private getAzureTools(browserTool: BrowserTool): Record<string, Tool> {
  // Azure OpenAI supports standard function calling
  const tools: Record<string, Tool> = {};
  
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

#### 4. Error Handling (`packages/shortest/src/ai/client.ts`)

**Changes:**
- Update `isNonRetryableError()` to handle Azure error codes
- Add Azure-specific status code handling

**Implementation:**
```typescript
private isNonRetryableError(error: any) {
  const status = error.status;
  const provider = this.configAi.provider;

  if (provider === "glm") {
    return [401, 403, 429, 500].includes(status);
  }

  if (provider === "azure") {
    // Azure OpenAI error codes
    // 400: Bad Request, 401: Unauthorized, 429: Rate Limit
    return [400, 401, 403, 429, 500].includes(status);
  }

  return [401, 403, 500].includes(status);
}
```

### Dependencies

**New Dependencies:**
- `@ai-sdk/azure` - Official Vercel AI SDK for Azure OpenAI

**Modified Dependencies:**
- Existing `@ai-sdk/openai` dependency (already installed for GLM)

### API Contract

#### User Configuration

```typescript
// shortest.config.ts
export default {
  headless: false,
  baseUrl: "http://localhost:3000",
  ai: {
    provider: "azure",
    resourceName: "my-openai-resource",
    deploymentName: "gpt-4o-deployment",
    model: "gpt-4o",
  },
} satisfies ShortestConfig;
```

#### Environment Variables

```bash
# Azure OpenAI API Key
AZURE_OPENAI_API_KEY=your_azure_api_key

# Or use
SHORTEST_AZURE_OPENAI_API_KEY=your_azure_api_key
```

## Testing Strategy

### Unit Tests

1. **Provider Creation** (`packages/shortest/src/ai/provider.test.ts`)
   - Test Azure provider creation with valid config
   - Test resourceName and deploymentName configuration
   - Test API version fallback
   - Test different Azure models

2. **Tool Registry** (`packages/shortest/src/tools/tool-registry.test.ts`)
   - Test Azure tool retrieval
   - Test model family mapping
   - Test tool creation for Azure

### Integration Tests

1. **API Connectivity**
   - Test real Azure OpenAI API calls with test API key
   - Verify function calling works with Azure
   - Test error handling and retries

2. **Browser Automation**
   - Test computer tool with Azure
   - Test bash tool with Azure
   - Verify tool execution and response handling

### E2E Tests

1. **Test Suite Compatibility**
   - Run existing test suite with Azure provider
   - Verify backward compatibility with Anthropic and GLM
   - Test multiple Azure models

## Implementation Phases

### Phase 1: Core Provider Support
- Update configuration schema
- Install @ai-sdk/azure dependency
- Implement Azure provider creation
- Add basic unit tests

### Phase 2: Tool Integration
- Implement Azure tool support
- Update tool registry
- Add tool tests

### Phase 3: Error Handling & Testing
- Implement error handling
- Add integration tests
- Run E2E test suite

### Phase 4: Documentation & Examples
- Update README with Azure examples
- Add configuration examples
- Document Azure-specific considerations

## Migration Path

### For Existing Users

No migration required. Azure support is opt-in:

1. Users wanting Azure: Update `shortest.config.ts` with `provider: "azure"`
2. Existing Anthropic/GLM users: No changes needed

### For New Users

New users can choose any provider during initialization:

```bash
npx @antiwork/shortest init
# Select provider: anthropic | glm | azure
```

## Risks & Mitigations

### Risk 1: Azure SDK Compatibility Issues

**Mitigation:**
- Use official `@ai-sdk/azure` package
- Comprehensive testing with multiple Azure models
- Fallback to existing providers if Azure fails

### Risk 2: Azure Configuration Complexity

**Mitigation:**
- Follow GLM integration pattern (proven successful)
- Provide clear configuration examples
- Validate configuration early with detailed error messages

### Risk 3: Function Calling Format Differences

**Mitigation:**
- Azure uses standard OpenAI function calling format
- Test tool functionality thoroughly
- Document any Azure-specific limitations

## Success Criteria

1. ✅ Users can configure Azure provider in `shortest.config.ts`
2. ✅ Azure models can be created via `createProvider()`
3. ✅ Tool registry supports Azure provider
4. ✅ Error handling includes Azure-specific codes
5. ✅ All tests pass (unit, integration, E2E)
6. ✅ Documentation is complete
7. ✅ Backward compatibility with Anthropic and GLM is maintained
8. ✅ Azure GPT-4 models work for browser automation testing

## References

- [Azure OpenAI Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Vercel AI SDK - Azure Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/azure)
- [Azure OpenAI API Reference](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference/)
- [Shortest GLM Integration](https://github.com/antiwork/shortest/blob/main/docs/superpowers/specs/2026-04-17-glm-model-support-design.md)

## Future Enhancements

1. **Additional Azure Models** - Support GPT-3.5 series, embedding models
2. **Azure Deployment Management** - Dynamic deployment selection
3. **Cost Optimization** - Add Azure cost tracking and model recommendations
4. **Multi-Region Support** - Support for different Azure regions
5. **Provider Failover** - Implement automatic provider fallback on errors
