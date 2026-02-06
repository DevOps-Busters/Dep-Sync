/**
 * Result/Response Pattern
 * Inspired by: Railway-Oriented Programming (FP approach)
 * Used by: Rust, Elm, functional programming communities
 */
export type Result<T, E = AppError> = Success<T> | Failure<E>;
export declare class Success<T> {
    readonly value: T;
    readonly kind: "success";
    constructor(value: T);
    isSuccess(): this is Success<T>;
    isFailure(): this is Failure<never>;
    map<U>(fn: (value: T) => U): Result<U>;
    flatMap<U>(fn: (value: T) => Result<U>): Result<U>;
    getOrElse(_defaultValue: T): T;
    orElse(_fn: () => Result<T>): Result<T>;
    fold<U>(onFailure: (error: never) => U, onSuccess: (value: T) => U): U;
}
export declare class Failure<E> {
    readonly error: E;
    readonly kind: "failure";
    constructor(error: E);
    isSuccess(): this is Success<never>;
    isFailure(): this is Failure<E>;
    map<U>(_fn: (value: never) => U): Result<U, E>;
    flatMap<U>(_fn: (value: never) => Result<U, E>): Result<U, E>;
    getOrElse<T>(defaultValue: T): T;
    orElse<T>(fn: () => Result<T, E>): Result<T, E>;
    fold<U>(onFailure: (error: E) => U, _onSuccess: (value: never) => U): U;
}
export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: Record<string, any> | undefined;
    constructor(message: string, code: string, statusCode?: number, details?: Record<string, any> | undefined);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        statusCode: number;
        details: Record<string, any> | undefined;
    };
}
export declare const success: <T>(value: T) => Result<T>;
export declare const failure: <E>(error: E) => Result<never, E>;
//# sourceMappingURL=result.d.ts.map