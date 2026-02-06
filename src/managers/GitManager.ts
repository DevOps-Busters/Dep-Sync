import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";

export interface GitConfig {
  author: string;
  email: string;
  createBranch: boolean;
  createPR: boolean;
  autoCommit: boolean;
}

export class GitManager {
  private logger: Logger;
  private shell: Shell;
  private config: GitConfig;

  constructor(logger: Logger, shell: Shell, config?: GitConfig) {
    this.logger = logger;
    this.shell = shell;
    this.config = config || {
      author: "Dep-Sync Bot",
      email: "bot@dep-sync.local",
      createBranch: false,
      createPR: false,
      autoCommit: true,
    };
  }

  isGitRepository(): boolean {
    return this.shell.exists(".git");
  }

  getCurrentBranch(): string {
    try {
      return this.shell.exec("git rev-parse --abbrev-ref HEAD").trim();
    } catch {
      return "unknown";
    }
  }

  hasChanges(): boolean {
    try {
      const status = this.shell.exec("git status --porcelain");
      return status.length > 0;
    } catch {
      return false;
    }
  }

  getChangedFiles(): string[] {
    try {
      const status = this.shell.exec("git status --porcelain");
      return status
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.substring(3));
    } catch {
      return [];
    }
  }

  configureGit(): void {
    try {
      this.logger.log("⚙️  Configuring git...");
      this.shell.execSync(`git config user.name "${this.config.author}"`);
      this.shell.execSync(`git config user.email "${this.config.email}"`);
      this.logger.success("Git configured");
    } catch (error: any) {
      this.logger.warning(`⚠️  Failed to configure git: ${error.message}`);
    }
  }

  stageChanges(files?: string[]): boolean {
    try {
      if (!this.isGitRepository()) {
        this.logger.warning("Not a git repository");
        return false;
      }

      if (files && files.length > 0) {
        this.logger.log(`📝 Staging ${files.length} file(s)...`);
        for (const file of files) {
          this.shell.execSync(`git add "${file}"`);
        }
      } else {
        this.logger.log("📝 Staging all changes...");
        this.shell.execSync("git add .");
      }

      this.logger.success("Changes staged");
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to stage changes: ${error.message}`);
      return false;
    }
  }

  commit(message: string, files?: string[]): boolean {
    try {
      if (!this.isGitRepository()) {
        this.logger.warning("Not a git repository");
        return false;
      }

      const changes = this.getChangedFiles();
      if (changes.length === 0) {
        this.logger.info("ℹ️  No changes to commit");
        return true;
      }

      this.logger.log(`💾 Committing: ${message}`);
      this.shell.execSync(`git commit -m "${message}"`);
      this.logger.success("Committed successfully");
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to commit: ${error.message}`);
      return false;
    }
  }

  createBranch(branchName: string): boolean {
    try {
      if (!this.isGitRepository()) {
        this.logger.warning("Not a git repository");
        return false;
      }

      this.logger.log(`🌿 Creating branch: ${branchName}`);
      this.shell.execSync(`git checkout -b ${branchName}`);
      this.logger.success(`Branch created: ${branchName}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to create branch: ${error.message}`);
      return false;
    }
  }

  switchBranch(branchName: string): boolean {
    try {
      if (!this.isGitRepository()) {
        this.logger.warning("Not a git repository");
        return false;
      }

      this.logger.log(`🔄 Switching to branch: ${branchName}`);
      this.shell.execSync(`git checkout ${branchName}`);
      this.logger.success(`Switched to: ${branchName}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to switch branch: ${error.message}`);
      return false;
    }
  }

  listBranches(): string[] {
    try {
      const branches = this.shell.exec("git branch --list");
      return branches
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.replace("*", "").trim());
    } catch {
      return [];
    }
  }

  deleteBranch(branchName: string): boolean {
    try {
      this.logger.log(`🗑️  Deleting branch: ${branchName}`);
      this.shell.execSync(`git branch -d ${branchName}`);
      this.logger.success(`Branch deleted: ${branchName}`);
      return true;
    } catch (error: any) {
      this.logger.warning(`Failed to delete branch: ${error.message}`);
      return false;
    }
  }

  push(remote: string = "origin", branch?: string): boolean {
    try {
      if (!this.isGitRepository()) {
        this.logger.warning("Not a git repository");
        return false;
      }

      const branchName = branch || this.getCurrentBranch();
      this.logger.log(`📤 Pushing to ${remote}/${branchName}...`);
      this.shell.execSync(`git push ${remote} ${branchName}`);
      this.logger.success("Pushed successfully");
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to push: ${error.message}`);
      return false;
    }
  }

  pull(remote: string = "origin", branch?: string): boolean {
    try {
      if (!this.isGitRepository()) {
        this.logger.warning("Not a git repository");
        return false;
      }

      const branchName = branch || this.getCurrentBranch();
      this.logger.log(`📥 Pulling from ${remote}/${branchName}...`);
      this.shell.execSync(`git pull ${remote} ${branchName}`);
      this.logger.success("Pulled successfully");
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to pull: ${error.message}`);
      return false;
    }
  }

  createPullRequest(
    title: string,
    body: string,
    baseBranch: string = "main",
  ): boolean {
    try {
      if (!this.isGitRepository()) {
        this.logger.warning("Not a git repository");
        return false;
      }

      const currentBranch = this.getCurrentBranch();

      // Attempt to detect git provider and create PR using CLI tools
      if (this.shell.commandExists("gh")) {
        return this.createGHPullRequest(title, body, currentBranch, baseBranch);
      }

      this.logger.warning(
        "⚠️  GitHub CLI (gh) not found. Cannot create PR automatically.",
      );
      this.logger.info("ℹ️  Create PR manually using GitHub web interface");
      return false;
    } catch (error: any) {
      this.logger.error(`Failed to create PR: ${error.message}`);
      return false;
    }
  }

  private createGHPullRequest(
    title: string,
    body: string,
    headBranch: string,
    baseBranch: string,
  ): boolean {
    try {
      this.logger.log(`📋 Creating pull request: ${title}`);
      const bodyEscaped = body.replace(/"/g, '\\"');
      this.shell.execSync(
        `gh pr create --title "${title}" --body "${bodyEscaped}" --head ${headBranch} --base ${baseBranch}`,
      );
      this.logger.success("Pull request created");
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to create PR: ${error.message}`);
      return false;
    }
  }

  reset(mode: "soft" | "hard" = "soft"): boolean {
    try {
      const current = this.getCurrentBranch();
      this.logger.log(`🔄 Resetting ${mode} to origin/${current}...`);
      this.shell.execSync(`git reset --${mode} origin/${current}`);
      this.logger.success("Reset complete");
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to reset: ${error.message}`);
      return false;
    }
  }

  cleanup(): boolean {
    try {
      if (!this.isGitRepository()) {
        return true;
      }

      const branches = this.listBranches();
      const deletedCount = 0;

      // Delete merged branches (except main, master, develop)
      for (const branch of branches) {
        if (!["main", "master", "develop", "dev"].includes(branch)) {
          try {
            const isMerged = this.shell.exec(`git branch -d ${branch}`);
            this.logger.info(`🧹 Cleaned up branch: ${branch}`);
          } catch {
            // Branch not merged or other error
          }
        }
      }

      return true;
    } catch (error: any) {
      this.logger.warning(`Cleanup error: ${error.message}`);
      return true;
    }
  }

  getOriginUrl(): string | null {
    try {
      if (!this.isGitRepository()) {
        return null;
      }

      return this.shell.exec("git config --get remote.origin.url").trim();
    } catch {
      return null;
    }
  }

  printStatus(): void {
    if (!this.isGitRepository()) {
      this.logger.warning("Not a git repository");
      return;
    }

    this.logger.section("📊 Git Status");
    this.logger.info(`Current Branch: ${this.getCurrentBranch()}`);
    this.logger.info(`Origin: ${this.getOriginUrl() || "Not configured"}`);

    const changes = this.getChangedFiles();
    if (changes.length > 0) {
      this.logger.warning(`Uncommitted Changes: ${changes.length}`);
    } else {
      this.logger.success("Working directory clean");
    }
  }
}
