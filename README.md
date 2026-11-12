# ATM CLI

Command-line ATM simulation for a retail bank. Built with TypeScript.

## Requirements

- Node.js 18+
- npm

## Quick start

```bash
chmod +x start.sh
./start.sh
```

`start.sh` installs dependencies (if needed), builds TypeScript, and starts a **fresh** in-memory session (no data is kept between runs).

### Manual commands

```bash
npm install
npm run build
npm start
npm test
```

## Commands

| Command | Description |
|---------|-------------|
| `login [name]` | Log in; creates the customer if they do not exist |
| `deposit [amount]` | Deposit funds (settles your debts first) |
| `withdraw [amount]` | Withdraw funds from your cash balance |
| `transfer [target] [amount]` | Transfer to another customer (may create debt) |
| `logout` | Log out |
| `help` | Show command help |

Amounts must be positive whole numbers (e.g. `100`).

## Debt behaviour

- **Transfer more than your balance**: available cash is transferred; the shortfall becomes debt (`Owed $X to [name]`).
- **Deposit while you owe someone**: the deposit pays creditors first (shown as `Transferred $X to [name]`); any remainder goes to your balance.
- **Transfer to someone who owes you**: the amount reduces their debt to you first; your cash balance does not decrease for that portion.

## Project structure

```
src/
  app/           # Composition root (wiring)
  cli/           # Parser, session, handler, I/O loop, formatting
  domain/        # Customer entity
  services/      # Bank business rules
  repositories/  # In-memory customer store
  index.ts       # Entry point
tests/           # Vitest unit + sample-session tests
start.sh         # Required launcher
```

## Assumptions & deviations

1. **No persistence** — every `./start.sh` (or `npm start`) starts with an empty bank.
2. **Whole-number amounts only** — decimals and non-numeric values are rejected.
3. **Names are case-sensitive** — `Alice` and `alice` are different customers.
4. **Withdraw does not create debt** — insufficient funds returns an error.
5. **Cannot transfer to yourself**.
6. **Must logout before logging in as another user**.
7. **Multiple creditors** — deposits settle debts in alphabetical order by creditor name.
8. **Sample typo** — the problem sample uses `your balance is $30` (lowercase) once; this implementation consistently uses `Your balance is $...`.
9. **No third-party banking frameworks** — only TypeScript, Node built-ins, and Vitest for tests.

## Testing

```bash
npm test
```
