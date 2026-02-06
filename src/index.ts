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

export { Logger, getLogger };
export { Shell };
export { Config };
export { LanguageRegistry };
export { GitManager };
export { ToolManager };
export { DependencyManager, DependencyUpdateOptions };

/**
 * Initialize Dep-Sync application
 */
export async function initialize() {
  const logger = getLogger();
  const shell = new Shell(logger);
  const config = new Config(logger);

  config.load();

  return {
    logger,
    shell,
    config,
    languages: new LanguageRegistry(logger, shell),
    git: new GitManager(logger, shell),
    tools: new ToolManager(logger, shell),
  };
}

/**
 * Create DependencyManager instance
 */
export async function createManager() {
  const app = await initialize();

  return new DependencyManager(
    app.logger,
    app.shell,
    app.config,
    app.languages,
    app.git,
    app.tools,
  );
}

/**
 * Execute full update cycle
 */
export async function executeUpdate(options?: DependencyUpdateOptions) {
  const manager = await createManager();
  return manager.executeFullUpdate(options);
}

/**
 * Detect project languages
 */
export async function detectLanguages() {
  const manager = await createManager();
  return manager.detectOnly();
}

/**
 * Run tests
 */
export async function runTests() {
  const manager = await createManager();
  return manager.testOnly();
}

/**
 * Run audit
 */
export async function runAudit() {
  const manager = await createManager();
  return manager.auditOnly();
}
