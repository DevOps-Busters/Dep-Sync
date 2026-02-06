import { LanguageConfig, UpdateStrategy, UpdateResult } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
export declare class LanguageRegistry {
    private languages;
    private logger;
    private shell;
    constructor(logger: Logger, shell: Shell);
    private registerDefaultLanguages;
    register(language: LanguageConfig): void;
    get(name: string): LanguageConfig | undefined;
    getAll(): LanguageConfig[];
    getEnabled(): LanguageConfig[];
    detectAll(): Promise<Map<string, boolean>>;
    updateAll(strategy?: UpdateStrategy, detections?: Map<string, boolean>): Promise<UpdateResult>;
    testAll(detections?: Map<string, boolean>): Promise<UpdateResult>;
    auditAll(detections?: Map<string, boolean>): Promise<UpdateResult>;
    generateChangelog(): Promise<string>;
    private logUpdateResult;
    printStatus(): void;
}
//# sourceMappingURL=LanguageRegistry.d.ts.map