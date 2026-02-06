/**
 * Custom Error Classes
 * Following: Google's error handling standards
 * Categories: Configuration, Validation, Runtime, External Service
 */

export abstract class CustomError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serialize(): { message: string; code: string; details?: any };
}

/**
 * 400 - Bad Request: Client input validation failures
 */
export class ValidationError extends CustomError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    readonly details: Record<string, string[]> = {}
  ) {
    super(message);
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

/**
 * 400 - Bad Request: Invalid configuration
 */
export class ConfigurationError extends CustomError {
  readonly statusCode = 400;
  readonly code = 'CONFIGURATION_ERROR';

  constructor(
    message: string,
    readonly configKey?: string
  ) {
    super(message);
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

/**
 * 404 - Not Found: Resource or tool not found
 */
export class NotFoundError extends CustomError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(
    readonly resource: string,
    readonly identifier: string
  ) {
    super(`${resource} not found: ${identifier}`);
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

/**
 * 409 - Conflict: Operation cannot be completed due to state
 */
export class ConflictError extends CustomError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  constructor(
    message: string,
    readonly context?: Record<string, any>
  ) {
    super(message);
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

/**
 * 500 - Internal Server Error: Command execution failure
 */
export class CommandExecutionError extends CustomError {
  readonly statusCode = 500;
  readonly code = 'COMMAND_EXECUTION_ERROR';

  constructor(
    readonly command: string,
    readonly exitCode: number,
    readonly stderr: string
  ) {
    super(`Command failed: ${command} (exit code: ${exitCode})`);
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

/**
 * 500 - Internal Server Error: External service failure (npm, git, etc.)
 */
export class ExternalServiceError extends CustomError {
  readonly statusCode = 500;
  readonly code = 'EXTERNAL_SERVICE_ERROR';

  constructor(
    readonly service: string,
    message: string,
    readonly originalError?: Error
  ) {
    super(`${service} error: ${message}`);
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

/**
 * 500 - Internal Server Error: Language handler not found or not supported
 */
export class LanguageNotSupportedError extends CustomError {
  readonly statusCode = 500;
  readonly code = 'LANGUAGE_NOT_SUPPORTED';

  constructor(readonly language: string) {
    super(`Language not supported: ${language}`);
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

/**
 * 500 - Internal Server Error: Unexpected runtime error
 */
export class RuntimeError extends CustomError {
  readonly statusCode = 500;
  readonly code = 'RUNTIME_ERROR';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RuntimeError.prototype);
  }

  serialize() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}
