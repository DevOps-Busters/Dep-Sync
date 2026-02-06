/**
 * Type definitions for Dep-Sync
 */
export interface LanguageConfig {
    name: string;
    enabled: boolean;
    detect(): Promise<boolean>;
    update(strategy: UpdateStrategy): Promise<boolean>;
    test(): Promise<boolean>;
    audit(): Promise<boolean>;
    changelog(): Promise<string>;
}
export type UpdateStrategy = "patch" | "minor" | "major";
export interface AppConfig {
    languages: {
        nodejs: boolean;
        python: boolean;
        docker: boolean;
        java: boolean;
    };
    updateStrategy: UpdateStrategy;
    runTests: boolean;
    runSecurityAudit: boolean;
    autoCommit: boolean;
    createPullRequest: boolean;
    parallelExecution: boolean;
    maxParallelJobs: number;
    gitBranchPrefix: string;
    gitCommitMessage: string;
    logFile: string;
    changelogFile: string;
    generateReports: boolean;
    reportOutputDir: string;
}
export interface UpdateResult {
    success: boolean;
    updated: string[];
    failed: string[];
    skipped: string[];
    timestamp: string;
    language?: string;
    testsPass?: boolean;
    auditPass?: boolean;
    error?: string;
    message?: string;
}
export interface CommandOptions {
    dryRun?: boolean;
    verbose?: boolean;
    parallel?: boolean;
    languages?: string[];
    strategy?: UpdateStrategy;
}
//# sourceMappingURL=index.d.ts.map