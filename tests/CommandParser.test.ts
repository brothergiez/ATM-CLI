import { describe, expect, it } from "vitest";
import { CommandParser } from "../src/cli/CommandParser";

describe("CommandParser", () => {
  const parser = new CommandParser();

  it("parses supported commands", () => {
    expect(parser.parse("login Alice")).toEqual({ type: "login", name: "Alice" });
    expect(parser.parse("deposit 100")).toEqual({ type: "deposit", amount: 100 });
    expect(parser.parse("withdraw 20")).toEqual({ type: "withdraw", amount: 20 });
    expect(parser.parse("transfer Bob 50")).toEqual({
      type: "transfer",
      target: "Bob",
      amount: 50,
    });
    expect(parser.parse("logout")).toEqual({ type: "logout" });
    expect(parser.parse("help")).toEqual({ type: "help" });
    expect(parser.parse("   ")).toEqual({ type: "empty" });
  });

  it("is case-insensitive for command names", () => {
    expect(parser.parse("LOGIN Alice").type).toBe("login");
    expect(parser.parse("Deposit 10").type).toBe("deposit");
  });

  it("rejects invalid amounts and usage", () => {
    expect(() => parser.parse("deposit")).toThrow(/Usage/);
    expect(() => parser.parse("deposit abc")).toThrow(/positive whole number/);
    expect(() => parser.parse("deposit 0")).toThrow(/positive whole number/);
    expect(() => parser.parse("deposit -1")).toThrow(/positive whole number/);
    expect(() => parser.parse("deposit 1.5")).toThrow(/positive whole number/);
    expect(() => parser.parse("transfer Bob")).toThrow(/Usage/);
    expect(() => parser.parse("login")).toThrow(/Usage/);
  });

  it("returns unknown for unsupported commands", () => {
    expect(parser.parse("foo")).toEqual({ type: "unknown", raw: "foo" });
  });
});
