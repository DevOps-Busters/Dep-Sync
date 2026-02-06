/**
 * Input Validation Schemas
 * Following: Airbnb's and Netflix's validation patterns
 * Libraries compatible: Zod, Joi, Yup (but we use simple validators here)
 */
export interface Validator<T> {
    validate(value: any): T;
}
/**
 * Strategy validator - validates update strategy
 */
export declare const strategyValidator: (value: any) => string;
/**
 * Language validator - validates language names
 */
export declare const languageValidator: (value: any) => string;
/**
 * Port validator - validates port numbers
 */
export declare const portValidator: (value: any) => number;
/**
 * URL validator - validates URLs
 */
export declare const urlValidator: (value: any) => string;
/**
 * File path validator - validates file paths
 */
export declare const filePathValidator: (value: any) => string;
/**
 * Command options validator
 */
export declare const validateCommandOptions: (options: any) => any;
/**
 * Dependency configuration validator
 */
export declare const validateDependencyConfig: (config: Record<string, any>) => Record<string, any>;
//# sourceMappingURL=index.d.ts.map