import { describe, expect, it } from "vitest";
import { createApp } from "../src/app/createApp";

describe("CommandHandler edge cases", () => {
  it("requires login before money operations", () => {
    const { handler } = createApp();
    expect(handler.handleLine("deposit 10")[0]).toMatch(/Please login first/);
    expect(handler.handleLine("withdraw 10")[0]).toMatch(/Please login first/);
    expect(handler.handleLine("transfer Bob 10")[0]).toMatch(/Please login first/);
    expect(handler.handleLine("logout")[0]).toMatch(/Please login first/);
  });

  it("prevents double login without logout", () => {
    const { handler } = createApp();
    handler.handleLine("login Alice");
    expect(handler.handleLine("login Bob")[0]).toMatch(/Already logged in/);
  });

  it("handles insufficient funds on withdraw", () => {
    const { handler } = createApp();
    handler.handleLine("login Alice");
    handler.handleLine("deposit 10");
    expect(handler.handleLine("withdraw 50")[0]).toMatch(/Insufficient funds/);
    expect(handler.handleLine("deposit 0")[0]).toMatch(/Error/);
  });

  it("rejects transfer to self", () => {
    const { handler } = createApp();
    handler.handleLine("login Alice");
    handler.handleLine("deposit 50");
    expect(handler.handleLine("transfer Alice 10")[0]).toMatch(
      /Cannot transfer to yourself/
    );
  });

  it("supports withdraw when funds are available", () => {
    const { handler } = createApp();
    handler.handleLine("login Alice");
    handler.handleLine("deposit 100");
    expect(handler.handleLine("withdraw 40")).toEqual(["Your balance is $60"]);
  });

  it("returns help text", () => {
    const { handler } = createApp();
    const lines = handler.handleLine("help");
    expect(lines[0]).toMatch(/Available commands/);
    expect(lines.some((l) => l.includes("login"))).toBe(true);
  });
});
