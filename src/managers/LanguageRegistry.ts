import { LanguageConfig, UpdateStrategy, UpdateResult } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";
import { NodeJSLanguage } from "../languages/nodejs";
import { PythonLanguage } from "../languages/python";
import { DockerLanguage } from "../languages/docker";
import { JavaLanguage } from "../languages/java";

export class LanguageRegistry {
  private languages: Map<string, LanguageConfig> = new Map();
  private logger: Logger;
  private shell: Shell;

  constructor(logger: Logger, shell: Shell) {
    this.logger = logger;
    this.shell = shell;
    this.registerDefaultLanguages();
  }

  private registerDefaultLanguages(): void {
    this.register(new NodeJSLanguage(this.logger, this.shell));
    this.register(new PythonLanguage(this.logger, this.shell));
    this.register(new DockerLanguage(this.logger, this.shell));
    this.register(new JavaLanguage(this.logger, this.shell));
  }

  register(language: LanguageConfig): void {
    this.languages.set(language.name, language);
    this.logger.debug(`Registered language handler: ${language.name}`);
  }

  get(name: string): LanguageConfig | undefined {
    return this.languages.get(name);
  }

  getAll(): LanguageConfig[] {
    return Array.from(this.languages.values());
  }

  getEnabled(): LanguageConfig[] {
    return this.getAll().filter((lang) => lang.enabled);
  }

  async detectAll(): Promise<Map<string, boolean>> {
    const detections = new Map<string, boolean>();

    this.logger.section("🔍 Detecting project languages...");

    for (const language of this.getAll()) {
      try {
        const detected = await language.detect();
        detections.set(language.name, detected);
        if (detected) {
          this.logger.success(`✓ Detected ${language.name}`);
        }
      } catch (error: any) {
        this.logger.error(
          `Failed to detect ${language.name}: ${error.message}`,
        );
        detections.set(language.name, false);
      }
    }

    return detections;
  }

  async updateAll(
    strategy: UpdateStrategy = "minor",
    detections?: Map<string, boolean>,
  ): Promise<UpdateResult> {
    const result: UpdateResult = {
      success: true,
      updated: [],
      failed: [],
      skipped: [],
      timestamp: new Date().toISOString(),
    };

    this.logger.section("📦 Updating dependencies...");

    for (const language of this.getEnabled()) {
      try {
        let shouldUpdate = true;

        // Use detection results if provided
        if (detections && !detections.get(language.name)) {
          result.skipped.push(language.name);
          continue;
        }

        // Try to detect if not provided
        if (!detections) {
          const detected = await language.detect();
          if (!detected) {
            result.skipped.push(language.name);
            continue;
          }
        }

        const updated = await language.update(strategy);
        if (updated) {
          result.updated.push(language.name);
          this.logger.success(`✓ Updated ${language.name} dependencies`);
        } else {
          result.failed.push(language.name);
          this.logger.error(`✗ Failed to update ${language.name}`);
          result.success = false;
        }
      } catch (error: any) {
        result.failed.push(language.name);
        this.logger.error(`Error updating ${language.name}: ${error.message}`);
        result.success = false;
      }
    }

    this.logUpdateResult(result);
    return result;
  }

  async testAll(detections?: Map<string, boolean>): Promise<UpdateResult> {
    const result: UpdateResult = {
      success: true,
      updated: [],
      failed: [],
      skipped: [],
      timestamp: new Date().toISOString(),
    };

    this.logger.section("🧪 Running tests...");

    for (const language of this.getEnabled()) {
      try {
        let shouldTest = true;

        // Use detection results if provided
        if (detections && !detections.get(language.name)) {
          result.skipped.push(language.name);
          continue;
        }

        // Try to detect if not provided
        if (!detections) {
          const detected = await language.detect();
          if (!detected) {
            result.skipped.push(language.name);
            continue;
          }
        }

        const passed = await language.test();
        if (passed) {
          result.updated.push(language.name);
          this.logger.success(`✓ ${language.name} tests passed`);
        } else {
          result.failed.push(language.name);
          this.logger.warning(`⚠️  ${language.name} tests failed`);
          result.success = false;
        }
      } catch (error: any) {
        result.failed.push(language.name);
        this.logger.warning(
          `⚠️  ${language.name} test error: ${error.message}`,
        );
      }
    }

    this.logUpdateResult(result);
    return result;
  }

  async auditAll(detections?: Map<string, boolean>): Promise<UpdateResult> {
    const result: UpdateResult = {
      success: true,
      updated: [],
      failed: [],
      skipped: [],
      timestamp: new Date().toISOString(),
    };

    this.logger.section("🔒 Security audits...");

    for (const language of this.getEnabled()) {
      try {
        // Use detection results if provided
        if (detections && !detections.get(language.name)) {
          result.skipped.push(language.name);
          continue;
        }

        // Try to detect if not provided
        if (!detections) {
          const detected = await language.detect();
          if (!detected) {
            result.skipped.push(language.name);
            continue;
          }
        }

        const audited = await language.audit();
        if (audited) {
          result.updated.push(language.name);
          this.logger.success(`✓ ${language.name} audit completed`);
        } else {
          result.failed.push(language.name);
          this.logger.warning(`⚠️  ${language.name} audit warnings`);
        }
      } catch (error: any) {
        result.failed.push(language.name);
        this.logger.warning(
          `⚠️  ${language.name} audit error: ${error.message}`,
        );
      }
    }

    this.logUpdateResult(result);
    return result;
  }

  async generateChangelog(): Promise<string> {
    let changelog = "# Dependency Updates Changelog\n\n";
    changelog += `Generated: ${new Date().toISOString()}\n\n`;

    for (const language of this.getEnabled()) {
      try {
        const detected = await language.detect();
        if (detected) {
          const langChangelog = await language.changelog();
          if (langChangelog) {
            changelog += langChangelog + "\n\n";
          }
        }
      } catch (error: any) {
        this.logger.debug(
          `Failed to generate changelog for ${language.name}: ${error.message}`,
        );
      }
    }

    return changelog;
  }

  private logUpdateResult(result: UpdateResult): void {
    if (result.updated.length > 0) {
      this.logger.info(`✅ Success: ${result.updated.join(", ")}`);
    }

    if (result.skipped.length > 0) {
      this.logger.info(`⊘ Skipped: ${result.skipped.join(", ")}`);
    }

    if (result.failed.length > 0) {
      this.logger.error(`❌ Failed: ${result.failed.join(", ")}`);
    }
  }

  printStatus(): void {
    this.logger.section("📊 Language Registry Status");

    for (const language of this.getAll()) {
      const status = language.enabled ? "✓" : "○";
      this.logger.info(
        `${status} ${language.name} (${language.enabled ? "enabled" : "disabled"})`,
      );
    }
  }
}
