import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";

export class Logger {
  private logFile: string;

  constructor(logFile: string) {
    this.logFile = logFile;
    this.ensureLogFile();
  }

  private ensureLogFile(): void {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private writeToFile(message: string): void {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(this.logFile, `[${timestamp}] ${message}\n`);
  }

  log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(chalk.blue(`[${timestamp}]`) + " " + message);
    this.writeToFile(message);
  }

  success(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
    this.writeToFile(`✅ ${message}`);
  }

  error(message: string): void {
    console.error(chalk.red(`❌ ${message}`));
    this.writeToFile(`❌ ERROR: ${message}`);
  }

  warning(message: string): void {
    console.warn(chalk.yellow(`⚠️  ${message}`));
    this.writeToFile(`⚠️  ${message}`);
  }

  info(message: string): void {
    console.log(chalk.cyan(`ℹ️  ${message}`));
    this.writeToFile(`ℹ️  ${message}`);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray(`🔍 ${message}`));
      this.writeToFile(`🔍 ${message}`);
    }
  }

  section(title: string): void {
    console.log(chalk.cyan.bold(`\n════ ${title} ════\n`));
    this.writeToFile(`\n════ ${title} ════`);
  }
}

// Global logger instance
let globalLogger: Logger;

export function getLogger(logFile: string = "depsync.log"): Logger {
  if (!globalLogger) {
    globalLogger = new Logger(logFile);
  }
  return globalLogger;
}
