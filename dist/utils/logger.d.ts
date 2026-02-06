export declare class Logger {
    private logFile;
    constructor(logFile: string);
    private ensureLogFile;
    private writeToFile;
    log(message: string): void;
    success(message: string): void;
    error(message: string): void;
    warning(message: string): void;
    info(message: string): void;
    debug(message: string): void;
    section(title: string): void;
}
export declare function getLogger(logFile?: string): Logger;
//# sourceMappingURL=logger.d.ts.map