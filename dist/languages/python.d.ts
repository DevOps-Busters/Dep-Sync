import { LanguageConfig, UpdateStrategy } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
export declare class PythonLanguage implements LanguageConfig {
    name: string;
    enabled: boolean;
    private logger;
    private shell;
    constructor(logger: Logger, shell: Shell);
    detect(): Promise<boolean>;
    update(strategy: UpdateStrategy): Promise<boolean>;
    private updateRequirementsTxt;
    private updatePyproject;
    private updateSetupPy;
    test(): Promise<boolean>;
    audit(): Promise<boolean>;
    changelog(): Promise<string>;
}
//# sourceMappingURL=python.d.ts.map