"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
class Config {
    constructor(logger) {
        this.logger = logger;
        this.configPath = path.join(process.cwd(), ".depsync.env");
        this.config = this.getDefaults();
        this.load();
    }
    getDefaults() {
        return {
            languages: {
                nodejs: true,
                python: true,
                docker: true,
                java: false,
            },
            updateStrategy: "minor",
            runTests: true,
            runSecurityAudit: true,
            autoCommit: true,
            createPullRequest: true,
            parallelExecution: true,
            maxParallelJobs: 4,
            gitBranchPrefix: "deps/update",
            gitCommitMessage: "chore(deps): update dependencies",
            logFile: "./depsync.log",
            changelogFile: "./CHANGELOG.md",
            generateReports: false,
            reportOutputDir: "./reports",
        };
    }
    load() {
        // Load from .env file if exists
        if (fs.existsSync(this.configPath)) {
            dotenv.config({ path: this.configPath });
        }
        // Load from environment variables
        const envConfig = {
            languages: {
                nodejs: process.env.ENABLE_NODEJS !== "false",
                python: process.env.ENABLE_PYTHON !== "false",
                docker: process.env.ENABLE_DOCKER !== "false",
                java: process.env.ENABLE_JAVA === "true",
            },
            updateStrategy: (process.env.UPDATE_STRATEGY ||
                "minor"),
            runTests: process.env.RUN_TESTS !== "false",
            runSecurityAudit: process.env.RUN_SECURITY_AUDIT !== "false",
            autoCommit: process.env.AUTO_COMMIT !== "false",
            createPullRequest: process.env.CREATE_PULL_REQUEST !== "false",
            parallelExecution: process.env.PARALLEL_EXECUTION !== "false",
            maxParallelJobs: parseInt(process.env.MAX_PARALLEL_JOBS || "4", 10),
            gitBranchPrefix: process.env.GIT_BRANCH_PREFIX || "deps/update",
            gitCommitMessage: process.env.GIT_COMMIT_MESSAGE || "chore(deps): update dependencies",
            logFile: process.env.LOG_FILE || "./depsync.log",
            changelogFile: process.env.CHANGELOG_FILE || "./CHANGELOG.md",
            generateReports: process.env.GENERATE_REPORTS === "true",
            reportOutputDir: process.env.REPORT_OUTPUT_DIR || "./reports",
        };
        this.config = { ...this.config, ...envConfig };
    }
    getAll() {
        return this.config;
    }
    get(key) {
        // Handle nested keys like 'languages.nodejs'
        if (key.includes(".")) {
            const parts = key.split(".");
            let value = this.config;
            for (const part of parts) {
                value = value?.[part];
            }
            return value !== undefined ? value : "";
        }
        // Handle environment variable style names
        const envKey = key
            .toUpperCase()
            .replace(/([A-Z])/g, "_$1")
            .replace(/^_/, "");
        const value = this.config[key] || process.env[envKey];
        return value !== undefined ? value : "";
    }
    set(key, value) {
        this.config[key] = value;
    }
    getLanguages() {
        const langs = [];
        if (this.config.languages.nodejs)
            langs.push("nodejs");
        if (this.config.languages.python)
            langs.push("python");
        if (this.config.languages.docker)
            langs.push("docker");
        if (this.config.languages.java)
            langs.push("java");
        return langs;
    }
    isLanguageEnabled(language) {
        return this.config.languages[language] === true;
    }
    print() {
        this.logger.section("Configuration");
        this.logger.log(`  Languages: ${this.getLanguages().join(", ")}`);
        this.logger.log(`  Strategy: ${this.config.updateStrategy}`);
        this.logger.log(`  Run Tests: ${this.config.runTests}`);
        this.logger.log(`  Run Audit: ${this.config.runSecurityAudit}`);
        this.logger.log(`  Parallel: ${this.config.parallelExecution}`);
        this.logger.log(`  Log File: ${this.config.logFile}`);
    }
    validate() {
        const validStrategies = ["patch", "minor", "major"];
        if (!validStrategies.includes(this.config.updateStrategy)) {
            this.logger.error(`Invalid update strategy: ${this.config.updateStrategy}`);
            return false;
        }
        if (this.config.maxParallelJobs < 1 || this.config.maxParallelJobs > 32) {
            this.logger.error(`Invalid max parallel jobs: ${this.config.maxParallelJobs}`);
            return false;
        }
        return true;
    }
}
exports.Config = Config;
//# sourceMappingURL=index.js.map