import { Logger } from "./logger";
export declare class Shell {
    private logger;
    constructor(logger: Logger);
    /**
     * Execute a command synchronously
     */
    execSync(command: string, cwd?: string): string;
    /**
     * Execute a command asynchronously
     */
    execAsync(command: string, cwd?: string): Promise<string>;
    /**
     * Check if a command exists in system PATH
     */
    commandExists(command: string): boolean;
    /**
     * Get version of a command
     */
    getVersion(command: string, versionFlag?: string): string;
    /**
     * Find files matching a pattern
     */
    findFiles(pattern: string, directory?: string): string[];
    /**
     * Check if file or directory exists
     */
    exists(path: string): boolean;
    /**
     * Read file content
     */
    readFile(filePath: string): string;
    /**
     * Write to file
     */
    writeFile(filePath: string, content: string): void;
    /**
     * Execute command and suppress errors
     */
    exec(command: string): string;
}
export declare function getShell(logger: Logger): Shell;
//# sourceMappingURL=shell.d.ts.map