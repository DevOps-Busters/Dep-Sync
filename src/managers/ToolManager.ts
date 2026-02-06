import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";

export interface ToolRequirement {
  name: string;
  command: string;
  minVersion?: string;
  optional?: boolean;
  description?: string;
}

export class ToolManager {
  private logger: Logger;
  private shell: Shell;
  private requiredTools: Map<string, ToolRequirement> = new Map();

  constructor(logger: Logger, shell: Shell) {
    this.logger = logger;
    this.shell = shell;
    this.registerDefaultTools();
  }

  private registerDefaultTools(): void {
    // Core tools
    this.registerTool({
      name: "git",
      command: "git",
      description: "Version control system",
      optional: false,
    });

    // Node.js related
    this.registerTool({
      name: "node",
      command: "node",
      minVersion: "14.0.0",
      description: "JavaScript runtime",
      optional: false,
    });

    this.registerTool({
      name: "npm",
      command: "npm",
      description: "Node.js package manager",
      optional: true,
    });

    // Python related
    this.registerTool({
      name: "python",
      command: "python",
      description: "Python interpreter",
      optional: true,
    });

    this.registerTool({
      name: "pip",
      command: "pip",
      description: "Python package manager",
      optional: true,
    });

    this.registerTool({
      name: "poetry",
      command: "poetry",
      description: "Python dependency manager",
      optional: true,
    });

    // Docker related
    this.registerTool({
      name: "docker",
      command: "docker",
      description: "Container platform",
      optional: true,
    });

    // Java related
    this.registerTool({
      name: "java",
      command: "java",
      description: "Java runtime",
      optional: true,
    });

    this.registerTool({
      name: "maven",
      command: "mvn",
      description: "Java build tool (Maven)",
      optional: true,
    });

    this.registerTool({
      name: "gradle",
      command: "gradle",
      description: "Java build tool (Gradle)",
      optional: true,
    });

    // Git related
    this.registerTool({
      name: "gh",
      command: "gh",
      description: "GitHub CLI",
      optional: true,
    });

    // Utility tools
    this.registerTool({
      name: "curl",
      command: "curl",
      description: "Data transfer utility",
      optional: true,
    });
  }

  registerTool(requirement: ToolRequirement): void {
    this.requiredTools.set(requirement.name, requirement);
  }

  isInstalled(toolName: string): boolean {
    const tool = this.requiredTools.get(toolName);
    if (!tool) {
      return this.shell.commandExists(toolName);
    }
    return this.shell.commandExists(tool.command);
  }

  getVersion(toolName: string): string | null {
    try {
      const tool = this.requiredTools.get(toolName);
      if (!tool) {
        return null;
      }
      return this.shell.getVersion(tool.command);
    } catch {
      return null;
    }
  }

  require(toolName: string): boolean {
    const tool = this.requiredTools.get(toolName);
    if (!tool) {
      this.logger.warning(`⚠️  Unknown tool: ${toolName}`);
      return false;
    }

    return this.requireTool(tool);
  }

  private requireTool(tool: ToolRequirement): boolean {
    if (!this.shell.commandExists(tool.command)) {
      const msg = tool.optional
        ? `⚠️  Optional tool not found: ${tool.name}`
        : `❌ Required tool not found: ${tool.name}`;
      this.logger.warning(msg);

      if (tool.description) {
        this.logger.info(`   ${tool.description}`);
      }

      return tool.optional ? true : false;
    }

    return true;
  }

  validateCore(): boolean {
    this.logger.section("✅ Validating core tools...");
    let allValid = true;

    for (const [name, tool] of this.requiredTools) {
      if (!tool.optional) {
        if (!this.requireTool(tool)) {
          allValid = false;
        } else {
          const version = this.getVersion(name);
          this.logger.success(`✓ ${name}${version ? ` (${version})` : ""}`);
        }
      }
    }

    return allValid;
  }

  validateLanguageTools(): Map<string, boolean> {
    const results = new Map<string, boolean>();

    this.logger.section("📦 Checking language tools...");

    // Node.js
    const hasNode = this.isInstalled("npm");
    results.set("nodejs", hasNode);
    if (hasNode) {
      this.logger.success(`✓ Node.js/npm available`);
    } else {
      this.logger.info(`○ Node.js/npm not available`);
    }

    // Python
    const hasPython = this.isInstalled("python") && this.isInstalled("pip");
    results.set("python", hasPython);
    if (hasPython) {
      this.logger.success(`✓ Python/pip available`);
    } else {
      this.logger.info(`○ Python/pip not available`);
    }

    // Docker
    const hasDocker = this.isInstalled("docker");
    results.set("docker", hasDocker);
    if (hasDocker) {
      this.logger.success(`✓ Docker available`);
    } else {
      this.logger.info(`○ Docker not available`);
    }

    // Java
    const hasJava = this.isInstalled("java");
    const hasMaven = this.isInstalled("maven");
    const hasGradle = this.isInstalled("gradle");
    results.set("java", hasJava && (hasMaven || hasGradle));

    if (hasJava && (hasMaven || hasGradle)) {
      this.logger.success(`✓ Java tools available`);
    } else {
      this.logger.info(`○ Java tools not available`);
    }

    return results;
  }

  printStatus(): void {
    this.logger.section("🛠️  Tool Status");

    for (const [name, tool] of this.requiredTools) {
      const installed = this.isInstalled(name);
      const status = installed ? "✓" : "○";
      const required = tool.optional ? "(optional)" : "(required)";
      const version = installed ? ` v${this.getVersion(name)}` : "";

      this.logger.info(`${status} ${name}${version} ${required}`);
    }
  }

  preflight(): boolean {
    this.logger.section("🚀 Pre-flight checks...");

    // Check core tools
    if (!this.validateCore()) {
      this.logger.error("❌ Core tools validation failed");
      return false;
    }

    // Check at least one language tool
    const langTools = this.validateLanguageTools();
    const hasAnyLanguageTool = Array.from(langTools.values()).some((v) => v);

    if (!hasAnyLanguageTool) {
      this.logger.error("❌ No language tools detected");
      return false;
    }

    this.logger.success("✓ All checks passed");
    return true;
  }
}
