"use strict";
/**
 * Input Validation Schemas
 * Following: Airbnb's and Netflix's validation patterns
 * Libraries compatible: Zod, Joi, Yup (but we use simple validators here)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDependencyConfig = exports.validateCommandOptions = exports.filePathValidator = exports.urlValidator = exports.portValidator = exports.languageValidator = exports.strategyValidator = void 0;
const CustomError_1 = require("../errors/CustomError");
/**
 * Strategy validator - validates update strategy
 */
const strategyValidator = (value) => {
    const validStrategies = ['patch', 'minor', 'major'];
    if (typeof value !== 'string') {
        throw new CustomError_1.ValidationError('Update strategy must be a string', {
            strategy: ['Must be a string'],
        });
    }
    if (!validStrategies.includes(value)) {
        throw new CustomError_1.ValidationError('Invalid update strategy', {
            strategy: [`Must be one of: ${validStrategies.join(', ')}`],
        });
    }
    return value;
};
exports.strategyValidator = strategyValidator;
/**
 * Language validator - validates language names
 */
const languageValidator = (value) => {
    const validLanguages = ['nodejs', 'python', 'docker', 'java'];
    if (typeof value !== 'string') {
        throw new CustomError_1.ValidationError('Language must be a string', {
            language: ['Must be a string'],
        });
    }
    if (!validLanguages.includes(value)) {
        throw new CustomError_1.ValidationError('Invalid language', {
            language: [`Must be one of: ${validLanguages.join(', ')}`],
        });
    }
    return value;
};
exports.languageValidator = languageValidator;
/**
 * Port validator - validates port numbers
 */
const portValidator = (value) => {
    const port = parseInt(value, 10);
    if (isNaN(port)) {
        throw new CustomError_1.ValidationError('Port must be a number', {
            port: ['Must be a valid number'],
        });
    }
    if (port < 1 || port > 65535) {
        throw new CustomError_1.ValidationError('Port out of range', {
            port: ['Must be between 1 and 65535'],
        });
    }
    return port;
};
exports.portValidator = portValidator;
/**
 * URL validator - validates URLs
 */
const urlValidator = (value) => {
    if (typeof value !== 'string') {
        throw new CustomError_1.ValidationError('URL must be a string', {
            url: ['Must be a string'],
        });
    }
    try {
        new URL(value);
        return value;
    }
    catch {
        throw new CustomError_1.ValidationError('Invalid URL format', {
            url: ['Must be a valid URL'],
        });
    }
};
exports.urlValidator = urlValidator;
/**
 * File path validator - validates file paths
 */
const filePathValidator = (value) => {
    if (typeof value !== 'string') {
        throw new CustomError_1.ValidationError('File path must be a string', {
            filePath: ['Must be a string'],
        });
    }
    if (value.trim().length === 0) {
        throw new CustomError_1.ValidationError('File path cannot be empty', {
            filePath: ['Cannot be empty'],
        });
    }
    return value;
};
exports.filePathValidator = filePathValidator;
/**
 * Command options validator
 */
const validateCommandOptions = (options) => {
    const errors = {};
    if (options.strategy !== undefined) {
        try {
            (0, exports.strategyValidator)(options.strategy);
        }
        catch (error) {
            if (error instanceof CustomError_1.ValidationError) {
                Object.assign(errors, error.details);
            }
        }
    }
    if (Object.keys(errors).length > 0) {
        throw new CustomError_1.ValidationError('Invalid command options', errors);
    }
    return options;
};
exports.validateCommandOptions = validateCommandOptions;
/**
 * Dependency configuration validator
 */
const validateDependencyConfig = (config) => {
    const errors = {};
    // Validate strategy
    if (config.updateStrategy) {
        try {
            (0, exports.strategyValidator)(config.updateStrategy);
        }
        catch (error) {
            if (error instanceof CustomError_1.ValidationError) {
                errors.updateStrategy = ['Invalid update strategy'];
            }
        }
    }
    // Validate parallelJobs
    if (config.maxParallelJobs !== undefined) {
        const jobs = config.maxParallelJobs;
        if (typeof jobs !== 'number' || jobs < 1 || jobs > 32) {
            errors.maxParallelJobs = ['Must be between 1 and 32'];
        }
    }
    // Validate languages
    if (config.languages) {
        const validLanguageCodes = ['nodejs', 'python', 'docker', 'java'];
        for (const [lang, enabled] of Object.entries(config.languages)) {
            if (!validLanguageCodes.includes(lang)) {
                errors.languages = [`Unknown language: ${lang}`];
            }
            if (typeof enabled !== 'boolean') {
                errors.languages = [`Language ${lang} enabled flag must be boolean`];
            }
        }
    }
    if (Object.keys(errors).length > 0) {
        throw new CustomError_1.ValidationError('Invalid dependency configuration', errors);
    }
    return config;
};
exports.validateDependencyConfig = validateDependencyConfig;
//# sourceMappingURL=index.js.map