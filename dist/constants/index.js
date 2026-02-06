"use strict";
/**
 * Application Constants
 * Following: Google's style guide for constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_KEYS = exports.CLI_COMMANDS = exports.ERROR_CODES = exports.HTTP_STATUS = exports.EXIT_CODES = exports.TOOL_COMMANDS = exports.EXECUTION_DEFAULTS = exports.FILE_PATHS = exports.GIT_DEFAULTS = exports.LANGUAGES = exports.UPDATE_STRATEGIES = void 0;
// Update Strategies
exports.UPDATE_STRATEGIES = {
    PATCH: 'patch',
    MINOR: 'minor',
    MAJOR: 'major',
};
// Language Types
exports.LANGUAGES = {
    NODEJS: 'nodejs',
    PYTHON: 'python',
    DOCKER: 'docker',
    JAVA: 'java',
};
// Git Defaults
exports.GIT_DEFAULTS = {
    DEFAULT_BRANCH: 'main',
    BRANCH_PREFIX: 'deps/update',
    COMMIT_PREFIX: 'chore(deps)',
    AUTHOR_NAME: 'Dep-Sync Bot',
    AUTHOR_EMAIL: 'bot@dep-sync.local',
};
// File Paths
exports.FILE_PATHS = {
    LOG_FILE: './depsync.log',
    CHANGELOG_FILE: './CHANGELOG.md',
    ENV_FILE: '.env',
    REPORTS_DIR: './reports',
};
// Execution Defaults
exports.EXECUTION_DEFAULTS = {
    MAX_PARALLEL_JOBS: 4,
    COMMAND_TIMEOUT: 300000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};
// Tool Commands
exports.TOOL_COMMANDS = {
    GIT: 'git',
    NODE: 'node',
    NPM: 'npm',
    PYTHON: 'python',
    PIP: 'pip',
    POETRY: 'poetry',
    DOCKER: 'docker',
    JAVA: 'java',
    MVN: 'mvn',
    GRADLE: 'gradle',
    GH: 'gh',
    CURL: 'curl',
};
// Exit Codes
exports.EXIT_CODES = {
    SUCCESS: 0,
    GENERAL_ERROR: 1,
    COMMAND_MISUSE: 2,
    INVALID_CONFIG: 3,
    RUNTIME_ERROR: 4,
    EXTERNAL_ERROR: 5,
};
// HTTP Status Codes (for consistency)
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
// Error Codes
exports.ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    CONFIG_ERROR: 'CONFIG_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    COMMAND_FAILED: 'COMMAND_FAILED',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    LANGUAGE_NOT_SUPPORTED: 'LANGUAGE_NOT_SUPPORTED',
    RUNTIME_ERROR: 'RUNTIME_ERROR',
};
// CLI Command Names
exports.CLI_COMMANDS = {
    UPDATE: 'update',
    DETECT: 'detect',
    TEST: 'test',
    AUDIT: 'audit',
    STATUS: 'status',
    CONFIG: 'config',
    INIT: 'init',
    MENU: 'menu',
};
// Environment Variable Keys
exports.ENV_KEYS = {
    ENABLE_NODEJS: 'ENABLE_NODEJS',
    ENABLE_PYTHON: 'ENABLE_PYTHON',
    ENABLE_DOCKER: 'ENABLE_DOCKER',
    ENABLE_JAVA: 'ENABLE_JAVA',
    UPDATE_STRATEGY: 'UPDATE_STRATEGY',
    RUN_TESTS: 'RUN_TESTS',
    RUN_AUDIT: 'RUN_SECURITY_AUDIT',
    AUTO_COMMIT: 'AUTO_COMMIT',
    CREATE_PR: 'CREATE_PULL_REQUEST',
    GIT_BRANCH_PREFIX: 'GIT_BRANCH_PREFIX',
    GIT_COMMIT_MESSAGE: 'GIT_COMMIT_MESSAGE',
    LOG_FILE: 'LOG_FILE',
    CHANGELOG_FILE: 'CHANGELOG_FILE',
    PARALLEL_EXECUTION: 'PARALLEL_EXECUTION',
    MAX_PARALLEL_JOBS: 'MAX_PARALLEL_JOBS',
    DEBUG: 'DEBUG',
};
//# sourceMappingURL=index.js.map