import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
export interface GitConfig {
    author: string;
    email: string;
    createBranch: boolean;
    createPR: boolean;
    autoCommit: boolean;
}
export declare class GitManager {
    private logger;
    private shell;
    private config;
    constructor(logger: Logger, shell: Shell, config?: GitConfig);
    isGitRepository(): boolean;
    getCurrentBranch(): string;
    hasChanges(): boolean;
    getChangedFiles(): string[];
    configureGit(): void;
    stageChanges(files?: string[]): boolean;
    commit(message: string, files?: string[]): boolean;
    createBranch(branchName: string): boolean;
    switchBranch(branchName: string): boolean;
    listBranches(): string[];
    deleteBranch(branchName: string): boolean;
    push(remote?: string, branch?: string): boolean;
    pull(remote?: string, branch?: string): boolean;
    createPullRequest(title: string, body: string, baseBranch?: string): boolean;
    private createGHPullRequest;
    reset(mode?: "soft" | "hard"): boolean;
    cleanup(): boolean;
    getOriginUrl(): string | null;
    printStatus(): void;
}
//# sourceMappingURL=GitManager.d.ts.map