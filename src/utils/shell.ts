import { execSync } from "child_process";
import { promisify } from "util";
import { exec } from "child_process";
import { Logger } from "./logger";

const execAsync = promisify(exec);

export class Shell {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Execute a command synchronously
   */
  execSync(command: string, cwd?: string): string {
    try {
      const options = cwd ? { cwd } : undefined;
      return execSync(command, options).toString().trim();
    } catch (error: any) {
      this.logger.debug(`Command failed: ${command}`);
      throw new Error(error.message);
    }
  }

  /**
   * Execute a command asynchronously
   */
  async execAsync(command: string, cwd?: string): Promise<string> {
    try {
      const options = cwd ? { cwd } : undefined;
      const { stdout } = await execAsync(command, options);
      return (stdout as string).trim();
    } catch (error: any) {
      this.logger.debug(`Command failed: ${command}`);
      throw new Error(error.message);
    }
  }

  /**
   * Check if a command exists in system PATH
   */
  commandExists(command: string): boolean {
    try {
      if (process.platform === "win32") {
        this.execSync(`where ${command}`);
      } else {
        this.execSync(`command -v ${command}`);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get version of a command
   */
  getVersion(command: string, versionFlag: string = "--version"): string {
    try {
      const output = this.execSync(`${command} ${versionFlag}`);
      const match = output.match(/\d+\.\d+\.\d+/);
      return match ? match[0] : output.split("\n")[0];
    } catch {
      return "unknown";
    }
  }

  /**
   * Find files matching a pattern
   */
  findFiles(pattern: string, directory: string = "."): string[] {
    try {
      const command =
        process.platform === "win32"
          ? `dir /s /b "${directory}\\${pattern}"`
          : `find "${directory}" -name "${pattern}" -type f`;
      const output = this.execSync(command);
      return output ? output.split("\n").filter((f) => f.trim()) : [];
    } catch {
      return [];
    }
  }

  /**
   * Check if file or directory exists
   */
  exists(path: string): boolean {
    try {
      if (process.platform === "win32") {
        this.execSync(`dir "${path}"`);
      } else {
        this.execSync(`test -e "${path}"`);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read file content
   */
  readFile(filePath: string): string {
    try {
      const command =
        process.platform === "win32"
          ? `type "${filePath}"`
          : `cat "${filePath}"`;
      return this.execSync(command);
    } catch {
      return "";
    }
  }

  /**
   * Write to file
   */
  writeFile(filePath: string, content: string): void {
    try {
      if (process.platform === "win32") {
        execSync(
          `powershell -Command "[System.IO.File]::WriteAllText('${filePath}', @'\\n${content}\\n'@)"`,
        );
      } else {
        execSync(
          `mkdir -p "$(dirname "${filePath}")" && cat > "${filePath}" << 'EOF'\n${content}\nEOF`,
        );
      }
    } catch (error: any) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  /**
   * Execute command and suppress errors
   */
  exec(command: string): string {
    try {
      return this.execSync(command);
    } catch {
      return "";
    }
  }
}

export function getShell(logger: Logger): Shell {
  return new Shell(logger);
}
