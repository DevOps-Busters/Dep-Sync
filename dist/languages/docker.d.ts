import { LanguageConfig, UpdateStrategy } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
export declare class DockerLanguage implements LanguageConfig {
    name: string;
    enabled: boolean;
    private logger;
    private shell;
    constructor(logger: Logger, shell: Shell);
    detect(): Promise<boolean>;
    update(strategy: UpdateStrategy): Promise<boolean>;
    private updateDockerfile;
    test(): Promise<boolean>;
    audit(): Promise<boolean>;
    changelog(): Promise<string>;
}
//# sourceMappingURL=docker.d.ts.map