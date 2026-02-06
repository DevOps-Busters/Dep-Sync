"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shell = void 0;
exports.getShell = getShell;
const child_process_1 = require("child_process");
const util_1 = require("util");
const child_process_2 = require("child_process");
const execAsync = (0, util_1.promisify)(child_process_2.exec);
class Shell {
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Execute a command synchronously
     */
    execSync(command, cwd) {
        try {
            const options = cwd ? { cwd } : undefined;
            return (0, child_process_1.execSync)(command, options).toString().trim();
        }
        catch (error) {
            this.logger.debug(`Command failed: ${command}`);
            throw new Error(error.message);
        }
    }
    /**
     * Execute a command asynchronously
     */
    async execAsync(command, cwd) {
        try {
            const options = cwd ? { cwd } : undefined;
            const { stdout } = await execAsync(command, options);
            return stdout.trim();
        }
        catch (error) {
            this.logger.debug(`Command failed: ${command}`);
            throw new Error(error.message);
        }
    }
    /**
     * Check if a command exists in system PATH
     */
    commandExists(command) {
        try {
            if (process.platform === "win32") {
                this.execSync(`where ${command}`);
            }
            else {
                this.execSync(`command -v ${command}`);
            }
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get version of a command
     */
    getVersion(command, versionFlag = "--version") {
        try {
            const output = this.execSync(`${command} ${versionFlag}`);
            const match = output.match(/\d+\.\d+\.\d+/);
            return match ? match[0] : output.split("\n")[0];
        }
        catch {
            return "unknown";
        }
    }
    /**
     * Find files matching a pattern
     */
    findFiles(pattern, directory = ".") {
        try {
            const command = process.platform === "win32"
                ? `dir /s /b "${directory}\\${pattern}"`
                : `find "${directory}" -name "${pattern}" -type f`;
            const output = this.execSync(command);
            return output ? output.split("\n").filter((f) => f.trim()) : [];
        }
        catch {
            return [];
        }
    }
    /**
     * Check if file or directory exists
     */
    exists(path) {
        try {
            if (process.platform === "win32") {
                this.execSync(`dir "${path}"`);
            }
            else {
                this.execSync(`test -e "${path}"`);
            }
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Read file content
     */
    readFile(filePath) {
        try {
            const command = process.platform === "win32"
                ? `type "${filePath}"`
                : `cat "${filePath}"`;
            return this.execSync(command);
        }
        catch {
            return "";
        }
    }
    /**
     * Write to file
     */
    writeFile(filePath, content) {
        try {
            if (process.platform === "win32") {
                (0, child_process_1.execSync)(`powershell -Command "[System.IO.File]::WriteAllText('${filePath}', @'\\n${content}\\n'@)"`);
            }
            else {
                (0, child_process_1.execSync)(`mkdir -p "$(dirname "${filePath}")" && cat > "${filePath}" << 'EOF'\n${content}\nEOF`);
            }
        }
        catch (error) {
            throw new Error(`Failed to write file: ${error.message}`);
        }
    }
    /**
     * Execute command and suppress errors
     */
    exec(command) {
        try {
            return this.execSync(command);
        }
        catch {
            return "";
        }
    }
}
exports.Shell = Shell;
function getShell(logger) {
    return new Shell(logger);
}
//# sourceMappingURL=shell.js.map