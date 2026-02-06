"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyManager = exports.ToolManager = exports.GitManager = exports.LanguageRegistry = exports.Config = exports.Shell = exports.getLogger = exports.Logger = void 0;
exports.initialize = initialize;
exports.createManager = createManager;
exports.executeUpdate = executeUpdate;
exports.detectLanguages = detectLanguages;
exports.runTests = runTests;
exports.runAudit = runAudit;
const logger_1 = require("./utils/logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return logger_1.Logger; } });
Object.defineProperty(exports, "getLogger", { enumerable: true, get: function () { return logger_1.getLogger; } });
const shell_1 = require("./utils/shell");
Object.defineProperty(exports, "Shell", { enumerable: true, get: function () { return shell_1.Shell; } });
const config_1 = require("./config");
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return config_1.Config; } });
const LanguageRegistry_1 = require("./managers/LanguageRegistry");
Object.defineProperty(exports, "LanguageRegistry", { enumerable: true, get: function () { return LanguageRegistry_1.LanguageRegistry; } });
const GitManager_1 = require("./managers/GitManager");
Object.defineProperty(exports, "GitManager", { enumerable: true, get: function () { return GitManager_1.GitManager; } });
const ToolManager_1 = require("./managers/ToolManager");
Object.defineProperty(exports, "ToolManager", { enumerable: true, get: function () { return ToolManager_1.ToolManager; } });
const DependencyManager_1 = require("./managers/DependencyManager");
Object.defineProperty(exports, "DependencyManager", { enumerable: true, get: function () { return DependencyManager_1.DependencyManager; } });
/**
 * Initialize Dep-Sync application
 */
async function initialize() {
    const logger = (0, logger_1.getLogger)();
    const shell = new shell_1.Shell(logger);
    const config = new config_1.Config(logger);
    config.load();
    return {
        logger,
        shell,
        config,
        languages: new LanguageRegistry_1.LanguageRegistry(logger, shell),
        git: new GitManager_1.GitManager(logger, shell),
        tools: new ToolManager_1.ToolManager(logger, shell),
    };
}
/**
 * Create DependencyManager instance
 */
async function createManager() {
    const app = await initialize();
    return new DependencyManager_1.DependencyManager(app.logger, app.shell, app.config, app.languages, app.git, app.tools);
}
/**
 * Execute full update cycle
 */
async function executeUpdate(options) {
    const manager = await createManager();
    return manager.executeFullUpdate(options);
}
/**
 * Detect project languages
 */
async function detectLanguages() {
    const manager = await createManager();
    return manager.detectOnly();
}
/**
 * Run tests
 */
async function runTests() {
    const manager = await createManager();
    return manager.testOnly();
}
/**
 * Run audit
 */
async function runAudit() {
    const manager = await createManager();
    return manager.auditOnly();
}
//# sourceMappingURL=index.js.map