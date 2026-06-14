import { describe, expect, it } from "vitest";
import { formatPayloadContextLines } from "./test-prompt";

describe("formatPayloadContextLines", () => {
  it("adds an Auth credentials line when payload wraps authPayload", () => {
    const lines = formatPayloadContextLines({
      authPayload: { username: "a@b.com", password: "secret" },
    });

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("authPayload");
    expect(lines[1]).toBe(
      'Auth credentials: {"username":"a@b.com","password":"secret"}',
    );
  });
});
