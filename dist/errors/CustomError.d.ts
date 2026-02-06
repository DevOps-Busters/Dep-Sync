/**
 * Custom Error Classes
 * Following: Google's error handling standards
 * Categories: Configuration, Validation, Runtime, External Service
 */
export declare abstract class CustomError extends Error {
    abstract readonly statusCode: number;
    abstract readonly code: string;
    constructor(message: string);
    abstract serialize(): {
        message: string;
        code: string;
        details?: any;
    };
}
/**
 * 400 - Bad Request: Client input validation failures
 */
export declare class ValidationError extends CustomError {
    readonly details: Record<string, string[]>;
    readonly statusCode = 400;
    readonly code = "VALIDATION_ERROR";
    constructor(message: string, details?: Record<string, string[]>);
    serialize(): {
        message: string;
        code: string;
        details: Record<string, string[]>;
    };
}
/**
 * 400 - Bad Request: Invalid configuration
 */
export declare class ConfigurationError extends CustomError {
    readonly configKey?: string | undefined;
    readonly statusCode = 400;
    readonly code = "CONFIGURATION_ERROR";
    constructor(message: string, configKey?: string | undefined);
    serialize(): {
        message: string;
        code: string;
        configKey: string | undefined;
    };
}
/**
 * 404 - Not Found: Resource or tool not found
 */
export declare class NotFoundError extends CustomError {
    readonly resource: string;
    readonly identifier: string;
    readonly statusCode = 404;
    readonly code = "NOT_FOUND";
    constructor(resource: string, identifier: string);
    serialize(): {
        message: string;
        code: string;
        resource: string;
        identifier: string;
    };
}
/**
 * 409 - Conflict: Operation cannot be completed due to state
 */
export declare class ConflictError extends CustomError {
    readonly context?: Record<string, any> | undefined;
    readonly statusCode = 409;
    readonly code = "CONFLICT";
    constructor(message: string, context?: Record<string, any> | undefined);
    serialize(): {
        message: string;
        code: string;
        context: Record<string, any> | undefined;
    };
}
/**
 * 500 - Internal Server Error: Command execution failure
 */
export declare class CommandExecutionError extends CustomError {
    readonly command: string;
    readonly exitCode: number;
    readonly stderr: string;
    readonly statusCode = 500;
    readonly code = "COMMAND_EXECUTION_ERROR";
    constructor(command: string, exitCode: number, stderr: string);
    serialize(): {
        message: string;
        code: string;
        command: string;
        exitCode: number;
        stderr: string;
    };
}
/**
 * 500 - Internal Server Error: External service failure (npm, git, etc.)
 */
export declare class ExternalServiceError extends CustomError {
    readonly service: string;
    readonly originalError?: Error | undefined;
    readonly statusCode = 500;
    readonly code = "EXTERNAL_SERVICE_ERROR";
    constructor(service: string, message: string, originalError?: Error | undefined);
    serialize(): {
        message: string;
        code: string;
        service: string;
        originalError: string | undefined;
    };
}
/**
 * 500 - Internal Server Error: Language handler not found or not supported
 */
export declare class LanguageNotSupportedError extends CustomError {
    readonly language: string;
    readonly statusCode = 500;
    readonly code = "LANGUAGE_NOT_SUPPORTED";
    constructor(language: string);
    serialize(): {
        message: string;
        code: string;
        language: string;
    };
}
/**
 * 500 - Internal Server Error: Unexpected runtime error
 */
export declare class RuntimeError extends CustomError {
    readonly statusCode = 500;
    readonly code = "RUNTIME_ERROR";
    constructor(message: string);
    serialize(): {
        message: string;
        code: string;
    };
}
//# sourceMappingURL=CustomError.d.ts.map