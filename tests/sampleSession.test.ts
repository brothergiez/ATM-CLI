import { describe, expect, it } from "vitest";
import { createApp } from "../src/app/createApp";

/**
 * Replays the official sample session from problem.md and asserts
 * required output lines appear in order.
 */
describe("sample session from problem.md", () => {
  it("matches the required outputs for the documented scenario", () => {
    const { handler } = createApp();

    const run = (line: string) => handler.handleLine(line);

    expect(run("login Alice")).toEqual([
      "Hello, Alice!",
      "Your balance is $0",
    ]);

    expect(run("deposit 100")).toEqual(["Your balance is $100"]);

    expect(run("logout")).toEqual(["Goodbye, Alice!"]);

    expect(run("login Bob")).toEqual([
      "Hello, Bob!",
      "Your balance is $0",
    ]);

    expect(run("deposit 80")).toEqual(["Your balance is $80"]);

    expect(run("transfer Alice 50")).toEqual([
      "Transferred $50 to Alice",
      "Your balance is $30",
    ]);

    expect(run("transfer Alice 100")).toEqual([
      "Transferred $30 to Alice",
      "Your balance is $0",
      "Owed $70 to Alice",
    ]);

    expect(run("deposit 30")).toEqual([
      "Transferred $30 to Alice",
      "Your balance is $0",
      "Owed $40 to Alice",
    ]);

    expect(run("logout")).toEqual(["Goodbye, Bob!"]);

    expect(run("login Alice")).toEqual([
      "Hello, Alice!",
      "Your balance is $210",
      "Owed $40 from Bob",
    ]);

    expect(run("transfer Bob 30")).toEqual([
      "Your balance is $210",
      "Owed $10 from Bob",
    ]);

    expect(run("logout")).toEqual(["Goodbye, Alice!"]);

    expect(run("login Bob")).toEqual([
      "Hello, Bob!",
      "Your balance is $0",
      "Owed $10 to Alice",
    ]);

    expect(run("deposit 100")).toEqual([
      "Transferred $10 to Alice",
      "Your balance is $90",
    ]);

    expect(run("logout")).toEqual(["Goodbye, Bob!"]);
  });
});
