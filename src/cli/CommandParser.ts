export type ParsedCommand =
  | { type: "login"; name: string }
  | { type: "deposit"; amount: number }
  | { type: "withdraw"; amount: number }
  | { type: "transfer"; target: string; amount: number }
  | { type: "logout" }
  | { type: "help" }
  | { type: "empty" }
  | { type: "unknown"; raw: string };

export class CommandParser {
  parse(line: string): ParsedCommand {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      return { type: "empty" };
    }

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case "login": {
        if (parts.length < 2) {
          throw new Error("Usage: login [name]");
        }
        const name = parts.slice(1).join(" ");
        return { type: "login", name };
      }
      case "deposit": {
        if (parts.length !== 2) {
          throw new Error("Usage: deposit [amount]");
        }
        return { type: "deposit", amount: this.parseAmount(parts[1]) };
      }
      case "withdraw": {
        if (parts.length !== 2) {
          throw new Error("Usage: withdraw [amount]");
        }
        return { type: "withdraw", amount: this.parseAmount(parts[1]) };
      }
      case "transfer": {
        if (parts.length !== 3) {
          throw new Error("Usage: transfer [target] [amount]");
        }
        return {
          type: "transfer",
          target: parts[1],
          amount: this.parseAmount(parts[2]),
        };
      }
      case "logout": {
        if (parts.length !== 1) {
          throw new Error("Usage: logout");
        }
        return { type: "logout" };
      }
      case "help": {
        return { type: "help" };
      }
      default:
        return { type: "unknown", raw: trimmed };
    }
  }

  private parseAmount(raw: string): number {
    if (!/^\d+$/.test(raw)) {
      throw new Error("Amount must be a positive whole number");
    }
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be a positive whole number");
    }
    return amount;
  }
}
