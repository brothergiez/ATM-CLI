export class Customer {
  readonly name: string;
  private _balance: number;
  private readonly debtsTo: Map<string, number>;

  constructor(name: string) {
    this.name = name;
    this._balance = 0;
    this.debtsTo = new Map();
  }

  get balance(): number {
    return this._balance;
  }

  credit(amount: number): void {
    this.ensurePositive(amount);
    this._balance += amount;
  }

  debit(amount: number): void {
    this.ensurePositive(amount);
    if (amount > this._balance) {
      throw new Error("Insufficient funds");
    }
    this._balance -= amount;
  }

  debitUpTo(amount: number): number {
    this.ensurePositive(amount);
    const taken = Math.min(amount, this._balance);
    this._balance -= taken;
    return taken;
  }

  getDebtTo(counterparty: string): number {
    return this.debtsTo.get(counterparty) ?? 0;
  }

  listDebtsTo(): ReadonlyArray<{ name: string; amount: number }> {
    return [...this.debtsTo.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  increaseDebtTo(counterparty: string, amount: number): void {
    this.ensurePositive(amount);
    const current = this.getDebtTo(counterparty);
    this.debtsTo.set(counterparty, current + amount);
  }

  reduceDebtTo(counterparty: string, amount: number): number {
    this.ensurePositive(amount);
    const current = this.getDebtTo(counterparty);
    if (current <= 0) {
      return 0;
    }
    const settled = Math.min(current, amount);
    const remaining = current - settled;
    if (remaining === 0) {
      this.debtsTo.delete(counterparty);
    } else {
      this.debtsTo.set(counterparty, remaining);
    }
    return settled;
  }

  private ensurePositive(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
  }
}
