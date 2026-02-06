"use strict";
/**
 * Result/Response Pattern
 * Inspired by: Railway-Oriented Programming (FP approach)
 * Used by: Rust, Elm, functional programming communities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.failure = exports.success = exports.AppError = exports.Failure = exports.Success = void 0;
class Success {
    constructor(value) {
        this.value = value;
        this.kind = 'success';
    }
    isSuccess() {
        return true;
    }
    isFailure() {
        return false;
    }
    map(fn) {
        return new Success(fn(this.value));
    }
    flatMap(fn) {
        return fn(this.value);
    }
    getOrElse(_defaultValue) {
        return this.value;
    }
    orElse(_fn) {
        return this;
    }
    fold(onFailure, onSuccess) {
        return onSuccess(this.value);
    }
}
exports.Success = Success;
class Failure {
    constructor(error) {
        this.error = error;
        this.kind = 'failure';
    }
    isSuccess() {
        return false;
    }
    isFailure() {
        return true;
    }
    map(_fn) {
        return this;
    }
    flatMap(_fn) {
        return this;
    }
    getOrElse(defaultValue) {
        return defaultValue;
    }
    orElse(fn) {
        return fn();
    }
    fold(onFailure, _onSuccess) {
        return onFailure(this.error);
    }
}
exports.Failure = Failure;
class AppError extends Error {
    constructor(message, code, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
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
exports.AppError = AppError;
// Success and Failure constructors
const success = (value) => new Success(value);
exports.success = success;
const failure = (error) => new Failure(error);
exports.failure = failure;
//# sourceMappingURL=result.js.map