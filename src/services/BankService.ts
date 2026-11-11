import { Customer } from "../domain/Customer";
import { CustomerRepository } from "./CustomerRepository";

export interface AccountSnapshot {
  balance: number;
  owedTo: ReadonlyArray<{ name: string; amount: number }>;
  owedFrom: ReadonlyArray<{ name: string; amount: number }>;
}

export interface TransferOutcome {
  transferredAmount: number;
  target: string;
}

export interface DepositOutcome {
  settlements: Array<{ target: string; amount: number }>;
}

export class BankService {
  constructor(private readonly repository: CustomerRepository) {}

  login(name: string): Customer {
    this.ensureNonEmptyName(name);
    return this.repository.getOrCreate(name);
  }

  getSnapshot(customer: Customer): AccountSnapshot {
    return {
      balance: customer.balance,
      owedTo: customer.listDebtsTo(),
      owedFrom: this.repository
        .findDebtorsOf(customer.name)
        .map(({ customer: debtor, amount }) => ({
          name: debtor.name,
          amount,
        })),
    };
  }

  deposit(customer: Customer, amount: number): DepositOutcome {
    this.ensurePositiveAmount(amount);

    let remaining = amount;
    const settlements: Array<{ target: string; amount: number }> = [];

    for (const { name: creditor } of customer.listDebtsTo()) {
      if (remaining <= 0) {
        break;
      }
      const owed = customer.getDebtTo(creditor);
      const pay = Math.min(remaining, owed);
      customer.reduceDebtTo(creditor, pay);
      this.repository.getOrCreate(creditor).credit(pay);
      settlements.push({ target: creditor, amount: pay });
      remaining -= pay;
    }

    if (remaining > 0) {
      customer.credit(remaining);
    }

    return { settlements };
  }

  withdraw(customer: Customer, amount: number): void {
    this.ensurePositiveAmount(amount);
    if (amount > customer.balance) {
      throw new Error("Insufficient funds");
    }
    customer.debit(amount);
  }

  transfer(sender: Customer, targetName: string, amount: number): TransferOutcome {
    this.ensurePositiveAmount(amount);
    this.ensureNonEmptyName(targetName);

    if (targetName === sender.name) {
      throw new Error("Cannot transfer to yourself");
    }

    const target = this.repository.getOrCreate(targetName);
    let remaining = amount;
    let transferredAmount = 0;

    const owedByTarget = target.getDebtTo(sender.name);
    if (owedByTarget > 0 && remaining > 0) {
      const settled = target.reduceDebtTo(sender.name, remaining);
      remaining -= settled;
    }

    if (remaining <= 0) {
      return { transferredAmount: 0, target: target.name };
    }

    const cash = sender.debitUpTo(remaining);
    if (cash > 0) {
      target.credit(cash);
      transferredAmount += cash;
      remaining -= cash;
    }

    if (remaining > 0) {
      sender.increaseDebtTo(target.name, remaining);
    }

    return { transferredAmount, target: target.name };
  }

  private ensurePositiveAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
    if (!Number.isInteger(amount)) {
      throw new Error("Amount must be a whole number");
    }
  }

  private ensureNonEmptyName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Name is required");
    }
  }
}
