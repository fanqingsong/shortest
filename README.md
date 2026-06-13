<p align="center">
  <img src="https://github.com/user-attachments/assets/57d23950-206b-4640-a649-66a175660ade" alt="Shortest logo" width="128" />
</p>

# Shortest

AI-powered natural language end-to-end testing framework built on Playwright.

<video src="https://github.com/user-attachments/assets/d443279e-7364-452b-9f50-0c8dd0cf55fc" controls autoplay loop muted>
Your browser does not support the video tag.
</video>

## Features

- Natural language E2E tests — describe flows in plain English (or Chinese)
- **Snapshot/ref browser automation** — Playwright `ariaSnapshot` + element refs (`e12`, `e21`, …), not coordinate guessing
- Multiple AI providers: **GLM (Zhipu AI)**, Azure OpenAI, DashScope (Qwen), SiliconFlow
- GitHub login with 2FA support
- Email validation via Mailosaur
- Lifecycle hooks, test chaining, and API testing helpers

## About this fork

Fork of [antiwork/shortest](https://github.com/antiwork/shortest) with:

- First-class **GLM** support (including `glm-5.1` and coding API endpoint)
- **Snapshot/ref** interaction for all OpenAI-compatible providers (replaces legacy coordinate `computer` tools)
- Standalone usage example in [`example_standalone/`](./example_standalone)

## Requirements

- Node.js ≥ 18
- Playwright **≥ 1.60.0** (for `ariaSnapshot({ mode: 'ai' })` and `aria-ref` selectors)
- Chromium (or other browser): `pnpm exec playwright install chromium`

Peer dependencies: `playwright`, `ai`, `@ai-sdk/openai`, `dotenv`, `expect`

## Installation

```bash
# pnpm (recommended)
pnpm add -D github:fanqingsong/shortest

# npm
npm install -D github:fanqingsong/shortest
```

## Quick start

### 1. Configuration

Create `shortest.config.ts`:

```typescript
import type { ShortestConfig } from "@antiwork/shortest";

export default {
  headless: false,
  baseUrl: "http://localhost:3000",
  testPattern: "**/*.test.ts",
  ai: {
    provider: "glm",
    model: "glm-5.1",
    baseURL: "https://open.bigmodel.cn/api/coding/paas/v4",
  },
} satisfies ShortestConfig;
```

Supported `provider` values: `glm`, `azure`, `dashscope`, `siliconflow`.

### 2. Environment variables

Create `.env.local`:

```bash
ZHIPU_API_KEY=your_glm_api_key

# Optional: login test credentials
TEST_USERNAME=user@example.com
TEST_PASSWORD=your_password
```

Add to `.gitignore`:

```
.env.local
.shortest/
```

### 3. Write a test

```typescript
import { shortest } from "@antiwork/shortest";

shortest("Log in with email and password", {
  username: process.env.TEST_USERNAME,
  password: process.env.TEST_PASSWORD,
});
```

The AI receives an accessibility snapshot of the page and uses tools such as `browser_fill`, `browser_click`, and `browser_snapshot` with element refs from the snapshot — not x/y coordinates.

### 4. Run tests

```bash
pnpm exec shortest                  # all tests
pnpm exec shortest login.test.ts    # one file
pnpm exec shortest login.test.ts:23 # line number
pnpm exec shortest --headless       # headless browser
```

### Standalone example

```bash
cd example_standalone
pnpm install
pnpm test:local    # local HTML page
pnpm test:login    # requires app on http://localhost:8085
```

See [`example_standalone/`](./example_standalone) for config, `.env.local.example`, and sample tests.

## How browser automation works

```text
Page load → ariaSnapshot (YAML + [ref=eN])
         → AI reads refs from snapshot
         → browser_fill / browser_click / browser_press (aria-ref=eN)
         → fresh snapshot after each action
```

Refs are valid only for the latest snapshot. After navigation or major DOM changes, the agent calls `browser_snapshot` again.

Action replay cache is disabled in snapshot mode because refs are not stable across runs.

## AI provider configuration

### GLM (Zhipu AI) — recommended

```typescript
ai: {
  provider: "glm",
  model: "glm-5.1",
  baseURL: "https://open.bigmodel.cn/api/coding/paas/v4", // or /api/paas/v4/
}
```

API key: `ZHIPU_API_KEY` or `GLM_API_KEY` (or `ai.apiKey` in config).

**GLM 5.x:** `glm-5.1`, `glm-5.1-plus`, `glm-5.1-air`, `glm-5.1-flash`  
**GLM 4.x:** `glm-4-plus`, `glm-4`, `glm-4-flash`, `glm-4.7`, `glm-4.7-flash`, …  
**GLM 3.x:** `glm-3-turbo`

### Azure OpenAI

```typescript
ai: {
  provider: "azure",
  model: "gpt-4o",
  baseURL: "https://{resource}.openai.azure.com/openai/deployments/{deployment}",
}
```

API key: `AZURE_OPENAI_API_KEY`.

Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4`.

### DashScope (Qwen)

```typescript
ai: {
  provider: "dashscope",
  model: "qwen-plus",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
}
```

API key: `DASHSCOPE_API_KEY`.

### SiliconFlow

```typescript
ai: {
  provider: "siliconflow",
  model: "deepseek-ai/DeepSeek-V3",
  baseURL: "https://api.siliconflow.cn/v1",
}
```

API key: `SILICONFLOW_API_KEY`.

Optional browser options via `browser.contextOptions` — see [Playwright browser context](https://playwright.dev/docs/api/class-browser#browser-new-context).

## Advanced usage

### Callbacks (`.after` / `.before`)

```typescript
shortest("Sign in with email and password", { username, password }).after(
  async ({ page }) => {
    await page.waitForFunction(() => !window.location.hash.includes("login"));
    // custom assertions…
  },
);
```

### Lifecycle hooks

```typescript
shortest.beforeAll(async ({ page }) => { /* … */ });
shortest.beforeEach(async ({ page }) => { /* … */ });
shortest.afterEach(async ({ page }) => { /* … */ });
shortest.afterAll(async ({ page }) => { /* … */ });
```

### Chaining tests

```typescript
shortest([
  "user can log in with email and password",
  "user can open account settings",
]);
```

### API testing

```typescript
import { APIRequest } from "@antiwork/shortest";

const req = new APIRequest({ baseURL: "https://api.example.com" });

shortest(
  "Response lists only active users",
  req.fetch({ url: "/users", method: "GET", params: new URLSearchParams({ active: "true" }) }),
);
```

## CI

Run in headless mode and inject secrets in your pipeline:

```bash
ZHIPU_API_KEY=...
pnpm exec shortest --headless
```

## GitHub 2FA login

For GitHub auth flows, generate a TOTP secret and store it:

```bash
pnpm exec shortest github-code --secret=<OTP_SECRET>
```

Set `GITHUB_TOTP_SECRET` in `.env.local` when using the `github_login` tool.

## CLI development

Clone and build from source:

```bash
git clone https://github.com/fanqingsong/shortest.git
cd shortest
pnpm install
pnpm build
pnpm test:unit
```

Initialize a new project:

```bash
pnpm exec shortest init
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## License

MIT
