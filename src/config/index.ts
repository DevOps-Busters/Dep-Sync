import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { AppConfig, UpdateStrategy } from "../types";
import { Logger } from "../utils/logger";

export class Config {
  private config: AppConfig;
  private logger: Logger;
  private configPath: string;

  constructor(logger: Logger) {
    this.logger = logger;
    this.configPath = path.join(process.cwd(), ".depsync.env");
    this.config = this.getDefaults();
    this.load();
  }

  private getDefaults(): AppConfig {
    return {
      languages: {
        nodejs: true,
        python: true,
        docker: true,
        java: false,
      },
      updateStrategy: "minor",
      runTests: true,
      runSecurityAudit: true,
      autoCommit: true,
      createPullRequest: true,
      parallelExecution: true,
      maxParallelJobs: 4,
      gitBranchPrefix: "deps/update",
      gitCommitMessage: "chore(deps): update dependencies",
      logFile: "./depsync.log",
      changelogFile: "./CHANGELOG.md",
      generateReports: false,
      reportOutputDir: "./reports",
    };
  }

  load(): void {
    // Load from .env file if exists
    if (fs.existsSync(this.configPath)) {
      dotenv.config({ path: this.configPath });
    }

    // Load from environment variables
    const envConfig = {
      languages: {
        nodejs: process.env.ENABLE_NODEJS !== "false",
        python: process.env.ENABLE_PYTHON !== "false",
        docker: process.env.ENABLE_DOCKER !== "false",
        java: process.env.ENABLE_JAVA === "true",
      },
      updateStrategy: (process.env.UPDATE_STRATEGY ||
        "minor") as UpdateStrategy,
      runTests: process.env.RUN_TESTS !== "false",
      runSecurityAudit: process.env.RUN_SECURITY_AUDIT !== "false",
      autoCommit: process.env.AUTO_COMMIT !== "false",
      createPullRequest: process.env.CREATE_PULL_REQUEST !== "false",
      parallelExecution: process.env.PARALLEL_EXECUTION !== "false",
      maxParallelJobs: parseInt(process.env.MAX_PARALLEL_JOBS || "4", 10),
      gitBranchPrefix: process.env.GIT_BRANCH_PREFIX || "deps/update",
      gitCommitMessage:
        process.env.GIT_COMMIT_MESSAGE || "chore(deps): update dependencies",
      logFile: process.env.LOG_FILE || "./depsync.log",
      changelogFile: process.env.CHANGELOG_FILE || "./CHANGELOG.md",
      generateReports: process.env.GENERATE_REPORTS === "true",
      reportOutputDir: process.env.REPORT_OUTPUT_DIR || "./reports",
    };

    this.config = { ...this.config, ...envConfig };
  }

  getAll(): AppConfig {
    return this.config;
  }

  get(key: string): string | boolean | number | AppConfig {
    // Handle nested keys like 'languages.nodejs'
    if (key.includes(".")) {
      const parts = key.split(".");
      let value: any = this.config;
      for (const part of parts) {
        value = value?.[part];
      }
      return value !== undefined ? value : "";
    }

    // Handle environment variable style names
    const envKey = key
      .toUpperCase()
      .replace(/([A-Z])/g, "_$1")
      .replace(/^_/, "");

    const value = (this.config as any)[key] || process.env[envKey];
    return value !== undefined ? value : "";
  }

  set(key: keyof AppConfig, value: any): void {
    (this.config as any)[key] = value;
  }

  getLanguages(): string[] {
    const langs: string[] = [];
    if (this.config.languages.nodejs) langs.push("nodejs");
    if (this.config.languages.python) langs.push("python");
    if (this.config.languages.docker) langs.push("docker");
    if (this.config.languages.java) langs.push("java");
    return langs;
  }

  isLanguageEnabled(language: string): boolean {
    return (this.config.languages as any)[language] === true;
  }

  print(): void {
    this.logger.section("Configuration");
    this.logger.log(`  Languages: ${this.getLanguages().join(", ")}`);
    this.logger.log(`  Strategy: ${this.config.updateStrategy}`);
    this.logger.log(`  Run Tests: ${this.config.runTests}`);
    this.logger.log(`  Run Audit: ${this.config.runSecurityAudit}`);
    this.logger.log(`  Parallel: ${this.config.parallelExecution}`);
    this.logger.log(`  Log File: ${this.config.logFile}`);
  }

  validate(): boolean {
    const validStrategies: UpdateStrategy[] = ["patch", "minor", "major"];
    if (!validStrategies.includes(this.config.updateStrategy)) {
      this.logger.error(
        `Invalid update strategy: ${this.config.updateStrategy}`,
      );
      return false;
    }

    if (this.config.maxParallelJobs < 1 || this.config.maxParallelJobs > 32) {
      this.logger.error(
        `Invalid max parallel jobs: ${this.config.maxParallelJobs}`,
      );
      return false;
    }

    return true;
  }
}
