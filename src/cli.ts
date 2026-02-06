#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { Logger, getLogger } from "./utils/logger";
import { Shell } from "./utils/shell";
import { Config } from "./config";
import { LanguageRegistry } from "./managers/LanguageRegistry";
import { GitManager } from "./managers/GitManager";
import { ToolManager } from "./managers/ToolManager";
import {
  DependencyManager,
  DependencyUpdateOptions,
} from "./managers/DependencyManager";

const logger = getLogger();
const shell = new Shell(logger);

const program = new Command();

program
  .name("dep-sync")
  .description(
    "🔄 Automated dependency updater for Node.js, Python, Docker, and Java projects",
  )
  .version("2.0.0");

// Main update command
program
  .command("update")
  .description("Perform full dependency update cycle")
  .option(
    "-s, --strategy <strategy>",
    "Update strategy: patch|minor|major",
    "minor",
  )
  .option("--skip-tests", "Skip running tests after update")
  .option("--skip-audit", "Skip security audit after update")
  .option("--no-commit", "Do not commit changes")
  .option("--create-pr", "Create pull request after update")
  .option("--dry-run", "Preview changes without making them")
  .option("-v, --verbose", "Verbose output")
  .action(async (options: any) => {
    try {
      await ensureInitialized();

      const config = new Config(logger);
      config.load();

      const languages = new LanguageRegistry(logger, shell);
      const git = new GitManager(logger, shell);
      const tools = new ToolManager(logger, shell);
      const manager = new DependencyManager(
        logger,
        shell,
        config,
        languages,
        git,
        tools,
      );

      const updateOptions: DependencyUpdateOptions = {
        strategy: options.strategy as any,
        testAfterUpdate: !options.skipTests,
        auditAfterUpdate: !options.skipAudit,
        commitChanges: options.commit,
        createPR: options.createPr,
        dryRun: options.dryRun,
        verbose: options.verbose,
      };

      const result = await manager.executeFullUpdate(updateOptions);
      process.exit(result.success ? 0 : 1);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Detect command
program
  .command("detect")
  .description("Detect project languages without updating")
  .action(async (options: any) => {
    try {
      await ensureInitialized();

      const config = new Config(logger);
      config.load();

      const languages = new LanguageRegistry(logger, shell);
      const git = new GitManager(logger, shell);
      const tools = new ToolManager(logger, shell);
      const manager = new DependencyManager(
        logger,
        shell,
        config,
        languages,
        git,
        tools,
      );

      const detections = await manager.detectOnly();
      process.exit(detections.size > 0 ? 0 : 1);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Test command
program
  .command("test")
  .description("Run tests for all detected languages")
  .action(async (options: any) => {
    try {
      await ensureInitialized();

      const config = new Config(logger);
      config.load();

      const languages = new LanguageRegistry(logger, shell);
      const git = new GitManager(logger, shell);
      const tools = new ToolManager(logger, shell);
      const manager = new DependencyManager(
        logger,
        shell,
        config,
        languages,
        git,
        tools,
      );

      const result = await manager.testOnly();
      process.exit(result.success ? 0 : 1);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Audit command
program
  .command("audit")
  .description("Run security audit for all detected languages")
  .action(async (options: any) => {
    try {
      await ensureInitialized();

      const config = new Config(logger);
      config.load();

      const languages = new LanguageRegistry(logger, shell);
      const git = new GitManager(logger, shell);
      const tools = new ToolManager(logger, shell);
      const manager = new DependencyManager(
        logger,
        shell,
        config,
        languages,
        git,
        tools,
      );

      const result = await manager.auditOnly();
      process.exit(result.success ? 0 : 1);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Status command
program
  .command("status")
  .description("Show current status and configuration")
  .action(async (options: any) => {
    try {
      await ensureInitialized();

      const config = new Config(logger);
      config.load();

      logger.section("📊 Dep-Sync Status");

      logger.section("⚙️  Configuration");
      config.print();

      const languages = new LanguageRegistry(logger, shell);
      const git = new GitManager(logger, shell);
      const tools = new ToolManager(logger, shell);
      const manager = new DependencyManager(
        logger,
        shell,
        config,
        languages,
        git,
        tools,
      );

      manager.printStatus();

      process.exit(0);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Config command
program
  .command("config")
  .description("Manage configuration")
  .option("--init", "Initialize .env configuration")
  .option("--show", "Show current configuration")
  .option("--set <key=value>", "Set a configuration value")
  .action((options: any) => {
    try {
      const config = new Config(logger);

      if (options.init) {
        logger.log("Creating .env file with default configuration...");
        config.load();
        logger.success(".env file ready");
      } else if (options.show) {
        config.load();
        config.print();
      } else if (options.set) {
        const [key, value] = options.set.split("=");
        if (!key || !value) {
          logger.error("Invalid format. Use: --set KEY=VALUE");
          process.exit(1);
        }
        config.load();
        config.set(key, value);
        logger.success(`Set ${key} = ${value}`);
      } else {
        config.load();
        config.print();
      }
      process.exit(0);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Init command
program
  .command("init")
  .description("Initialize Dep-Sync in current directory")
  .option("--force", "Overwrite existing .env")
  .action((options: any) => {
    try {
      logger.section("🚀 Initializing Dep-Sync");

      if (shell.exists(".env") && !options.force) {
        logger.warning(".env file already exists. Use --force to overwrite.");
        process.exit(1);
      }

      const config = new Config(logger);
      config.load();
      logger.success("✓ Dep-Sync initialized");
      logger.info('ℹ️  Next: run "dep-sync detect" to scan your project');

      process.exit(0);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Interactive menu (default)
program
  .command("menu")
  .description("Interactive menu")
  .action(async (options: any) => {
    try {
      await ensureInitialized();

      const config = new Config(logger);
      config.load();

      const languages = new LanguageRegistry(logger, shell);
      const git = new GitManager(logger, shell);
      const tools = new ToolManager(logger, shell);
      const manager = new DependencyManager(
        logger,
        shell,
        config,
        languages,
        git,
        tools,
      );

      logger.section("📋 Dep-Sync Menu");
      logger.info("1. Run full update cycle");
      logger.info("2. Detect project languages");
      logger.info("3. Run tests");
      logger.info("4. Run security audit");
      logger.info("5. Show status");
      logger.info("6. Exit");

      // For now, show status as default
      manager.printStatus();
      process.exit(0);
    } catch (error: any) {
      logger.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Help
program.on("--help", () => {
  console.log("");
  console.log(chalk.cyan("Examples:"));
  console.log("  $ dep-sync update");
  console.log("  $ dep-sync update --strategy patch --dry-run");
  console.log("  $ dep-sync detect");
  console.log("  $ dep-sync test");
  console.log("  $ dep-sync audit");
  console.log("  $ dep-sync status");
  console.log("  $ dep-sync init");
  console.log("");
});

async function ensureInitialized(): Promise<void> {
  if (!shell.exists(".env")) {
    logger.warning(".env not found. Initializing with defaults...");
    const config = new Config(logger);
    config.load();
  }
}

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
