import { beforeEach, describe, expect, it } from "vitest";
import { shortest } from "./index";

describe("shortest array syntax", () => {
  beforeEach(() => {
    const registry = global.__shortest__.registry;
    registry.tests.clear();
    registry.currentFileTests = [];
    registry.currentFilePath = "/test/chained.test.ts";
    registry.directTestCount = 0;
  });

  it("applies shared payload to every step in a chained test", () => {
    const authPayload = {
      authPayload: { username: "user@example.com", password: "secret" },
    };

    shortest(
      ["Log in with email and password", "Open account settings"],
      authPayload,
    );

    const steps = global.__shortest__.registry.currentFileTests;

    expect(steps).toHaveLength(2);
    expect(steps[0].payload).toEqual(authPayload);
    expect(steps[1].payload).toEqual(authPayload);
  });

  it("does not duplicate the last step when payload is provided", () => {
    shortest(["First step", "Second step"], { token: "abc" });

    const steps = global.__shortest__.registry.currentFileTests;

    expect(steps).toHaveLength(2);
    expect(steps.map((step) => step.name)).toEqual([
      "First step",
      "Second step",
    ]);
  });
});
