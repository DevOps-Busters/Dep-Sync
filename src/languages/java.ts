import { LanguageConfig, UpdateStrategy } from "../types";
import { Logger } from "../utils/logger";
import { Shell } from "../utils/shell";

export class JavaLanguage implements LanguageConfig {
  name = "java";
  enabled = false;
  private logger: Logger;
  private shell: Shell;

  constructor(logger: Logger, shell: Shell) {
    this.logger = logger;
    this.shell = shell;
  }

  async detect(): Promise<boolean> {
    const pomFiles = this.shell.findFiles("pom.xml", ".");
    const gradleFiles = this.shell.findFiles("build.gradle*", ".");
    return pomFiles.length > 0 || gradleFiles.length > 0;
  }

  async update(strategy: UpdateStrategy): Promise<boolean> {
    try {
      this.logger.log("🔄 Updating Java dependencies...");

      if (this.shell.exists("pom.xml")) {
        return this.updateMaven();
      }

      if (
        this.shell.exists("build.gradle") ||
        this.shell.exists("build.gradle.kts")
      ) {
        return this.updateGradle();
      }

      this.logger.info("ℹ️  No Java project files detected");
      return true;
    } catch (error: any) {
      this.logger.error(`Java update failed: ${error.message}`);
      return false;
    }
  }

  private updateMaven(): boolean {
    this.logger.log("   Detected: Maven project (pom.xml)");

    if (!this.shell.commandExists("mvn")) {
      this.logger.error("Maven (mvn) is not installed");
      return false;
    }

    this.logger.log("   Running mvn versions:use-latest-versions...");
    this.shell.execSync(
      "mvn versions:use-latest-versions -DgenerateBackupPoms=false",
    );

    // Update parent POM if exists
    const pomContent = this.shell.readFile("pom.xml");
    if (pomContent.includes("<parent>")) {
      this.logger.log("   Updating parent POM...");
      this.shell.exec("mvn versions:update-parent -DgenerateBackupPoms=false");
    }

    this.logger.success("Maven dependencies updated");
    return true;
  }

  private updateGradle(): boolean {
    let gradleFile = "build.gradle";
    if (this.shell.exists("build.gradle.kts")) {
      gradleFile = "build.gradle.kts";
    }

    this.logger.log(`   Detected: Gradle project (${gradleFile})`);

    if (this.shell.exists("./gradlew")) {
      return this.updateGradleWrapper();
    }

    if (this.shell.commandExists("gradle")) {
      this.logger.log("   Using system Gradle...");
      this.shell.execSync("gradle dependencyUpdates");
      this.logger.success("Gradle dependencies checked");
      return true;
    }

    this.logger.error("Gradle wrapper not found and Gradle not installed");
    return false;
  }

  private updateGradleWrapper(): boolean {
    this.logger.log("   Using Gradle wrapper...");

    // Check for dependency update plugin
    const tasks = this.shell.exec("./gradlew tasks --all");
    if (tasks.includes("dependencyUpdates")) {
      this.logger.log("   Running dependencyUpdates task...");
      this.shell.execSync("./gradlew dependencyUpdates");
    } else {
      this.logger.info("ℹ️  Gradle versions plugin not configured");
      this.logger.info(
        "   Add: id 'com.github.ben-manes.versions' to build.gradle",
      );
    }

    this.logger.success("Gradle dependencies checked");
    return true;
  }

  async test(): Promise<boolean> {
    try {
      if (!(await this.detect())) {
        return true;
      }

      this.logger.log("🧪 Running Java tests...");

      if (this.shell.exists("pom.xml") && this.shell.commandExists("mvn")) {
        this.shell.execSync("mvn test -DskipTests=false");
        this.logger.success("Maven tests passed");
        return true;
      }

      if (this.shell.exists("./gradlew")) {
        this.shell.execSync("./gradlew test");
        this.logger.success("Gradle tests passed");
        return true;
      }

      if (this.shell.commandExists("gradle")) {
        this.shell.execSync("gradle test");
        this.logger.success("Gradle tests passed");
        return true;
      }

      this.logger.info("ℹ️  Could not run Java tests");
      return true;
    } catch (error: any) {
      this.logger.warning(`⚠️  Java tests failed: ${error.message}`);
      return false;
    }
  }

  async audit(): Promise<boolean> {
    try {
      if (!(await this.detect())) {
        return true;
      }

      this.logger.log("🔒 Running Java security audit...");

      if (this.shell.exists("pom.xml") && this.shell.commandExists("mvn")) {
        const pomContent = this.shell.readFile("pom.xml");
        if (pomContent.includes("dependency-check-maven")) {
          this.logger.log("   Running OWASP dependency-check...");
          this.shell.execSync("mvn dependency-check:check");
        } else {
          this.logger.info("ℹ️  OWASP dependency-check plugin not configured");
        }
        return true;
      }

      if (
        this.shell.exists("build.gradle") ||
        this.shell.exists("build.gradle.kts")
      ) {
        if (this.shell.exists("./gradlew")) {
          const tasks = this.shell.exec("./gradlew tasks --all");
          if (tasks.includes("dependencyCheckAnalyze")) {
            this.logger.log("   Running Gradle dependency check...");
            this.shell.execSync("./gradlew dependencyCheckAnalyze");
          } else {
            this.logger.info(
              "ℹ️  OWASP dependency-check plugin not configured",
            );
          }
        }
        return true;
      }

      return true;
    } catch (error: any) {
      this.logger.warning(`⚠️  Java audit failed: ${error.message}`);
      return true;
    }
  }

  async changelog(): Promise<string> {
    let content = "### Java Dependencies\n";

    if (this.shell.exists("pom.xml")) {
      content += "- Build Tool: Maven\n";
      const pomContent = this.shell.readFile("pom.xml");
      const versionMatch = pomContent.match(
        /<java\.version>([^<]+)<\/java\.version>/,
      );
      if (versionMatch) {
        content += `- Java Version: ${versionMatch[1]}\n`;
      }
    }

    if (
      this.shell.exists("build.gradle") ||
      this.shell.exists("build.gradle.kts")
    ) {
      content += "- Build Tool: Gradle\n";
    }

    content += "- Dependency check completed ✅\n";
    return content;
  }
}
