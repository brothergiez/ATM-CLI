import { describe, expect, it } from "vitest";
import { BankService } from "../src/services/BankService";
import { CustomerRepository } from "../src/services/CustomerRepository";

function setup() {
  const repository = new CustomerRepository();
  const bank = new BankService(repository);
  return { bank, repository };
}

describe("BankService", () => {
  it("creates a customer on first login with zero balance", () => {
    const { bank } = setup();
    const alice = bank.login("Alice");
    expect(alice.balance).toBe(0);
    expect(bank.getSnapshot(alice)).toEqual({
      balance: 0,
      owedTo: [],
      owedFrom: [],
    });
  });

  it("deposits and withdraws from balance", () => {
    const { bank } = setup();
    const alice = bank.login("Alice");
    bank.deposit(alice, 100);
    expect(alice.balance).toBe(100);
    bank.withdraw(alice, 40);
    expect(alice.balance).toBe(60);
  });

  it("rejects withdraw when funds are insufficient", () => {
    const { bank } = setup();
    const alice = bank.login("Alice");
    bank.deposit(alice, 10);
    expect(() => bank.withdraw(alice, 11)).toThrow("Insufficient funds");
    expect(alice.balance).toBe(10);
  });

  it("rejects non-positive and non-integer amounts", () => {
    const { bank } = setup();
    const alice = bank.login("Alice");
    expect(() => bank.deposit(alice, 0)).toThrow();
    expect(() => bank.deposit(alice, -5)).toThrow();
    expect(() => bank.deposit(alice, 1.5)).toThrow();
  });

  it("rejects transfer to self", () => {
    const { bank } = setup();
    const alice = bank.login("Alice");
    bank.deposit(alice, 50);
    expect(() => bank.transfer(alice, "Alice", 10)).toThrow(
      "Cannot transfer to yourself"
    );
  });

  it("creates debt when transfer exceeds balance", () => {
    const { bank } = setup();
    const bob = bank.login("Bob");
    bank.login("Alice");
    bank.deposit(bob, 30);
    const outcome = bank.transfer(bob, "Alice", 100);
    expect(outcome.transferredAmount).toBe(30);
    expect(bob.balance).toBe(0);
    expect(bob.getDebtTo("Alice")).toBe(70);
  });

  it("uses deposit to settle outstanding debts before crediting balance", () => {
    const { bank } = setup();
    const bob = bank.login("Bob");
    const alice = bank.login("Alice");
    bank.deposit(bob, 30);
    bank.transfer(bob, "Alice", 100);
    const { settlements } = bank.deposit(bob, 30);
    expect(settlements).toEqual([{ target: "Alice", amount: 30 }]);
    expect(bob.balance).toBe(0);
    expect(bob.getDebtTo("Alice")).toBe(40);
    expect(alice.balance).toBe(60);
  });

  it("reduces debtor balance-free when creditor transfers to debtor", () => {
    const { bank } = setup();
    const bob = bank.login("Bob");
    const alice = bank.login("Alice");
    bank.deposit(bob, 30);
    bank.transfer(bob, "Alice", 100);
    bank.deposit(bob, 30);
    // Alice has 60, Bob owes 40
    const before = alice.balance;
    const outcome = bank.transfer(alice, "Bob", 30);
    expect(outcome.transferredAmount).toBe(0);
    expect(alice.balance).toBe(before);
    expect(bob.getDebtTo("Alice")).toBe(10);
  });
});
