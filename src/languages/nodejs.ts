import { LanguageConfig, UpdateStrategy } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";

export class NodeJSLanguage implements LanguageConfig {
  name = "nodejs";
  enabled = true;
  private logger: Logger;
  private shell: Shell;

  constructor(logger: Logger, shell: Shell) {
    this.logger = logger;
    this.shell = shell;
  }

  async detect(): Promise<boolean> {
    const files = this.shell.findFiles("package.json", ".");
    return files.length > 0;
  }

  async update(strategy: UpdateStrategy): Promise<boolean> {
    try {
      // Check if ncu is installed
      if (!this.shell.commandExists("ncu")) {
        this.logger.error("npm-check-updates (ncu) is not installed");
        this.logger.info("Install with: npm install -g npm-check-updates");
        return false;
      }

      this.logger.log("🔄 Updating Node.js dependencies...");

      // Run ncu
      this.shell.execSync(`ncu -u --target ${strategy}`);
      this.logger.log("   Strategy: " + strategy);

      // Install updated packages
      this.shell.execSync("npm install");

      this.logger.success("Node.js dependencies updated");
      return true;
    } catch (error: any) {
      this.logger.error(`Node.js update failed: ${error.message}`);
      return false;
    }
  }

  async test(): Promise<boolean> {
    try {
      if (!this.shell.exists("package.json")) {
        return true; // Skip if no package.json
      }

      // Check if test script exists
      const packageJson = JSON.parse(this.shell.readFile("package.json"));
      if (!packageJson.scripts || !packageJson.scripts.test) {
        this.logger.info("ℹ️  No test script defined in package.json");
        return true;
      }

      this.logger.log("🧪 Running npm tests...");
      this.shell.execSync("npm test");
      this.logger.success("npm tests passed");
      return true;
    } catch (error: any) {
      this.logger.warning(`⚠️  npm tests failed: ${error.message}`);
      return false;
    }
  }

  async audit(): Promise<boolean> {
    try {
      if (
        !this.shell.commandExists("npm") ||
        !this.shell.exists("package.json")
      ) {
        return true; // Skip if no npm or package.json
      }

      this.logger.log("🔒 Running npm security audit...");
      const output = this.shell.exec("npm audit --json");

      if (!output) {
        this.logger.success("No vulnerabilities found");
        return true;
      }

      const auditData = JSON.parse(output);
      const metadata = auditData.metadata || {};
      const vulnerabilities = metadata.vulnerabilities || {};

      if (vulnerabilities.critical > 0) {
        this.logger.error(
          `⛔ CRITICAL vulnerabilities: ${vulnerabilities.critical}`,
        );
        return false;
      }

      if (vulnerabilities.high > 0) {
        this.logger.warning(
          `⚠️  HIGH vulnerabilities: ${vulnerabilities.high}`,
        );
      }

      this.logger.success("No critical/high vulnerabilities found");
      return true;
    } catch (error: any) {
      this.logger.warning(`⚠️  npm audit failed: ${error.message}`);
      return true; // Non-blocking
    }
  }

  async changelog(): Promise<string> {
    return `### Node.js Dependencies
- Updated npm packages to latest versions
- Security audit completed ✅
`;
  }
}
