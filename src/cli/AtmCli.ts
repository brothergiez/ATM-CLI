import * as readline from "readline";
import { CommandHandler } from "./CommandHandler";

export interface IoStreams {
  input: NodeJS.ReadableStream;
  output: NodeJS.WritableStream;
}

export class AtmCli {
  constructor(
    private readonly handler: CommandHandler,
    private readonly io: IoStreams = { input: process.stdin, output: process.stdout }
  ) {}

  start(): void {
    const rl = readline.createInterface({
      input: this.io.input,
      output: this.io.output,
      prompt: "$ ",
    });

    rl.prompt();

    rl.on("line", (line) => {
      const lines = this.handler.handleLine(line);
      for (const out of lines) {
        this.io.output.write(`${out}\n`);
      }
      if (lines.length > 0) {
        this.io.output.write("\n");
      }
      rl.prompt();
    });

    rl.on("close", () => {
      this.io.output.write("\n");
      process.exit(0);
    });
  }
}
