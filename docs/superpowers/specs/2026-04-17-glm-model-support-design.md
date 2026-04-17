# GLM Model Support Design

**Date:** 2026-04-17
**Status:** Proposed
**Author:** Claude Sonnet 4.6

## Overview

Add support for Zhipu AI's GLM models to the Shortest testing framework, enabling users to leverage GLM's capabilities for AI-powered natural language end-to-end testing.

## Background

Shortest currently only supports Anthropic Claude models. Users want to use Zhipu AI's GLM models (GLM-4, GLM-3 series) as an alternative provider. GLM models provide OpenAI-compatible API access with function calling support, making them suitable for browser automation testing.

## Requirements

### Functional Requirements

1. **Provider Support**: Add "glm" as a new AI provider alongside "anthropic"
2. **Model Coverage**: Support all available Zhipu GLM models (GLM-4, GLM-3 series)
3. **API Configuration**: Support both config file and environment variable API key configuration
4. **Function Calling**: Enable GLM's function calling for browser automation tools
5. **Backward Compatibility**: Maintain full compatibility with existing Anthropic provider
6. **Error Handling**: Handle GLM-specific error responses appropriately

### Non-Functional Requirements

1. **Minimal Changes**: Use existing infrastructure where possible
2. **Performance**: No performance degradation for existing Anthropic support
3. **Maintainability**: Follow existing code patterns and conventions
4. **Testability**: Comprehensive test coverage for new GLM functionality

## Architecture

### System Context

```
User Config (shortest.config.ts)
    ↓
AIConfig (provider: "glm", model, apiKey)
    ↓
createProvider() → OpenAI SDK
    ↓
Zhipu API (open.bigmodel.cn)
    ↓
ToolRegistry (GLM function calling)
    ↓
AIClient (existing, no changes)
```

### Component Changes

#### 1. Configuration Layer (`packages/shortest/src/types/config.ts`)

**Changes:**
- Add `GLM_MODELS` constant array with all supported GLM models
- Add `glmModelSchema` using Zod enum
- Update `aiSchema` to support union of Anthropic and GLM configs
- Add `GLMModel` type export

**GLM Models to Support:**
```typescript
export const GLM_MODELS = [
  "glm-4-plus",
  "glm-4-0520",
  "glm-4",
  "glm-4-air",
  "glm-4-flash",
  "glm-3-turbo",
] as const;
```

**Configuration Schema:**
```typescript
const aiSchema = z.union([
  z.object({
    provider: z.literal("anthropic"),
    apiKey: z.string().default(...),
    model: anthropicModelSchema.default(...),
  }),
  z.object({
    provider: z.literal("glm"),
    apiKey: z.string().default(
      () => process.env.ZHIPU_API_KEY ?? process.env.SHORTEST_GLM_API_KEY!
    ),
    model: glmModelSchema.default("glm-4"),
    baseURL: z.string().default("https://open.bigmodel.cn/api/paas/v4/"),
  }),
]);
```

#### 2. Provider Layer (`packages/shortest/src/ai/provider.ts`)

**Changes:**
- Import `createOpenAI` from `@ai-sdk/openai`
- Add "glm" case to `createProvider` switch statement
- Configure OpenAI SDK with Zhipu's base URL

**Implementation:**
```typescript
case "glm":
  const glm = createOpenAI({
    apiKey: aiConfig.apiKey,
    baseURL: (aiConfig as any).baseURL || "https://open.bigmodel.cn/api/paas/v4/"
  });
  return glm(aiConfig.model) as LanguageModelV1;
```

#### 3. Tool Registry (`packages/shortest/src/tools/tool-registry.ts`)

**Changes:**
- Add `GLMModelFamily` type
- Add `GLM_MODEL_TO_FAMILY` mapping
- Update `getProviderTools()` to handle GLM provider
- Add `getGLMTools()` method for GLM-specific tool setup

**Implementation:**
```typescript
private getGLMTools(browserTool: BrowserTool): Record<string, Tool> {
  // GLM uses standard function calling - no special tool versions
  return {
    computer: new BrowserTool(browserTool),
    bash: new BashTool(),
  };
}
```

#### 4. Error Handling (`packages/shortest/src/ai/client.ts`)

**Changes:**
- Update `isNonRetryableError()` to handle GLM error codes
- Add provider-specific error code mapping

**Implementation:**
```typescript
private isNonRetryableError(error: any) {
  const status = error.status;
  const provider = this.configAi.provider;

  if (provider === "glm") {
    // Zhipu API error codes
    return [401, 403, 429, 500].includes(status);
  }

  return [401, 403, 500].includes(status);
}
```

### Dependencies

**New Dependencies:**
- None (uses existing `@ai-sdk/openai`)

**Modified Dependencies:**
- `@ai-sdk/openai` - already used, leverage for GLM integration

### API Contract

#### User Configuration

```typescript
// shortest.config.ts
export default {
  headless: false,
  baseUrl: "http://localhost:3000",
  ai: {
    provider: "glm",
    model: "glm-4-plus",
    apiKey: process.env.ZHIPU_API_KEY, // optional
  },
} satisfies ShortestConfig;
```

#### Environment Variables

```bash
ZHIPU_API_KEY=your_api_key_here
# or
SHORTEST_GLM_API_KEY=your_api_key_here
```

## Testing Strategy

### Unit Tests

1. **Provider Creation** (`packages/shortest/src/ai/provider.test.ts`)
   - Test GLM provider creation with valid config
   - Test API key resolution (config → env var)
   - Test base URL configuration
   - Test invalid provider handling

2. **Tool Registry** (`packages/shortest/src/tools/tool-registry.test.ts`)
   - Test GLM tool retrieval
   - Test tool format compatibility
   - Test model family mapping

### Integration Tests

1. **API Connectivity**
   - Test real GLM API calls with test API key
   - Verify function calling works
   - Test error handling and retries

2. **Browser Automation**
   - Test computer tool with GLM
   - Test bash tool with GLM
   - Verify tool execution and response handling

### E2E Tests

1. **Test Suite Compatibility**
   - Run existing test suite with GLM provider
   - Verify backward compatibility with Anthropic
   - Test multiple GLM models

2. **Configuration Tests**
   - Test different GLM models
   - Test API key configuration methods
   - Test custom base URL configuration

### Test Configuration

```typescript
// shortest.config.test.ts
export default {
  headless: true,
  baseUrl: "http://localhost:3000",
  ai: {
    provider: "glm",
    model: "glm-4-flash", // Faster for testing
    apiKey: process.env.ZHIPU_TEST_API_KEY,
  },
} satisfies ShortestConfig;
```

## Implementation Phases

### Phase 1: Core Provider Support
- Update configuration schema
- Implement GLM provider creation
- Add basic unit tests

### Phase 2: Tool Integration
- Implement GLM tool support
- Update tool registry
- Add tool tests

### Phase 3: Error Handling & Testing
- Implement error handling
- Add integration tests
- Run E2E test suite

### Phase 4: Documentation & Examples
- Update README with GLM examples
- Add configuration examples
- Document GLM-specific considerations

## Migration Path

### For Existing Users

No migration required. GLM support is opt-in:

1. Users wanting GLM: Update `shortest.config.ts` with `provider: "glm"`
2. Existing Anthropic users: No changes needed

### For New Users

New users can choose either provider during initialization:

```bash
npx @antiwork/shortest init
# Select provider: anthropic | glm
```

## Risks & Mitigations

### Risk 1: GLM API Compatibility Issues

**Mitigation:**
- Use battle-tested `@ai-sdk/openai` package
- Comprehensive testing with multiple GLM models
- Fallback to Anthropic if GLM fails

### Risk 2: Tool Format Differences

**Mitigation:**
- OpenAI SDK handles most translation
- Test tool functionality thoroughly
- Document any GLM-specific limitations

### Risk 3: Performance Differences

**Mitigation:**
- Benchmark GLM vs Anthropic performance
- Document performance characteristics
- Allow users to choose based on needs

## Success Criteria

1. ✅ Users can configure GLM provider in `shortest.config.ts`
2. ✅ GLM models can run existing test suite without modifications
3. ✅ Function calling works with browser automation tools
4. ✅ Error handling is robust and provider-specific
5. ✅ All tests pass (unit, integration, E2E)
6. ✅ Documentation is complete and accurate
7. ✅ Backward compatibility with Anthropic is maintained

## Future Enhancements

1. **Additional Providers**: Use pattern to add more OpenAI-compatible providers
2. **Provider Abstraction**: Create generic provider interface for easier additions
3. **Model-Specific Optimizations**: Tune prompts and tools per model
4. **Cost Optimization**: Add cost tracking and model recommendations
5. **Provider Failover**: Implement automatic provider fallback on errors

## References

- [Zhipu AI Documentation](https://open.bigmodel.cn/dev/api)
- [Vercel AI SDK - OpenAI Provider](https://sdk.vercel.ai/providers/ai-sdk-providers/openai)
- [Shortest Configuration](https://github.com/antiwork/shortest/blob/main/packages/shortest/src/types/config.ts)
- [Anthropic Tool Use](https://docs.anthropic.com/en/docs/agents-and-tools)
