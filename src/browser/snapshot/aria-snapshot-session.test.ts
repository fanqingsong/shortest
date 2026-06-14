import { describe, expect, it, vi } from "vitest";
import {
  AriaSnapshotSession,
  filterInteractiveSnapshot,
} from "@/browser/snapshot/aria-snapshot-session";
import {
  ACTION_SUCCESS_HINT,
  formatPageState,
  omitPageSnapshotText,
  PAGE_SECTION_HEADER,
  PAGE_UNCHANGED_LINE,
  STALE_SNAPSHOT_PLACEHOLDER,
} from "@/browser/snapshot/format-page-state";

describe("filterInteractiveSnapshot", () => {
  it("keeps interactive refs and drops decorative nodes", () => {
    const input = [
      "- document:",
      "  - heading \"Login\" [ref=e1]",
      "  - paragraph: Welcome back",
      "  - button \"Sign In\" [ref=e2]",
      "  - textbox \"Email\" [ref=e3]",
    ].join("\n");

    const output = filterInteractiveSnapshot(input);
    expect(output).toContain("[ref=e1]");
    expect(output).toContain("[ref=e2]");
    expect(output).toContain("[ref=e3]");
    expect(output).not.toContain("paragraph");
    expect(output).not.toContain("document");
  });

  it("returns original snapshot when filter would remove all refs", () => {
    const input = "- paragraph: No refs here";
    expect(filterInteractiveSnapshot(input)).toBe(input);
  });
});

describe("formatPageState", () => {
  it("formats page url, title, and snapshot", () => {
    const output = formatPageState({
      url: "http://localhost/login",
      title: "Login",
      snapshot: '- button "Sign In" [ref=e21]',
    });

    expect(output).toContain(PAGE_SECTION_HEADER);
    expect(output).toContain("http://localhost/login");
    expect(output).toContain('[ref=e21]');
  });

  it("omits page snapshot blocks for history pruning", () => {
    const text = `Test: login\n${formatPageState({
      url: "http://localhost/login",
      title: "Login",
      snapshot: '- button "Sign In" [ref=e21]',
    })}`;

    const trimmed = omitPageSnapshotText(text);
    expect(trimmed).toContain("Test: login");
    expect(trimmed).not.toContain("[ref=e21]");
    expect(trimmed).toContain(STALE_SNAPSHOT_PLACEHOLDER);
  });

  it("omits unchanged url and title on repeat snapshots", () => {
    const first = formatPageState({
      url: "http://localhost/login",
      title: "Login",
      snapshot: '- button "Sign In" [ref=e21]',
    });
    const second = formatPageState({
      url: "http://localhost/login",
      title: "Login",
      snapshot: '- button "Sign In" [ref=e21]',
      previousUrl: "http://localhost/login",
      previousTitle: "Login",
    });

    expect(first).toContain("http://localhost/login");
    expect(second).toContain(PAGE_UNCHANGED_LINE);
    expect(second).not.toContain("Page URL:");
  });
});

describe("AriaSnapshotSession", () => {
  it("normalizes ref values", () => {
    const session = new AriaSnapshotSession({} as any);
    expect(session.normalizeRef("e12")).toBe("e12");
    expect(session.normalizeRef("ref=e12")).toBe("e12");
  });

  it("returns short ack on successful click without re-capturing snapshot", async () => {
    const page = {
      locator: () => ({
        click: async () => {},
      }),
      ariaSnapshot: vi.fn(),
      url: () => "http://localhost",
      title: async () => "Page",
    };

    const session = new AriaSnapshotSession(page as any);
    const result = await session.click("e12");
    expect(result.output).toContain("Clicked e12.");
    expect(result.output).toContain(ACTION_SUCCESS_HINT);
    expect(page.ariaSnapshot).not.toHaveBeenCalled();
  });
});
