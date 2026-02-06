"use strict";
/**
 * Custom Error Classes
 * Following: Google's error handling standards
 * Categories: Configuration, Validation, Runtime, External Service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeError = exports.LanguageNotSupportedError = exports.ExternalServiceError = exports.CommandExecutionError = exports.ConflictError = exports.NotFoundError = exports.ConfigurationError = exports.ValidationError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
/**
 * 400 - Bad Request: Client input validation failures
 */
class ValidationError extends CustomError {
    constructor(message, details = {}) {
        super(message);
        this.details = details;
        this.statusCode = 400;
        this.code = 'VALIDATION_ERROR';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
            details: this.details,
        };
    }
}
exports.ValidationError = ValidationError;
/**
 * 400 - Bad Request: Invalid configuration
 */
class ConfigurationError extends CustomError {
    constructor(message, configKey) {
        super(message);
        this.configKey = configKey;
        this.statusCode = 400;
        this.code = 'CONFIGURATION_ERROR';
        Object.setPrototypeOf(this, ConfigurationError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
            configKey: this.configKey,
        };
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * 404 - Not Found: Resource or tool not found
 */
class NotFoundError extends CustomError {
    constructor(resource, identifier) {
        super(`${resource} not found: ${identifier}`);
        this.resource = resource;
        this.identifier = identifier;
        this.statusCode = 404;
        this.code = 'NOT_FOUND';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
            resource: this.resource,
            identifier: this.identifier,
        };
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 409 - Conflict: Operation cannot be completed due to state
 */
class ConflictError extends CustomError {
    constructor(message, context) {
        super(message);
        this.context = context;
        this.statusCode = 409;
        this.code = 'CONFLICT';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
            context: this.context,
        };
    }
}
exports.ConflictError = ConflictError;
/**
 * 500 - Internal Server Error: Command execution failure
 */
class CommandExecutionError extends CustomError {
    constructor(command, exitCode, stderr) {
        super(`Command failed: ${command} (exit code: ${exitCode})`);
        this.command = command;
        this.exitCode = exitCode;
        this.stderr = stderr;
        this.statusCode = 500;
        this.code = 'COMMAND_EXECUTION_ERROR';
        Object.setPrototypeOf(this, CommandExecutionError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
            command: this.command,
            exitCode: this.exitCode,
            stderr: this.stderr,
        };
    }
}
exports.CommandExecutionError = CommandExecutionError;
/**
 * 500 - Internal Server Error: External service failure (npm, git, etc.)
 */
class ExternalServiceError extends CustomError {
    constructor(service, message, originalError) {
        super(`${service} error: ${message}`);
        this.service = service;
        this.originalError = originalError;
        this.statusCode = 500;
        this.code = 'EXTERNAL_SERVICE_ERROR';
        Object.setPrototypeOf(this, ExternalServiceError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
            service: this.service,
            originalError: this.originalError?.message,
        };
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * 500 - Internal Server Error: Language handler not found or not supported
 */
class LanguageNotSupportedError extends CustomError {
    constructor(language) {
        super(`Language not supported: ${language}`);
        this.language = language;
        this.statusCode = 500;
        this.code = 'LANGUAGE_NOT_SUPPORTED';
        Object.setPrototypeOf(this, LanguageNotSupportedError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
            language: this.language,
        };
    }
}
exports.LanguageNotSupportedError = LanguageNotSupportedError;
/**
 * 500 - Internal Server Error: Unexpected runtime error
 */
class RuntimeError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = 500;
        this.code = 'RUNTIME_ERROR';
        Object.setPrototypeOf(this, RuntimeError.prototype);
    }
    serialize() {
        return {
            message: this.message,
            code: this.code,
        };
    }
}
exports.RuntimeError = RuntimeError;
//# sourceMappingURL=CustomError.js.map