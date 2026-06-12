import { describe, expect, it } from "vitest";
import { AriaSnapshotSession } from "@/browser/snapshot/aria-snapshot-session";
import { formatPageState } from "@/browser/snapshot/format-page-state";

describe("formatPageState", () => {
  it("formats page url, title, and snapshot", () => {
    const output = formatPageState({
      url: "http://localhost/login",
      title: "Login",
      snapshot: '- button "Sign In" [ref=e21]',
    });

    expect(output).toContain("### Page");
    expect(output).toContain("http://localhost/login");
    expect(output).toContain('[ref=e21]');
  });
});

describe("AriaSnapshotSession", () => {
  it("normalizes ref values", () => {
    const session = new AriaSnapshotSession({} as any);
    expect(session.normalizeRef("e12")).toBe("e12");
    expect(session.normalizeRef("ref=e12")).toBe("e12");
  });
});
