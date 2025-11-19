# Dependency Updater

**A comprehensive, automated dependency updater** for 7 programming languages (Node.js, Python, Docker, Java, Go, Rust) with security audits, parallel execution, interactive CLI, monorepo support, and GitHub Actions integration.

**Features:** Multi-language support • Enterprise Nexus Docker registry • Security audits • Parallel execution • Interactive CLI • Monorepo support • Conflict resolution • PR enhancements • Dependency reports • Auto-detection • CI/CD ready

---

## 🎯 Supported Languages

| Language          | Package Manager    | Detection Method                                 | Update Method                      |
| ----------------- | ------------------ | ------------------------------------------------ | ---------------------------------- |
| **Node.js**       | npm                | `package.json`                                   | `npm-check-updates` (ncu)          |
| **Python**        | pip/Poetry         | `requirements.txt`, `pyproject.toml`, `setup.py` | `pip-tools` or `poetry`            |
| **Docker**        | Docker Hub / Nexus | `Dockerfile`                                     | Docker Hub API / Nexus REST API    |
| **Java (Maven)**  | Maven              | `pom.xml`                                        | `mvn versions:use-latest-versions` |
| **Java (Gradle)** | Gradle             | `build.gradle`, `build.gradle.kts`               | `gradle dependencyUpdates`         |
| **Go**            | Go Modules         | `go.mod`                                         | `go get -u`                        |
| **Rust**          | Cargo              | `Cargo.toml`                                     | `cargo update`                     |

## 📋 Prerequisites

### Global Requirements
- `bash` 4.0+
- `git`
- `curl`
- `jq` (for JSON parsing)
- GitHub CLI (`gh`) - optional for PR automation

### Language-Specific Requirements

| Language    | Requirements                                                                           |
| ----------- | -------------------------------------------------------------------------------------- |
| **Node.js** | Node.js 14+, npm 6+, `npm-check-updates` (install: `npm install -g npm-check-updates`) |
| **Python**  | Python 3.7+, `pip`, `pip-tools`, `poetry` (optional)                                   |
| **Docker**  | Docker Engine                                                                          |
| **Java**    | JDK 11+, Maven 3.6+ (for Maven), Gradle 6+ (for Gradle)                                |
| **Go**      | Go 1.16+                                                                               |
| **Rust**    | Rustup and Cargo                                                                       |

### Security Tools (Optional)
- `pip-audit` - Install: `pip install pip-audit` (Python)
- `cargo audit` - Install: `cargo install cargo-audit` (Rust)
- `govulncheck` - Install: `go install golang.org/x/vuln/cmd/govulncheck@latest` (Go)
- `trivy` - Download: https://github.com/aquasecurity/trivy (Docker images)
- `npm audit` - Built into npm

**Note:** `npm audit` is built-in. Other tools are auto-detected and optional.

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/DevOps-Busters/dependency-updater.git
cd dependency-updater
chmod +x dependency-updater-main.sh cli.sh
```

### 2. Run Locally
```bash
./cli.sh  # Interactive menu-driven interface
```

### 3. Setup Configuration
```bash
# Copy and customize configuration
cp .github/templates/config.example ~/.dependency-updater.config

# Key options to configure:
# - ENABLE_NODEJS, ENABLE_PYTHON, ENABLE_DOCKER, etc.
# - UPDATE_STRATEGY (patch, minor, major)
# - PARALLEL_EXECUTION (true/false)
# - CREATE_PULL_REQUEST (true/false)
```

### 4. GitHub Actions Setup (Optional)

**Add repository secrets** (Settings → Secrets and variables → Actions):

| Secret           | Required | Purpose                                      |
| ---------------- | -------- | -------------------------------------------- |
| `TOKEN`          | Yes      | GitHub PAT with `repo` and `workflow` scopes |
| `NEXUS_URL`      | No       | Enterprise Nexus server URL                  |
| `NEXUS_USER`     | No       | Nexus username (if auth required)            |
| `NEXUS_PASSWORD` | No       | Nexus API token (if auth required)           |

The workflow runs automatically **every Monday at midnight UTC** (customizable in `.github/workflows/auto-update.yaml`)

---

## 🐳 Docker Registry Support

**Docker Hub (Automatic):**
```dockerfile
FROM ubuntu:22.04
FROM node:18
# ↓ Auto-updates to latest versions
```

**Enterprise Nexus:**
```dockerfile
FROM nexus.company.com:5000/internal/java:11
# ↓ Auto-updates from your Nexus repository
```

**Mixed Registries (Both):**
```dockerfile
FROM ubuntu:22.04                           # Docker Hub (auto-updated)
FROM nexus.company.com:5000/custom:v1.0    # Nexus (auto-updated)
```

Detection and updates happen automatically based on registry type.

---

## 🎮 Interactive CLI

Launch the interactive menu-driven interface:

```bash
./cli.sh
```

**Main Menu:**
```
1) Run full update (all languages)
2) Select languages to update
3) Run in DRY-RUN mode (preview changes)
4) View configuration
5) Update configuration
6) Security audit only (no updates)
7) Generate dependency report
8) Exit
```

**Dry-Run Mode:** Preview changes without applying them (option 3).

---

## ⚙️ Configuration

### Configuration File
Create `~/.dependency-updater.config` with your preferences. Example:

```bash
# Language support
ENABLE_NODEJS=true
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=false
ENABLE_GO=false
ENABLE_RUST=false

# Update strategy: patch, minor, or major
UPDATE_STRATEGY=minor

# Features
RUN_TESTS=true
RUN_SECURITY_AUDIT=true
AUTO_COMMIT=true
CREATE_PULL_REQUEST=true

# Performance
PARALLEL_EXECUTION=true
MAX_PARALLEL_JOBS=4

# Git
GIT_BRANCH_PREFIX=dependency-updates
GIT_COMMIT_MESSAGE=chore: update dependencies

# Docker
DOCKER_REGISTRIES=docker-hub
NEXUS_ENABLED=false
# NEXUS_URL=https://nexus.company.com
# NEXUS_USER=username
# NEXUS_PASSWORD=token

# Monorepo
MONOREPO_ENABLED=false
# MONOREPO_PATHS=packages/*,services/*

# Reports
GENERATE_REPORTS=true
REPORT_FORMATS=json,csv,md,sbom

# Team
DEFAULT_REVIEWERS=team-leads
```

### Team Configuration Examples

**Frontend Team (Node.js + Docker):**
```bash
ENABLE_NODEJS=true
ENABLE_DOCKER=true
UPDATE_STRATEGY=minor
PARALLEL_EXECUTION=true
RUN_SECURITY_AUDIT=true
CREATE_PULL_REQUEST=true
DEFAULT_REVIEWERS=frontend-leads,devops-team
```

**Backend Team (Python + Java + Docker):**
```bash
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=true
UPDATE_STRATEGY=minor
PARALLEL_EXECUTION=true
RUN_SECURITY_AUDIT=true
DEFAULT_REVIEWERS=backend-leads
```

**Full-Stack Team (All Languages):**
```bash
ENABLE_NODEJS=true
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=true
ENABLE_GO=true
ENABLE_RUST=true
PARALLEL_EXECUTION=true
GENERATE_REPORTS=true
DEFAULT_REVIEWERS=platform-team
```

See `.github/templates/config.example` for complete options.

---

## 🔒 Security Features

Each language module includes automated security scanning:

| Language | Tool          | Installation                                          |
| -------- | ------------- | ----------------------------------------------------- |
| Node.js  | `npm audit`   | Built-in                                              |
| Python   | `pip-audit`   | `pip install pip-audit`                               |
| Docker   | `trivy`       | https://github.com/aquasecurity/trivy                 |
| Java     | Maven/Gradle  | Built-in                                              |
| Go       | `govulncheck` | `go install golang.org/x/vuln/cmd/govulncheck@latest` |
| Rust     | `cargo audit` | `cargo install cargo-audit`                           |

Run security audit only:
```bash
./cli.sh
# Select option 6: "Security audit only"
```

---

## ⚡ Key Features

- ✅ **Parallel Execution** - 3-5x faster execution via concurrent updates
- ✅ **Dry-Run Mode** - Preview changes before applying (CLI option 3)
- ✅ **Monorepo Support** - npm workspaces, Lerna, Go workspaces
- ✅ **Conflict Resolution** - Auto-detect and resolve dependency conflicts
- ✅ **PR Enhancement** - Auto-labels, language tags, reviewer assignment
- ✅ **Dependency Reports** - Generate JSON, CSV, SBOM, and Markdown reports
- ✅ **Comprehensive Logging** - All operations timestamped and logged
- ✅ **Error Resilience** - Graceful handling with detailed messages

---

## 📊 Dependency Reports

Generate comprehensive inventory reports with:

```bash
./cli.sh
# Select option 7: "Generate dependency report"
```

**Report Formats:**
- **JSON** - Machine-readable inventory
- **CSV** - Spreadsheet-friendly format
- **SBOM** - CycloneDX Software Bill of Materials
- **Markdown** - Human-readable documentation

Reports show project inventory, dependency counts, and more.

---

## 📁 Project Structure

```
dependency-updater/
├── dependency-updater-main.sh        # Main orchestrator
├── cli.sh                             # Interactive CLI
├── README.md                          # Documentation (you are here)
├── QUICKSTART.sh                      # Quick start script
├── template.json                      # Template config
├── modules/
│   ├── nodejs.sh                      # Node.js/npm module
│   ├── python.sh                      # Python/pip/poetry module
│   ├── docker.sh                      # Docker Hub & Nexus module
│   ├── java.sh                        # Java/Maven/Gradle module
│   ├── go.sh                          # Go modules
│   ├── rust.sh                        # Rust/Cargo module
│   ├── audit.sh                       # Security audits
│   ├── reports.sh                     # Report generation
│   ├── config.sh                      # Config management
│   ├── pr-enhance.sh                  # PR labels & metadata
│   └── monorepo.sh                    # Monorepo & conflicts
├── .github/
│   ├── templates/
│   │   └── config.example             # Configuration template
│   └── workflows/
│       └── auto-update.yaml           # GitHub Actions workflow
└── .gitignore
```

---

## 🚀 Usage Examples

**Full Update (All Languages):**
```bash
./cli.sh
# Select option 1
```

**Select Specific Languages:**
```bash
./cli.sh
# Select option 2, then choose languages
```

**Preview Changes (Dry-Run):**
```bash
./cli.sh
# Select option 3
```

**Security Audit Only:**
```bash
./cli.sh
# Select option 6
```

**Generate Reports:**
```bash
./cli.sh
# Select option 7
```

**Using GitHub Actions:**
- Runs every Monday at midnight UTC (customizable)
- Can be triggered manually from Actions tab
- Requires `TOKEN` secret minimum

---

## ❓ Common Issues

| Issue                           | Solution                                               |
| ------------------------------- | ------------------------------------------------------ |
| npm-check-updates not installed | `npm install -g npm-check-updates`                     |
| pip-audit not found             | `pip install pip-audit`                                |
| cargo-audit not found           | `cargo install cargo-audit`                            |
| GitHub CLI not found            | Install from https://cli.github.com                    |
| "No changes detected"           | Normal - dependencies already up-to-date               |
| Failed to create PR             | Verify `TOKEN` secret has `repo` and `workflow` scopes |
| Parallel execution slow         | Set `PARALLEL_EXECUTION=false` in config               |

---

## 📖 How to Use as a GitHub Template

When using this repository as a GitHub template:

1. Click **"Use this template"** button
2. Create your new repository
3. Clone locally: `git clone <your-repo-url>`
4. Make scripts executable: `chmod +x dependency-updater-main.sh cli.sh`
5. Customize config: `cp .github/templates/config.example ~/.dependency-updater.config`
6. Add secrets: Go to Settings → Secrets and variables → Actions
7. Test locally: `./cli.sh`
8. Customize workflow: Edit `.github/workflows/auto-update.yaml`

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🤝 Contributing

Contributions welcome! Submit issues or pull requests on GitHub.

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.
