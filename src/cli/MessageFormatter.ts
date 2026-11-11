import { AccountSnapshot } from "../services/BankService";

export class MessageFormatter {
  formatMoney(amount: number): string {
    return `$${amount}`;
  }

  hello(name: string): string {
    return `Hello, ${name}!`;
  }

  goodbye(name: string): string {
    return `Goodbye, ${name}!`;
  }

  balance(amount: number): string {
    return `Your balance is ${this.formatMoney(amount)}`;
  }

  transferred(amount: number, target: string): string {
    return `Transferred ${this.formatMoney(amount)} to ${target}`;
  }

  owedTo(amount: number, name: string): string {
    return `Owed ${this.formatMoney(amount)} to ${name}`;
  }

  owedFrom(amount: number, name: string): string {
    return `Owed ${this.formatMoney(amount)} from ${name}`;
  }

  statusLines(snapshot: AccountSnapshot): string[] {
    const lines = [this.balance(snapshot.balance)];
    for (const debt of snapshot.owedTo) {
      lines.push(this.owedTo(debt.amount, debt.name));
    }
    for (const debt of snapshot.owedFrom) {
      lines.push(this.owedFrom(debt.amount, debt.name));
    }
    return lines;
  }

  error(message: string): string {
    return `Error: ${message}`;
  }
}
