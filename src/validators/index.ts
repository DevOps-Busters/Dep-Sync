/**
 * Input Validation Schemas
 * Following: Airbnb's and Netflix's validation patterns
 * Libraries compatible: Zod, Joi, Yup (but we use simple validators here)
 */

import { ValidationError } from '../errors/CustomError';

export interface Validator<T> {
  validate(value: any): T;
}

/**
 * Strategy validator - validates update strategy
 */
export const strategyValidator = (value: any): string => {
  const validStrategies = ['patch', 'minor', 'major'];

  if (typeof value !== 'string') {
    throw new ValidationError('Update strategy must be a string', {
      strategy: ['Must be a string'],
    });
  }

  if (!validStrategies.includes(value)) {
    throw new ValidationError('Invalid update strategy', {
      strategy: [`Must be one of: ${validStrategies.join(', ')}`],
    });
  }

  return value;
};

/**
 * Language validator - validates language names
 */
export const languageValidator = (value: any): string => {
  const validLanguages = ['nodejs', 'python', 'docker', 'java'];

  if (typeof value !== 'string') {
    throw new ValidationError('Language must be a string', {
      language: ['Must be a string'],
    });
  }

  if (!validLanguages.includes(value)) {
    throw new ValidationError('Invalid language', {
      language: [`Must be one of: ${validLanguages.join(', ')}`],
    });
  }

  return value;
};

/**
 * Port validator - validates port numbers
 */
export const portValidator = (value: any): number => {
  const port = parseInt(value, 10);

  if (isNaN(port)) {
    throw new ValidationError('Port must be a number', {
      port: ['Must be a valid number'],
    });
  }

  if (port < 1 || port > 65535) {
    throw new ValidationError('Port out of range', {
      port: ['Must be between 1 and 65535'],
    });
  }

  return port;
};

/**
 * URL validator - validates URLs
 */
export const urlValidator = (value: any): string => {
  if (typeof value !== 'string') {
    throw new ValidationError('URL must be a string', {
      url: ['Must be a string'],
    });
  }

  try {
    new URL(value);
    return value;
  } catch {
    throw new ValidationError('Invalid URL format', {
      url: ['Must be a valid URL'],
    });
  }
};

/**
 * File path validator - validates file paths
 */
export const filePathValidator = (value: any): string => {
  if (typeof value !== 'string') {
    throw new ValidationError('File path must be a string', {
      filePath: ['Must be a string'],
    });
  }

  if (value.trim().length === 0) {
    throw new ValidationError('File path cannot be empty', {
      filePath: ['Cannot be empty'],
    });
  }

  return value;
};

/**
 * Command options validator
 */
export const validateCommandOptions = (options: any) => {
  const errors: Record<string, string[]> = {};

  if (options.strategy !== undefined) {
    try {
      strategyValidator(options.strategy);
    } catch (error) {
      if (error instanceof ValidationError) {
        Object.assign(errors, error.details);
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid command options', errors);
  }

  return options;
};

/**
 * Dependency configuration validator
 */
export const validateDependencyConfig = (config: Record<string, any>) => {
  const errors: Record<string, string[]> = {};

  // Validate strategy
  if (config.updateStrategy) {
    try {
      strategyValidator(config.updateStrategy);
    } catch (error) {
      if (error instanceof ValidationError) {
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
    throw new ValidationError('Invalid dependency configuration', errors);
  }

  return config;
};
