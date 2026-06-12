import { Tool } from "ai";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { z } from "zod";
import { ToolRegistry } from "./tool-registry";
import { BrowserTool } from "@/browser/core/browser-tool";
import { ShortestError } from "@/utils/errors";
import { GLMModel, AzureOpenAIModel } from "@/types/config";

describe("ToolRegistry", () => {
  let registry: ToolRegistry;
  let mockBrowserTool: BrowserTool;
  let mockSession: {
    snapshotOnly: ReturnType<typeof vi.fn>;
    click: ReturnType<typeof vi.fn>;
    fill: ReturnType<typeof vi.fn>;
    press: ReturnType<typeof vi.fn>;
    invalidate: ReturnType<typeof vi.fn>;
    captureFormatted: ReturnType<typeof vi.fn>;
  };

  const createMockTool = (name: string): Tool =>
    ({
      parameters: z.object({}),
      description: `Mock ${name} tool`,
      execute: vi.fn().mockResolvedValue(`Executed ${name}`),
      __meta: { name },
    }) as unknown as Tool;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockBrowserTool = {} as BrowserTool;
    mockSession = {
      snapshotOnly: vi.fn(),
      click: vi.fn(),
      fill: vi.fn(),
      press: vi.fn(),
      invalidate: vi.fn(),
      captureFormatted: vi.fn(),
    };
  });

  describe("registerTool", () => {
    it("registers a tool successfully", () => {
      const toolEntry = {
        name: "mockTool",
        category: "custom" as const,
        factory: (_browserTool: BrowserTool) => createMockTool("mockTool"),
      };

      registry.registerTool("mock_tool", toolEntry);

      const tools = registry.getTools(
        "glm",
        "glm-4",
        mockBrowserTool,
        mockSession as any,
      );
      expect(tools).toHaveProperty("mockTool");
    });

    it("throws an error when registering a duplicate tool", () => {
      const toolEntry = {
        name: "mockTool",
        category: "custom" as const,
        factory: (_browserTool: BrowserTool) => createMockTool("mockTool"),
      };

      registry.registerTool("mock_tool", toolEntry);

      expect(() => {
        registry.registerTool("mock_tool", toolEntry);
      }).toThrow("Tool with key 'mock_tool' already registered");
    });
  });

  describe("getTools", () => {
    it("returns custom tools with snapshot browser tools", () => {
      const customToolEntry = {
        name: "customTool",
        category: "custom" as const,
        factory: (_browserTool: BrowserTool) => createMockTool("customTool"),
      };

      registry.registerTool("custom_tool", customToolEntry);

      const tools = registry.getTools(
        "glm",
        "glm-4",
        mockBrowserTool,
        mockSession as any,
      );

      expect(tools).toHaveProperty("customTool");
      expect(tools).toHaveProperty("browser_snapshot");
      expect(tools).toHaveProperty("browser_click");
      expect(tools).toHaveProperty("bash");
    });

    it("throws when aria snapshot session is missing", () => {
      expect(() =>
        registry.getTools("glm", "glm-4", mockBrowserTool),
      ).toThrow(ShortestError);
    });
  });
});

describe("ToolRegistry - GLM Provider", () => {
  let registry: ToolRegistry;
  let mockBrowserTool: any;
  let mockSession: any;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockBrowserTool = {
      page: {},
    };
    mockSession = {
      snapshotOnly: vi.fn(),
      click: vi.fn(),
      fill: vi.fn(),
      press: vi.fn(),
      invalidate: vi.fn(),
      captureFormatted: vi.fn(),
    };
  });

  it("should return tools for GLM provider", () => {
    const tools = registry.getTools(
      "glm",
      "glm-4",
      mockBrowserTool,
      mockSession,
    );

    expect(tools).toBeDefined();
    expect(tools.browser_snapshot).toBeDefined();
    expect(tools.browser_click).toBeDefined();
    expect(tools.bash).toBeDefined();
  });

  it("should handle different GLM models", () => {
    const models: GLMModel[] = [
      "glm-4-plus",
      "glm-4",
      "glm-4-flash",
      "glm-3-turbo",
    ];

    models.forEach((model) => {
      const tools = registry.getTools(
        "glm",
        model,
        mockBrowserTool,
        mockSession,
      );
      expect(tools).toBeDefined();
    });
  });
});

describe("ToolRegistry - Azure OpenAI Provider", () => {
  let registry: ToolRegistry;
  let mockBrowserTool: any;
  let mockSession: any;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockBrowserTool = {
      page: {},
    };
    mockSession = {
      snapshotOnly: vi.fn(),
      click: vi.fn(),
      fill: vi.fn(),
      press: vi.fn(),
      invalidate: vi.fn(),
      captureFormatted: vi.fn(),
    };
  });

  it("should return tools for Azure provider", () => {
    const tools = registry.getTools(
      "azure",
      "gpt-4o",
      mockBrowserTool,
      mockSession,
    );

    expect(tools).toBeDefined();
    expect(tools.browser_fill).toBeDefined();
  });

  it("should handle different Azure models", () => {
    const models: AzureOpenAIModel[] = [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-4",
    ];

    models.forEach((model) => {
      const tools = registry.getTools(
        "azure",
        model,
        mockBrowserTool,
        mockSession,
      );
      expect(tools).toBeDefined();
    });
  });
});
