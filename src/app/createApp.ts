import { AtmCli } from "../cli/AtmCli";
import { CommandHandler } from "../cli/CommandHandler";
import { CommandParser } from "../cli/CommandParser";
import { MessageFormatter } from "../cli/MessageFormatter";
import { Session } from "../cli/Session";
import { BankService } from "../services/BankService";
import { CustomerRepository } from "../services/CustomerRepository";

export function createApp(): { cli: AtmCli; handler: CommandHandler } {
  const repository = new CustomerRepository();
  const bank = new BankService(repository);
  const session = new Session();
  const parser = new CommandParser();
  const formatter = new MessageFormatter();
  const handler = new CommandHandler(bank, session, parser, formatter);
  const cli = new AtmCli(handler);
  return { cli, handler };
}
