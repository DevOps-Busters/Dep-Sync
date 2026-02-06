import { Logger, getLogger } from "./utils/logger";
import { Shell } from "./utils/shell";
import { Config } from "./config";
import { LanguageRegistry } from "./managers/LanguageRegistry";
import { GitManager } from "./managers/GitManager";
import { ToolManager } from "./managers/ToolManager";
import { DependencyManager, DependencyUpdateOptions } from "./managers/DependencyManager";
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
export declare function initialize(): Promise<{
    logger: Logger;
    shell: Shell;
    config: Config;
    languages: LanguageRegistry;
    git: GitManager;
    tools: ToolManager;
}>;
/**
 * Create DependencyManager instance
 */
export declare function createManager(): Promise<DependencyManager>;
/**
 * Execute full update cycle
 */
export declare function executeUpdate(options?: DependencyUpdateOptions): Promise<import("./types").UpdateResult>;
/**
 * Detect project languages
 */
export declare function detectLanguages(): Promise<Map<string, boolean>>;
/**
 * Run tests
 */
export declare function runTests(): Promise<import("./types").UpdateResult>;
/**
 * Run audit
 */
export declare function runAudit(): Promise<import("./types").UpdateResult>;
//# sourceMappingURL=index.d.ts.map