"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageRegistry = void 0;
const nodejs_1 = require("../languages/nodejs");
const python_1 = require("../languages/python");
const docker_1 = require("../languages/docker");
const java_1 = require("../languages/java");
class LanguageRegistry {
    constructor(logger, shell) {
        this.languages = new Map();
        this.logger = logger;
        this.shell = shell;
        this.registerDefaultLanguages();
    }
    registerDefaultLanguages() {
        this.register(new nodejs_1.NodeJSLanguage(this.logger, this.shell));
        this.register(new python_1.PythonLanguage(this.logger, this.shell));
        this.register(new docker_1.DockerLanguage(this.logger, this.shell));
        this.register(new java_1.JavaLanguage(this.logger, this.shell));
    }
    register(language) {
        this.languages.set(language.name, language);
        this.logger.debug(`Registered language handler: ${language.name}`);
    }
    get(name) {
        return this.languages.get(name);
    }
    getAll() {
        return Array.from(this.languages.values());
    }
    getEnabled() {
        return this.getAll().filter((lang) => lang.enabled);
    }
    async detectAll() {
        const detections = new Map();
        this.logger.section("🔍 Detecting project languages...");
        for (const language of this.getAll()) {
            try {
                const detected = await language.detect();
                detections.set(language.name, detected);
                if (detected) {
                    this.logger.success(`✓ Detected ${language.name}`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to detect ${language.name}: ${error.message}`);
                detections.set(language.name, false);
            }
        }
        return detections;
    }
    async updateAll(strategy = "minor", detections) {
        const result = {
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
                }
                else {
                    result.failed.push(language.name);
                    this.logger.error(`✗ Failed to update ${language.name}`);
                    result.success = false;
                }
            }
            catch (error) {
                result.failed.push(language.name);
                this.logger.error(`Error updating ${language.name}: ${error.message}`);
                result.success = false;
            }
        }
        this.logUpdateResult(result);
        return result;
    }
    async testAll(detections) {
        const result = {
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
                }
                else {
                    result.failed.push(language.name);
                    this.logger.warning(`⚠️  ${language.name} tests failed`);
                    result.success = false;
                }
            }
            catch (error) {
                result.failed.push(language.name);
                this.logger.warning(`⚠️  ${language.name} test error: ${error.message}`);
            }
        }
        this.logUpdateResult(result);
        return result;
    }
    async auditAll(detections) {
        const result = {
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
                }
                else {
                    result.failed.push(language.name);
                    this.logger.warning(`⚠️  ${language.name} audit warnings`);
                }
            }
            catch (error) {
                result.failed.push(language.name);
                this.logger.warning(`⚠️  ${language.name} audit error: ${error.message}`);
            }
        }
        this.logUpdateResult(result);
        return result;
    }
    async generateChangelog() {
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
            }
            catch (error) {
                this.logger.debug(`Failed to generate changelog for ${language.name}: ${error.message}`);
            }
        }
        return changelog;
    }
    logUpdateResult(result) {
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
    printStatus() {
        this.logger.section("📊 Language Registry Status");
        for (const language of this.getAll()) {
            const status = language.enabled ? "✓" : "○";
            this.logger.info(`${status} ${language.name} (${language.enabled ? "enabled" : "disabled"})`);
        }
    }
}
exports.LanguageRegistry = LanguageRegistry;
//# sourceMappingURL=LanguageRegistry.js.map