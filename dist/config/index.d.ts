import { AppConfig } from "../types";
import { Logger } from "../utils/logger";
export declare class Config {
    private config;
    private logger;
    private configPath;
    constructor(logger: Logger);
    private getDefaults;
    load(): void;
    getAll(): AppConfig;
    get(key: string): string | boolean | number | AppConfig;
    set(key: keyof AppConfig, value: any): void;
    getLanguages(): string[];
    isLanguageEnabled(language: string): boolean;
    print(): void;
    validate(): boolean;
}
//# sourceMappingURL=index.d.ts.map