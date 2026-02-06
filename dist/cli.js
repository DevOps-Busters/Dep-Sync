#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = require("./utils/logger");
const shell_1 = require("./utils/shell");
const config_1 = require("./config");
const LanguageRegistry_1 = require("./managers/LanguageRegistry");
const GitManager_1 = require("./managers/GitManager");
const ToolManager_1 = require("./managers/ToolManager");
const DependencyManager_1 = require("./managers/DependencyManager");
const logger = (0, logger_1.getLogger)();
const shell = new shell_1.Shell(logger);
const program = new commander_1.Command();
program
    .name("dep-sync")
    .description("🔄 Automated dependency updater for Node.js, Python, Docker, and Java projects")
    .version("2.0.0");
// Main update command
program
    .command("update")
    .description("Perform full dependency update cycle")
    .option("-s, --strategy <strategy>", "Update strategy: patch|minor|major", "minor")
    .option("--skip-tests", "Skip running tests after update")
    .option("--skip-audit", "Skip security audit after update")
    .option("--no-commit", "Do not commit changes")
    .option("--create-pr", "Create pull request after update")
    .option("--dry-run", "Preview changes without making them")
    .option("-v, --verbose", "Verbose output")
    .action(async (options) => {
    try {
        await ensureInitialized();
        const config = new config_1.Config(logger);
        config.load();
        const languages = new LanguageRegistry_1.LanguageRegistry(logger, shell);
        const git = new GitManager_1.GitManager(logger, shell);
        const tools = new ToolManager_1.ToolManager(logger, shell);
        const manager = new DependencyManager_1.DependencyManager(logger, shell, config, languages, git, tools);
        const updateOptions = {
            strategy: options.strategy,
            testAfterUpdate: !options.skipTests,
            auditAfterUpdate: !options.skipAudit,
            commitChanges: options.commit,
            createPR: options.createPr,
            dryRun: options.dryRun,
            verbose: options.verbose,
        };
        const result = await manager.executeFullUpdate(updateOptions);
        process.exit(result.success ? 0 : 1);
    }
    catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Detect command
program
    .command("detect")
    .description("Detect project languages without updating")
    .action(async (options) => {
    try {
        await ensureInitialized();
        const config = new config_1.Config(logger);
        config.load();
        const languages = new LanguageRegistry_1.LanguageRegistry(logger, shell);
        const git = new GitManager_1.GitManager(logger, shell);
        const tools = new ToolManager_1.ToolManager(logger, shell);
        const manager = new DependencyManager_1.DependencyManager(logger, shell, config, languages, git, tools);
        const detections = await manager.detectOnly();
        process.exit(detections.size > 0 ? 0 : 1);
    }
    catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Test command
program
    .command("test")
    .description("Run tests for all detected languages")
    .action(async (options) => {
    try {
        await ensureInitialized();
        const config = new config_1.Config(logger);
        config.load();
        const languages = new LanguageRegistry_1.LanguageRegistry(logger, shell);
        const git = new GitManager_1.GitManager(logger, shell);
        const tools = new ToolManager_1.ToolManager(logger, shell);
        const manager = new DependencyManager_1.DependencyManager(logger, shell, config, languages, git, tools);
        const result = await manager.testOnly();
        process.exit(result.success ? 0 : 1);
    }
    catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Audit command
program
    .command("audit")
    .description("Run security audit for all detected languages")
    .action(async (options) => {
    try {
        await ensureInitialized();
        const config = new config_1.Config(logger);
        config.load();
        const languages = new LanguageRegistry_1.LanguageRegistry(logger, shell);
        const git = new GitManager_1.GitManager(logger, shell);
        const tools = new ToolManager_1.ToolManager(logger, shell);
        const manager = new DependencyManager_1.DependencyManager(logger, shell, config, languages, git, tools);
        const result = await manager.auditOnly();
        process.exit(result.success ? 0 : 1);
    }
    catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Status command
program
    .command("status")
    .description("Show current status and configuration")
    .action(async (options) => {
    try {
        await ensureInitialized();
        const config = new config_1.Config(logger);
        config.load();
        logger.section("📊 Dep-Sync Status");
        logger.section("⚙️  Configuration");
        config.print();
        const languages = new LanguageRegistry_1.LanguageRegistry(logger, shell);
        const git = new GitManager_1.GitManager(logger, shell);
        const tools = new ToolManager_1.ToolManager(logger, shell);
        const manager = new DependencyManager_1.DependencyManager(logger, shell, config, languages, git, tools);
        manager.printStatus();
        process.exit(0);
    }
    catch (error) {
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
    .action((options) => {
    try {
        const config = new config_1.Config(logger);
        if (options.init) {
            logger.log("Creating .env file with default configuration...");
            config.load();
            logger.success(".env file ready");
        }
        else if (options.show) {
            config.load();
            config.print();
        }
        else if (options.set) {
            const [key, value] = options.set.split("=");
            if (!key || !value) {
                logger.error("Invalid format. Use: --set KEY=VALUE");
                process.exit(1);
            }
            config.load();
            config.set(key, value);
            logger.success(`Set ${key} = ${value}`);
        }
        else {
            config.load();
            config.print();
        }
        process.exit(0);
    }
    catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Init command
program
    .command("init")
    .description("Initialize Dep-Sync in current directory")
    .option("--force", "Overwrite existing .env")
    .action((options) => {
    try {
        logger.section("🚀 Initializing Dep-Sync");
        if (shell.exists(".env") && !options.force) {
            logger.warning(".env file already exists. Use --force to overwrite.");
            process.exit(1);
        }
        const config = new config_1.Config(logger);
        config.load();
        logger.success("✓ Dep-Sync initialized");
        logger.info('ℹ️  Next: run "dep-sync detect" to scan your project');
        process.exit(0);
    }
    catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Interactive menu (default)
program
    .command("menu")
    .description("Interactive menu")
    .action(async (options) => {
    try {
        await ensureInitialized();
        const config = new config_1.Config(logger);
        config.load();
        const languages = new LanguageRegistry_1.LanguageRegistry(logger, shell);
        const git = new GitManager_1.GitManager(logger, shell);
        const tools = new ToolManager_1.ToolManager(logger, shell);
        const manager = new DependencyManager_1.DependencyManager(logger, shell, config, languages, git, tools);
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
    }
    catch (error) {
        logger.error(`Error: ${error.message}`);
        process.exit(1);
    }
});
// Help
program.on("--help", () => {
    console.log("");
    console.log(chalk_1.default.cyan("Examples:"));
    console.log("  $ dep-sync update");
    console.log("  $ dep-sync update --strategy patch --dry-run");
    console.log("  $ dep-sync detect");
    console.log("  $ dep-sync test");
    console.log("  $ dep-sync audit");
    console.log("  $ dep-sync status");
    console.log("  $ dep-sync init");
    console.log("");
});
async function ensureInitialized() {
    if (!shell.exists(".env")) {
        logger.warning(".env not found. Initializing with defaults...");
        const config = new config_1.Config(logger);
        config.load();
    }
}
program.parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=cli.js.map