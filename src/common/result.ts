/**
 * Result/Response Pattern
 * Inspired by: Railway-Oriented Programming (FP approach)
 * Used by: Rust, Elm, functional programming communities
 */

export type Result<T, E = AppError> = Success<T> | Failure<E>;

export class Success<T> {
  readonly kind = 'success' as const;

  constructor(readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<never> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U> {
    return new Success(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    return fn(this.value);
  }

  getOrElse(_defaultValue: T): T {
    return this.value;
  }

  orElse(_fn: () => Result<T>): Result<T> {
    return this;
  }

  fold<U>(onFailure: (error: never) => U, onSuccess: (value: T) => U): U {
    return onSuccess(this.value);
  }
}

export class Failure<E> {
  readonly kind = 'failure' as const;

  constructor(readonly error: E) {}

  isSuccess(): this is Success<never> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as any;
  }

  flatMap<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this as any;
  }

  getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  }

  orElse<T>(fn: () => Result<T, E>): Result<T, E> {
    return fn();
  }

  fold<U>(onFailure: (error: E) => U, _onSuccess: (value: never) => U): U {
    return onFailure(this.error);
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly statusCode: number = 500,
    readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Success and Failure constructors
export const success = <T>(value: T): Result<T> => new Success(value);
export const failure = <E>(error: E): Result<never, E> => new Failure(error);
