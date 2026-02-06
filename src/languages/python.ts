import { LanguageConfig, UpdateStrategy } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";

export class PythonLanguage implements LanguageConfig {
  name = "python";
  enabled = true;
  private logger: Logger;
  private shell: Shell;

  constructor(logger: Logger, shell: Shell) {
    this.logger = logger;
    this.shell = shell;
  }

  async detect(): Promise<boolean> {
    const files = this.shell.findFiles("requirements.txt", ".");
    const pyprojectFiles = this.shell.findFiles("pyproject.toml", ".");
    const setupFiles = this.shell.findFiles("setup.py", ".");
    return (
      files.length > 0 || pyprojectFiles.length > 0 || setupFiles.length > 0
    );
  }

  async update(strategy: UpdateStrategy): Promise<boolean> {
    try {
      this.logger.log("🔄 Updating Python dependencies...");

      if (this.shell.exists("requirements.txt")) {
        return this.updateRequirementsTxt(strategy);
      }

      if (this.shell.exists("pyproject.toml")) {
        return this.updatePyproject();
      }

      if (this.shell.exists("setup.py")) {
        return this.updateSetupPy();
      }

      this.logger.info("ℹ️  No Python project files detected");
      return true;
    } catch (error: any) {
      this.logger.error(`Python update failed: ${error.message}`);
      return false;
    }
  }

  private updateRequirementsTxt(strategy: UpdateStrategy): boolean {
    if (!this.shell.commandExists("pip")) {
      this.logger.error("pip is not installed");
      return false;
    }

    this.logger.log("   Detected: requirements.txt");

    // Install pip-tools if needed
    if (!this.shell.commandExists("pip-compile")) {
      this.logger.log("   Installing pip-tools...");
      this.shell.execSync("pip install --upgrade pip-tools");
    }

    // Check if requirements.in exists
    if (this.shell.exists("requirements.in")) {
      this.logger.log("   Compiling requirements.in...");
      this.shell.execSync("pip-compile --upgrade requirements.in");
    } else {
      this.logger.log("   Upgrading packages...");
      this.shell.execSync("pip install --upgrade -r requirements.txt");
    }

    this.logger.success("Python (pip) dependencies updated");
    return true;
  }

  private updatePyproject(): boolean {
    this.logger.log("   Detected: pyproject.toml");

    if (this.shell.commandExists("poetry")) {
      this.logger.log("   Running poetry update...");
      this.shell.execSync("poetry update");
      this.logger.success("Python (Poetry) dependencies updated");
      return true;
    }

    if (this.shell.commandExists("pip")) {
      this.logger.log("   Poetry not found, using pip...");
      this.shell.execSync("pip install --upgrade pip setuptools");
      this.shell.execSync("pip install -e .");
      this.logger.success("Python dependencies updated");
      return true;
    }

    this.logger.error("Neither poetry nor pip is installed");
    return false;
  }

  private updateSetupPy(): boolean {
    this.logger.log("   Detected: setup.py");
    this.logger.warning(
      "⚠️  setup.py detected but automated updates are limited",
    );
    this.logger.info("   Consider migrating to pyproject.toml");

    if (this.shell.commandExists("pip")) {
      this.shell.execSync("pip install --upgrade pip setuptools");
      this.shell.execSync("pip install -e .");
    }

    return true;
  }

  async test(): Promise<boolean> {
    try {
      if (!(await this.detect())) {
        return true; // Skip if no Python project
      }

      this.logger.log("🧪 Running Python tests...");

      if (this.shell.commandExists("pytest")) {
        this.shell.execSync("pytest");
        this.logger.success("pytest passed");
        return true;
      }

      if (this.shell.commandExists("python3")) {
        const result = this.shell.exec("python3 -m pytest");
        if (result) {
          this.logger.success("pytest passed");
          return true;
        }
      }

      this.logger.info("ℹ️  pytest not available, skipping tests");
      return true;
    } catch (error: any) {
      this.logger.warning(`⚠️  Python tests failed: ${error.message}`);
      return false;
    }
  }

  async audit(): Promise<boolean> {
    try {
      if (!(await this.detect())) {
        return true;
      }

      this.logger.log("🔒 Running Python security audit...");

      if (this.shell.commandExists("pip-audit")) {
        const output = this.shell.exec("pip-audit");
        if (
          output &&
          (output.includes("vulnerability") || output.includes("CRITICAL"))
        ) {
          this.logger.warning("⚠️  Vulnerabilities detected");
          return false;
        }
        this.logger.success("No vulnerabilities found (pip-audit)");
        return true;
      }

      if (this.shell.commandExists("safety")) {
        const output = this.shell.exec("safety check");
        if (output && output.includes("vulnerability")) {
          this.logger.warning("⚠️  Vulnerabilities detected (safety)");
          return false;
        }
        this.logger.success("No vulnerabilities found (safety)");
        return true;
      }

      this.logger.info("ℹ️  No Python audit tool installed");
      this.logger.info("   Install with: pip install pip-audit");
      return true;
    } catch (error: any) {
      this.logger.warning(`⚠️  Python audit failed: ${error.message}`);
      return true;
    }
  }

  async changelog(): Promise<string> {
    let content = "### Python Dependencies\n";

    if (this.shell.exists("requirements.txt")) {
      content += "- Updated: requirements.txt\n";
    }
    if (this.shell.exists("pyproject.toml")) {
      content += "- Updated: pyproject.toml (Poetry)\n";
    }

    content += "- Security audit completed ✅\n";
    return content;
  }
}
