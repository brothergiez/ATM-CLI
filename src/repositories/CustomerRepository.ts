import { Customer } from "../domain/Customer";

export class CustomerRepository {
  private readonly customers = new Map<string, Customer>();

  findByName(name: string): Customer | undefined {
    return this.customers.get(name);
  }

  getOrCreate(name: string): Customer {
    let customer = this.customers.get(name);
    if (!customer) {
      customer = new Customer(name);
      this.customers.set(name, customer);
    }
    return customer;
  }

  findDebtorsOf(creditorName: string): Array<{ customer: Customer; amount: number }> {
    const result: Array<{ customer: Customer; amount: number }> = [];
    for (const customer of this.customers.values()) {
      if (customer.name === creditorName) {
        continue;
      }
      const amount = customer.getDebtTo(creditorName);
      if (amount > 0) {
        result.push({ customer, amount });
      }
    }
    return result.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  }
}
