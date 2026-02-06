/**
 * Application Constants
 * Following: Google's style guide for constants
 */
export declare const UPDATE_STRATEGIES: {
    readonly PATCH: "patch";
    readonly MINOR: "minor";
    readonly MAJOR: "major";
};
export declare const LANGUAGES: {
    readonly NODEJS: "nodejs";
    readonly PYTHON: "python";
    readonly DOCKER: "docker";
    readonly JAVA: "java";
};
export declare const GIT_DEFAULTS: {
    readonly DEFAULT_BRANCH: "main";
    readonly BRANCH_PREFIX: "deps/update";
    readonly COMMIT_PREFIX: "chore(deps)";
    readonly AUTHOR_NAME: "Dep-Sync Bot";
    readonly AUTHOR_EMAIL: "bot@dep-sync.local";
};
export declare const FILE_PATHS: {
    readonly LOG_FILE: "./depsync.log";
    readonly CHANGELOG_FILE: "./CHANGELOG.md";
    readonly ENV_FILE: ".env";
    readonly REPORTS_DIR: "./reports";
};
export declare const EXECUTION_DEFAULTS: {
    readonly MAX_PARALLEL_JOBS: 4;
    readonly COMMAND_TIMEOUT: 300000;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 1000;
};
export declare const TOOL_COMMANDS: {
    readonly GIT: "git";
    readonly NODE: "node";
    readonly NPM: "npm";
    readonly PYTHON: "python";
    readonly PIP: "pip";
    readonly POETRY: "poetry";
    readonly DOCKER: "docker";
    readonly JAVA: "java";
    readonly MVN: "mvn";
    readonly GRADLE: "gradle";
    readonly GH: "gh";
    readonly CURL: "curl";
};
export declare const EXIT_CODES: {
    readonly SUCCESS: 0;
    readonly GENERAL_ERROR: 1;
    readonly COMMAND_MISUSE: 2;
    readonly INVALID_CONFIG: 3;
    readonly RUNTIME_ERROR: 4;
    readonly EXTERNAL_ERROR: 5;
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly CONFIG_ERROR: "CONFIG_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly COMMAND_FAILED: "COMMAND_FAILED";
    readonly EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR";
    readonly LANGUAGE_NOT_SUPPORTED: "LANGUAGE_NOT_SUPPORTED";
    readonly RUNTIME_ERROR: "RUNTIME_ERROR";
};
export declare const CLI_COMMANDS: {
    readonly UPDATE: "update";
    readonly DETECT: "detect";
    readonly TEST: "test";
    readonly AUDIT: "audit";
    readonly STATUS: "status";
    readonly CONFIG: "config";
    readonly INIT: "init";
    readonly MENU: "menu";
};
export declare const ENV_KEYS: {
    readonly ENABLE_NODEJS: "ENABLE_NODEJS";
    readonly ENABLE_PYTHON: "ENABLE_PYTHON";
    readonly ENABLE_DOCKER: "ENABLE_DOCKER";
    readonly ENABLE_JAVA: "ENABLE_JAVA";
    readonly UPDATE_STRATEGY: "UPDATE_STRATEGY";
    readonly RUN_TESTS: "RUN_TESTS";
    readonly RUN_AUDIT: "RUN_SECURITY_AUDIT";
    readonly AUTO_COMMIT: "AUTO_COMMIT";
    readonly CREATE_PR: "CREATE_PULL_REQUEST";
    readonly GIT_BRANCH_PREFIX: "GIT_BRANCH_PREFIX";
    readonly GIT_COMMIT_MESSAGE: "GIT_COMMIT_MESSAGE";
    readonly LOG_FILE: "LOG_FILE";
    readonly CHANGELOG_FILE: "CHANGELOG_FILE";
    readonly PARALLEL_EXECUTION: "PARALLEL_EXECUTION";
    readonly MAX_PARALLEL_JOBS: "MAX_PARALLEL_JOBS";
    readonly DEBUG: "DEBUG";
};
//# sourceMappingURL=index.d.ts.map