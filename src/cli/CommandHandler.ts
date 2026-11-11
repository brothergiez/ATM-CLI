import { BankService } from "../services/BankService";
import { CommandParser, ParsedCommand } from "./CommandParser";
import { MessageFormatter } from "./MessageFormatter";
import { Session } from "./Session";

const HELP_TEXT = [
  "Available commands:",
  "  login [name]              - Log in (creates customer if needed)",
  "  deposit [amount]          - Deposit funds",
  "  withdraw [amount]         - Withdraw funds",
  "  transfer [target] [amount] - Transfer funds to another customer",
  "  logout                    - Log out",
  "  help                      - Show this help",
];

export class CommandHandler {
  constructor(
    private readonly bank: BankService,
    private readonly session: Session,
    private readonly parser: CommandParser,
    private readonly formatter: MessageFormatter
  ) {}

  handleLine(line: string): string[] {
    let command: ParsedCommand;
    try {
      command = this.parser.parse(line);
    } catch (error) {
      return [this.formatter.error(this.errorMessage(error))];
    }

    try {
      return this.dispatch(command);
    } catch (error) {
      return [this.formatter.error(this.errorMessage(error))];
    }
  }

  private dispatch(command: ParsedCommand): string[] {
    switch (command.type) {
      case "empty":
        return [];
      case "help":
        return [...HELP_TEXT];
      case "unknown":
        return [this.formatter.error(`Unknown command: ${command.raw}. Type 'help' for usage.`)];
      case "login":
        return this.login(command.name);
      case "logout":
        return this.logout();
      case "deposit":
        return this.deposit(command.amount);
      case "withdraw":
        return this.withdraw(command.amount);
      case "transfer":
        return this.transfer(command.target, command.amount);
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  }

  private login(name: string): string[] {
    if (this.session.isLoggedIn) {
      throw new Error("Already logged in. Please logout first");
    }
    const customer = this.bank.login(name);
    this.session.login(customer);
    const snapshot = this.bank.getSnapshot(customer);
    return [this.formatter.hello(customer.name), ...this.formatter.statusLines(snapshot)];
  }

  private logout(): string[] {
    const customer = this.session.logout();
    return [this.formatter.goodbye(customer.name)];
  }

  private deposit(amount: number): string[] {
    const customer = this.session.requireCustomer();
    const { settlements } = this.bank.deposit(customer, amount);
    const lines: string[] = [];
    for (const settlement of settlements) {
      lines.push(this.formatter.transferred(settlement.amount, settlement.target));
    }
    const snapshot = this.bank.getSnapshot(customer);
    lines.push(...this.formatter.statusLines(snapshot));
    return lines;
  }

  private withdraw(amount: number): string[] {
    const customer = this.session.requireCustomer();
    this.bank.withdraw(customer, amount);
    const snapshot = this.bank.getSnapshot(customer);
    return this.formatter.statusLines(snapshot);
  }

  private transfer(target: string, amount: number): string[] {
    const customer = this.session.requireCustomer();
    const outcome = this.bank.transfer(customer, target, amount);
    const lines: string[] = [];
    if (outcome.transferredAmount > 0) {
      lines.push(this.formatter.transferred(outcome.transferredAmount, outcome.target));
    }
    const snapshot = this.bank.getSnapshot(customer);
    lines.push(...this.formatter.statusLines(snapshot));
    return lines;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
