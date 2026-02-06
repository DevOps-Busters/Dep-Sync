import { UpdateStrategy, UpdateResult } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
import { Config } from "../config";
import { LanguageRegistry } from "./LanguageRegistry";
import { GitManager } from "./GitManager";
import { ToolManager } from "./ToolManager";
export interface DependencyUpdateOptions {
    strategy?: UpdateStrategy;
    testAfterUpdate?: boolean;
    auditAfterUpdate?: boolean;
    commitChanges?: boolean;
    createPR?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
}
export declare class DependencyManager {
    private logger;
    private shell;
    private config;
    private languages;
    private git;
    private tools;
    private dryRun;
    constructor(logger: Logger, shell: Shell, config: Config, languages: LanguageRegistry, git: GitManager, tools: ToolManager);
    executeFullUpdate(options?: DependencyUpdateOptions): Promise<UpdateResult>;
    detectOnly(): Promise<Map<string, boolean>>;
    updateOnly(strategy?: UpdateStrategy): Promise<UpdateResult>;
    testOnly(): Promise<UpdateResult>;
    auditOnly(): Promise<UpdateResult>;
    private preflight;
    private commitUpdates;
    private createPullRequest;
    private printSummary;
    private createFailureResult;
    printStatus(): void;
}
//# sourceMappingURL=DependencyManager.d.ts.map