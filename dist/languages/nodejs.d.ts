import { LanguageConfig, UpdateStrategy } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
export declare class NodeJSLanguage implements LanguageConfig {
    name: string;
    enabled: boolean;
    private logger;
    private shell;
    constructor(logger: Logger, shell: Shell);
    detect(): Promise<boolean>;
    update(strategy: UpdateStrategy): Promise<boolean>;
    test(): Promise<boolean>;
    audit(): Promise<boolean>;
    changelog(): Promise<string>;
}
//# sourceMappingURL=nodejs.d.ts.map