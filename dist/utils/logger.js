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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.getLogger = getLogger;
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Logger {
    constructor(logFile) {
        this.logFile = logFile;
        this.ensureLogFile();
    }
    ensureLogFile() {
        const dir = path.dirname(this.logFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    writeToFile(message) {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(this.logFile, `[${timestamp}] ${message}\n`);
    }
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(chalk_1.default.blue(`[${timestamp}]`) + " " + message);
        this.writeToFile(message);
    }
    success(message) {
        console.log(chalk_1.default.green(`✅ ${message}`));
        this.writeToFile(`✅ ${message}`);
    }
    error(message) {
        console.error(chalk_1.default.red(`❌ ${message}`));
        this.writeToFile(`❌ ERROR: ${message}`);
    }
    warning(message) {
        console.warn(chalk_1.default.yellow(`⚠️  ${message}`));
        this.writeToFile(`⚠️  ${message}`);
    }
    info(message) {
        console.log(chalk_1.default.cyan(`ℹ️  ${message}`));
        this.writeToFile(`ℹ️  ${message}`);
    }
    debug(message) {
        if (process.env.DEBUG) {
            console.log(chalk_1.default.gray(`🔍 ${message}`));
            this.writeToFile(`🔍 ${message}`);
        }
    }
    section(title) {
        console.log(chalk_1.default.cyan.bold(`\n════ ${title} ════\n`));
        this.writeToFile(`\n════ ${title} ════`);
    }
}
exports.Logger = Logger;
// Global logger instance
let globalLogger;
function getLogger(logFile = "depsync.log") {
    if (!globalLogger) {
        globalLogger = new Logger(logFile);
    }
    return globalLogger;
}
//# sourceMappingURL=logger.js.map