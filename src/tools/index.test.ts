import { describe, expect, it, vi } from "vitest";
import { createToolRegistry } from "./index";
import { createCheckEmailTool } from "@/ai/tools/custom/check_email";
import { createGithubLoginTool } from "@/ai/tools/custom/github_login";
import { createNavigateTool } from "@/ai/tools/custom/navigate";
import { createRunCallbackTool } from "@/ai/tools/custom/run_callback";
import { createSleepTool } from "@/ai/tools/custom/sleep";
import { BrowserTool } from "@/browser/core/browser-tool";

describe("tools/index", () => {
  describe("createToolRegistry", () => {
    it("creates a registry with all expected custom tools", () => {
      const registry = createToolRegistry();

      const mockBrowserTool = {
        execute: vi.fn().mockResolvedValue({}),
        resultToToolResultContent: vi.fn(),
      } as unknown as BrowserTool;

      const mockSession = {
        snapshotOnly: vi.fn(),
        click: vi.fn(),
        fill: vi.fn(),
        press: vi.fn(),
        invalidate: vi.fn(),
        captureFormatted: vi.fn(),
      };

      const tools = registry.getTools(
        "glm",
        "glm-4",
        mockBrowserTool,
        mockSession as any,
      );

      expect(tools).toHaveProperty("browser_snapshot");
      expect(tools).toHaveProperty("browser_click");
      expect(tools).toHaveProperty("bash");
      expect(tools).toHaveProperty("check_email");
      expect(tools).toHaveProperty("github_login");
      expect(tools).toHaveProperty("navigate");
      expect(tools).toHaveProperty("run_callback");
      expect(tools).toHaveProperty("sleep");

      const expectedToolCount = 10;
      expect(Object.keys(tools).length).toBe(expectedToolCount);

      const toolsMap = (registry as any).tools as Map<string, any>;

      const checkEmailTool = toolsMap.get("check_email");
      expect(checkEmailTool).toEqual({
        name: "check_email",
        category: "custom",
        factory: createCheckEmailTool,
      });

      const githubLoginTool = toolsMap.get("github_login");
      expect(githubLoginTool).toEqual({
        name: "github_login",
        category: "custom",
        factory: createGithubLoginTool,
      });

      const navigateTool = toolsMap.get("navigate");
      expect(navigateTool).toEqual({
        name: "navigate",
        category: "custom",
        factory: createNavigateTool,
      });

      const runCallbackTool = toolsMap.get("run_callback");
      expect(runCallbackTool).toEqual({
        name: "run_callback",
        category: "custom",
        factory: createRunCallbackTool,
      });

      const sleepTool = toolsMap.get("sleep");
      expect(sleepTool).toEqual({
        name: "sleep",
        category: "custom",
        factory: createSleepTool,
      });
    });

    it("provides tools with execute functionality", () => {
      const registry = createToolRegistry();

      const mockBrowserTool = {
        execute: vi.fn().mockResolvedValue({}),
        resultToToolResultContent: vi.fn(),
      } as unknown as BrowserTool;

      const mockSession = {
        snapshotOnly: vi.fn(),
        click: vi.fn(),
        fill: vi.fn(),
        press: vi.fn(),
        invalidate: vi.fn(),
        captureFormatted: vi.fn(),
      };

      const tools = registry.getTools(
        "glm",
        "glm-4",
        mockBrowserTool,
        mockSession as any,
      );

      Object.values(tools).forEach((tool) => {
        expect(tool).toHaveProperty("execute");
        expect(typeof tool.execute).toBe("function");
      });
    });

    it("registers tools with expected keys", () => {
      const registry = createToolRegistry();

      const toolsMap = (registry as any).tools as Map<string, any>;

      expect(toolsMap.has("check_email")).toBe(true);
      expect(toolsMap.has("github_login")).toBe(true);
      expect(toolsMap.has("navigate")).toBe(true);
      expect(toolsMap.has("run_callback")).toBe(true);
      expect(toolsMap.has("sleep")).toBe(true);

      expect(toolsMap.size).toBe(5);
    });
  });
});
