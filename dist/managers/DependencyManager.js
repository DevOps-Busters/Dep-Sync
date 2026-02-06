"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyManager = void 0;
class DependencyManager {
    constructor(logger, shell, config, languages, git, tools) {
        this.dryRun = false;
        this.logger = logger;
        this.shell = shell;
        this.config = config;
        this.languages = languages;
        this.git = git;
        this.tools = tools;
    }
    async executeFullUpdate(options) {
        const startTime = Date.now();
        try {
            this.dryRun = options?.dryRun ?? false;
            this.logger.section("🚀 Starting Dependency Update");
            // Pre-flight checks
            if (!(await this.preflight())) {
                return this.createFailureResult();
            }
            // Detect project languages
            const detections = await this.languages.detectAll();
            if (Array.from(detections.values()).every((v) => !v)) {
                this.logger.warning("⚠️  No supported project languages detected");
                return this.createFailureResult();
            }
            // Create feature branch if enabled
            let branchCreated = false;
            if (this.git.isGitRepository() &&
                this.config.get("GIT_CREATE_BRANCH") === "true") {
                const branchName = `deps/update-${Date.now()}`;
                branchCreated = this.git.createBranch(branchName);
            }
            // Execute update
            const strategy = options?.strategy ||
                this.config.get("updateStrategy");
            const updateResult = await this.languages.updateAll(strategy, detections);
            if (!updateResult.success) {
                this.logger.warning("⚠️  Some updates failed");
            }
            // Run tests if enabled
            if (options?.testAfterUpdate !== false &&
                this.config.get("RUN_TESTS") === "true") {
                this.logger.section("🧪 Running Tests");
                const testResult = await this.languages.testAll(detections);
                if (!testResult.success) {
                    this.logger.warning("⚠️  Some tests failed");
                    updateResult.success = false;
                }
            }
            // Run audit if enabled
            if (options?.auditAfterUpdate !== false &&
                this.config.get("RUN_AUDIT") === "true") {
                this.logger.section("🔒 Security Audit");
                const auditResult = await this.languages.auditAll(detections);
                if (!auditResult.success) {
                    this.logger.warning("⚠️  Security audit found issues");
                }
            }
            // Commit changes if enabled
            if (options?.commitChanges !== false &&
                this.git.isGitRepository() &&
                this.config.get("GIT_AUTO_COMMIT") === "true") {
                this.commitUpdates();
            }
            // Create PR if enabled
            if (options?.createPR && this.git.isGitRepository() && branchCreated) {
                this.createPullRequest();
            }
            // Generate changelog
            const changelog = await this.languages.generateChangelog();
            if (changelog) {
                this.logger.debug("Generated changelog:\n" + changelog);
            }
            // Print summary
            this.printSummary(updateResult, startTime);
            return updateResult;
        }
        catch (error) {
            this.logger.error(`Fatal error: ${error.message}`);
            return this.createFailureResult();
        }
    }
    async detectOnly() {
        this.logger.section("🔍 Detecting project languages");
        return this.languages.detectAll();
    }
    async updateOnly(strategy = "minor") {
        this.logger.section("📦 Updating dependencies");
        const detections = await this.detectOnly();
        return this.languages.updateAll(strategy, detections);
    }
    async testOnly() {
        this.logger.section("🧪 Running tests");
        const detections = await this.detectOnly();
        return this.languages.testAll(detections);
    }
    async auditOnly() {
        this.logger.section("🔒 Running security audits");
        const detections = await this.detectOnly();
        return this.languages.auditAll(detections);
    }
    async preflight() {
        this.logger.section("✅ Pre-flight checks");
        if (!this.tools.preflight()) {
            this.logger.error("❌ Pre-flight checks failed");
            return false;
        }
        if (this.git.isGitRepository()) {
            this.git.printStatus();
            if (this.git.hasChanges()) {
                this.logger.warning("⚠️  Working directory has uncommitted changes");
                if (this.config.get("GIT_STRICT_MODE") === "true") {
                    this.logger.error("Strict mode: Aborting due to uncommitted changes");
                    return false;
                }
            }
        }
        return true;
    }
    commitUpdates() {
        if (!this.git.isGitRepository()) {
            return false;
        }
        const changes = this.git.getChangedFiles();
        if (changes.length === 0) {
            this.logger.info("ℹ️  No changes to commit");
            return true;
        }
        this.git.configureGit();
        if (this.dryRun) {
            this.logger.info("🔄 [DRY RUN] Would commit changes");
            return true;
        }
        const commitMessage = `deps: update ${new Date().toISOString()}`;
        return this.git.commit(commitMessage);
    }
    createPullRequest() {
        const title = `Automated Dependency Updates - ${new Date().toLocaleDateString()}`;
        const body = `# Automated Dependency Updates\n\nThis PR updates project dependencies automatically via Dep-Sync.\n\n- Detect and update all supported languages\n- Run tests to verify compatibility\n- Generate security audit reports\n\nPlease review the changes and merge if satisfied.`;
        if (this.dryRun) {
            this.logger.info("🔄 [DRY RUN] Would create pull request");
            return true;
        }
        return this.git.createPullRequest(title, body);
    }
    printSummary(result, startTime) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        this.logger.section("📊 Update Summary");
        if (result.updated.length > 0) {
            this.logger.success(`Updated: ${result.updated.join(", ")}`);
        }
        if (result.skipped.length > 0) {
            this.logger.info(`Skipped: ${result.skipped.join(", ")}`);
        }
        if (result.failed.length > 0) {
            this.logger.error(`Failed: ${result.failed.join(", ")}`);
        }
        this.logger.info(`Time elapsed: ${elapsed}s`);
        if (result.success) {
            this.logger.success("✅ Update completed successfully");
        }
        else {
            this.logger.warning("⚠️  Update completed with issues");
        }
        if (this.dryRun) {
            this.logger.warning("🔄 [DRY RUN MODE] No actual changes were made");
        }
    }
    createFailureResult() {
        return {
            success: false,
            updated: [],
            failed: [],
            skipped: [],
            timestamp: new Date().toISOString(),
        };
    }
    printStatus() {
        this.logger.section("📋 Dependency Manager Status");
        this.languages.printStatus();
        this.logger.info("");
        this.tools.printStatus();
        if (this.git.isGitRepository()) {
            this.logger.info("");
            this.git.printStatus();
        }
    }
}
exports.DependencyManager = DependencyManager;
//# sourceMappingURL=DependencyManager.js.map