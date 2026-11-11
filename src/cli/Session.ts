import { Customer } from "../domain/Customer";

export class Session {
  private current: Customer | null = null;

  get customer(): Customer | null {
    return this.current;
  }

  get isLoggedIn(): boolean {
    return this.current !== null;
  }

  requireCustomer(): Customer {
    if (!this.current) {
      throw new Error("Please login first");
    }
    return this.current;
  }

  login(customer: Customer): void {
    this.current = customer;
  }

  logout(): Customer {
    const customer = this.requireCustomer();
    this.current = null;
    return customer;
  }
}
