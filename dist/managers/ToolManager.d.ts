import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
export interface ToolRequirement {
    name: string;
    command: string;
    minVersion?: string;
    optional?: boolean;
    description?: string;
}
export declare class ToolManager {
    private logger;
    private shell;
    private requiredTools;
    constructor(logger: Logger, shell: Shell);
    private registerDefaultTools;
    registerTool(requirement: ToolRequirement): void;
    isInstalled(toolName: string): boolean;
    getVersion(toolName: string): string | null;
    require(toolName: string): boolean;
    private requireTool;
    validateCore(): boolean;
    validateLanguageTools(): Map<string, boolean>;
    printStatus(): void;
    preflight(): boolean;
}
//# sourceMappingURL=ToolManager.d.ts.map