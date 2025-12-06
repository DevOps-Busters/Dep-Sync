<p align="center">
  <img src="https://img.shields.io/badge/Dep--Sync-v2.0-blue?style=for-the-badge&logo=github" alt="Version">
  <img src="https://img.shields.io/badge/Shell-Bash-green?style=for-the-badge&logo=gnu-bash" alt="Shell">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
</p>

<h1 align="center">🔄 Dep-Sync</h1>

<p align="center">
  <strong>Automated Dependency Updater</strong><br>
  <em>Safe, parallel dependency updates for Node.js, Python, Docker & Java</em>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-configuration">Configuration</a>
</p>

---

## 🔒 Safety First

> Dep-Sync creates **backup branches** before changes and runs **tests after updates** to ensure your code doesn't break.

---

## 🎯 Supported Languages

| Language | Package Manager | Detection | Update Method | Security Tool |
|:--------:|:---------------:|:---------:|:-------------:|:-------------:|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20"/> **Node.js** | npm | `package.json` | `npm-check-updates` | `npm audit` |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="20"/> **Python** | pip / Poetry | `requirements.txt` | `pip-tools` | `pip-audit` |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="20"/> **Docker** | Docker Hub | `Dockerfile` | Docker Hub API | `trivy` |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" width="20"/> **Java** | Maven / Gradle | `pom.xml` | `mvn versions:*` | OWASP |

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/DevOps-Busters/Dep-Sync.git
cd Dep-Sync

# Make scripts executable
chmod +x *.sh modules/*.sh

# Run interactive CLI
./cli.sh

# Or run directly
./dependency-updater-main.sh
```

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛡️ Safety
- ✅ Backup branches before changes
- ✅ Test verification after updates
- ✅ Security vulnerability scanning
- ✅ Dry-run preview mode
- ✅ Minor updates by default

</td>
<td width="50%">

### ⚡ Performance
- ✅ Parallel execution
- ✅ Configurable job limits
- ✅ Smart project detection
- ✅ Incremental updates
- ✅ Caching support

</td>
</tr>
<tr>
<td width="50%">

### 📊 Reporting
- ✅ JSON dependency report
- ✅ CSV export
- ✅ SBOM (CycloneDX)
- ✅ Markdown summaries
- ✅ Security audit reports

</td>
<td width="50%">

### 🔄 Automation
- ✅ GitHub Actions workflow
- ✅ Scheduled updates
- ✅ Auto PR creation
- ✅ Label management
- ✅ Reviewer assignment

</td>
</tr>
</table>

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DEP-SYNC SYSTEM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ENTRY POINTS              SHARED LIBRARY         CONFIGURATION   │
│  ┌─────────────┐           ┌─────────────┐       ┌─────────────┐   │
│  │  cli.sh     │──────────▶│lib/common.sh│◀──────│ ~/.depsync  │   │
│  │  main.sh    │           │             │       │  .config    │   │
│  │  Actions    │           │ • Colors    │       │             │   │
│  └─────────────┘           │ • Logging   │       │ Environment │   │
│                            │ • Defaults  │       │ Variables   │   │
│                            └──────┬──────┘       └─────────────┘   │
│                                   │                                 │
│                                   ▼                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       MODULE LAYER                            │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │                                                               │  │
│  │  LANGUAGE MODULES              UTILITY MODULES                │  │
│  │  ┌──────────────────┐          ┌──────────────────┐          │  │
│  │  │ nodejs.sh        │          │ audit.sh         │          │  │
│  │  │ python.sh        │          │ reports.sh       │          │  │
│  │  │ docker.sh        │          │ config.sh        │          │  │
│  │  │ java.sh          │          │ monorepo.sh      │          │  │
│  │  └──────────────────┘          │ pr-enhance.sh    │          │  │
│  │                                └──────────────────┘          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                   │                                 │
│                                   ▼                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       OUTPUT LAYER                            │  │
│  │                                                               │  │
│  │  📁 Git Branch    📝 Changelog    📊 Reports    🔗 Pull Request│  │
│  │  📋 Logs          🔒 Audit Report                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Module Dependency Graph

```
                         ┌─────────────────┐
                         │  lib/common.sh  │
                         │   (Foundation)  │
                         └────────┬────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
  │ main.sh         │   │ cli.sh          │   │ GitHub Actions  │
  │ (Direct)        │   │ (Interactive)   │   │ (Automated)     │
  └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 │
                                 ▼
           ┌─────────────────────────────────────────────┐
           │              MODULES LAYER                   │
           ├─────────────────────────────────────────────┤
           │                                             │
           │  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
           │  │config.sh│─▶│audit.sh │─▶│ reports.sh  │ │
           │  └─────────┘  └────┬────┘  └─────────────┘ │
           │                    │                        │
           │    ┌───────────────┼───────────────┐       │
           │    ▼               ▼               ▼       │
           │ ┌────────┐   ┌──────────┐   ┌──────────┐  │
           │ │nodejs  │   │ python   │   │ docker   │  │
           │ │.sh     │   │ .sh      │   │ .sh      │  │
           │ └────────┘   └──────────┘   └──────────┘  │
           │                                           │
           │ ┌────────┐   ┌──────────┐   ┌──────────┐ │
           │ │java.sh │   │monorepo  │   │pr-enhance│ │
           │ └────────┘   │.sh       │   │.sh       │ │
           │              └──────────┘   └──────────┘ │
           └─────────────────────────────────────────────┘
```

---

## 🔄 Execution Flowchart

```
┌─────────────┐
│    START    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐     ┌──────────────────┐
│   CLI Mode?      │────▶│  Show Menu       │
│   ./cli.sh       │     │  (Options 1-9)   │
└──────────────────┘     └────────┬─────────┘
       │                          │
       ▼                          │
┌──────────────────┐              │
│  Direct Mode     │◀─────────────┘
│  ./main.sh       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                    INITIALIZATION PHASE                       │
├──────────────────────────────────────────────────────────────┤
│  1. Load Configuration (~/.depsync.config)                   │
│  2. Load Shared Library (lib/common.sh)                      │
│  3. Load All Modules (language + utility)                    │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    DETECTION PHASE                            │
├──────────────────────────────────────────────────────────────┤
│  For each language (nodejs, python, docker, java):           │
│  • Check if enabled in config                                │
│  • Run detect_*() function                                   │
│  • Build list of projects to update                          │
└────────────────────────────┬─────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌─────────────────┐          ┌─────────────────┐
     │ Projects Found  │          │  No Projects    │
     └────────┬────────┘          │  → Exit         │
              │                   └─────────────────┘
              ▼
┌──────────────────────────────────────────────────────────────┐
│                    SAFETY PHASE                               │
├──────────────────────────────────────────────────────────────┤
│  • Create backup branch (backup/main-YYYYMMDD-HHMMSS)        │
│  • Quick security pre-check                                  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    UPDATE PHASE                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────┐    ┌────────────────────┐           │
│  │ PARALLEL MODE      │ OR │ SEQUENTIAL MODE    │           │
│  │ (All at once)      │    │ (One by one)       │           │
│  └─────────┬──────────┘    └─────────┬──────────┘           │
│            │                         │                       │
│            └────────────┬────────────┘                       │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FOR EACH LANGUAGE:                                   │   │
│  │                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │ 1. UPDATE   │─▶│ 2. TEST     │─▶│ 3. AUDIT    │   │   │
│  │  │ update_*()  │  │ test_*()    │  │ audit_*()   │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │         │                                             │   │
│  │         ▼                                             │   │
│  │  ┌─────────────┐                                      │   │
│  │  │ 4. CHANGELOG│                                      │   │
│  │  │ changelog_* │                                      │   │
│  │  └─────────────┘                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    REPORTING PHASE                            │
├──────────────────────────────────────────────────────────────┤
│  • Merge all changelogs                                      │
│  • Generate reports (JSON, CSV, SBOM, Markdown)              │
│  • Generate security audit report                            │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    GIT PHASE                                  │
├──────────────────────────────────────────────────────────────┤
│  • Check for changes                                         │
│  • Create branch (deps/update-TIMESTAMP)                     │
│  • Stage all changes (git add -A)                            │
│  • Commit with message                                       │
│  • Push to remote                                            │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    PR PHASE                                   │
├──────────────────────────────────────────────────────────────┤
│  • Generate PR title (with emoji)                            │
│  • Generate PR body (changes, tests, audit)                  │
│  • Add labels (dependencies, security, priority)             │
│  • Assign reviewers                                          │
│  • Create Pull Request via GitHub CLI                        │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────┐
                    │  COMPLETE   │
                    └─────────────┘
```

---

## 🔧 Module Interface

Each language module implements a **standard interface**:

| Function | Purpose | Example |
|----------|---------|---------|
| `detect_<lang>()` | Check if project exists | `detect_nodejs()` → finds `package.json` |
| `update_<lang>()` | Update dependencies | `update_python()` → runs `pip-tools` |
| `test_<lang>()` | Run project tests | `test_java()` → runs `mvn test` |
| `audit_<lang>()` | Security scan | `audit_docker()` → runs `trivy` |
| `changelog_<lang>()` | Generate changelog | Outputs markdown |

```bash
# Interface signature
detect_<lang>()                    # Returns: 0=found, 1=not found
update_<lang>(log_func, err_func)  # Returns: 0=success, 1=failure
test_<lang>(log_func)              # Returns: 0=pass, 1=fail
audit_<lang>(log_func)             # Returns: 0=clean, 1=issues
changelog_<lang>()                 # Outputs: markdown text
```

---

## 📊 Data Flow

```
INPUT                    PROCESSING                   OUTPUT
─────                    ──────────                   ──────

┌─────────────┐
│ Config File │──┐
└─────────────┘  │
                 ├──▶ LOAD CONFIG ──▶ Runtime Settings
┌─────────────┐  │
│ Environment │──┘
└─────────────┘

┌─────────────┐
│ Project     │
│ Files       │──▶ DETECT ──▶ Language List ──┐
│ • package   │                                │
│ • require   │                                │
│ • Docker    │                                │
│ • pom.xml   │                                │
└─────────────┘                                │
                                               ▼
                                         ┌──────────┐
                                         │  UPDATE  │
                                         └────┬─────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
             ┌────────────┐           ┌────────────┐           ┌────────────┐
             │   TESTS    │           │   AUDIT    │           │ CHANGELOG  │
             └─────┬──────┘           └─────┬──────┘           └─────┬──────┘
                   │                        │                        │
                   ▼                        ▼                        ▼
             ┌────────────┐           ┌────────────┐           ┌────────────┐
             │ Pass/Fail  │           │ Audit      │           │ CHANGELOG  │
             │ Results    │           │ Report.txt │           │ .md        │
             └────────────┘           └────────────┘           └────────────┘
                                                                     │
                                               ┌─────────────────────┘
                                               ▼
                                         ┌──────────┐
                                         │ REPORTS  │
                                         └────┬─────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
             ┌────────────┐           ┌────────────┐           ┌────────────┐
             │ deps.json  │           │ deps.csv   │           │ sbom.json  │
             └────────────┘           └────────────┘           └────────────┘

                                         ┌──────────┐
                                         │   GIT    │
                                         └────┬─────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │   PULL REQUEST   │
                                    │   with labels    │
                                    └──────────────────┘
```

---

## 🔐 Security Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY PIPELINE                         │
└─────────────────────────────────────────────────────────────┘

  ┌──────────────────┐
  │ 1. BACKUP        │  Create restore point
  │    BRANCH        │  backup/main-YYYYMMDD
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 2. PRE-CHECK     │  Existing vulnerabilities?
  │    SCAN          │  quick_security_check()
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 3. UPDATE        │  Minor versions (safe)
  │    DEPS          │  Respects UPDATE_STRATEGY
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 4. RUN           │  ✅ Pass → Continue
  │    TESTS         │  ⚠️ Fail → Warning
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 5. POST-UPDATE   │  Full security scan
  │    AUDIT         │  All languages
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 6. REPORT        │  security-audit-report.txt
  │    GENERATION    │  Severity breakdown
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ 7. PR WITH       │  🔒 Security label
  │    LABELS        │  High priority
  └──────────────────┘

  SEVERITY LEVELS:
  ⛔ CRITICAL → Fail (if FAIL_ON_VULNERABILITY=true)
  ⚠️ HIGH     → Warning + Label
  ℹ️ MODERATE → Info in report
  📝 LOW      → Log only
```

---

## 🎮 Interactive CLI

```bash
./cli.sh
```

```
╔══════════════════════════════════════════════════════════════╗
║              Dep-Sync - Interactive CLI v2.0                 ║
╚══════════════════════════════════════════════════════════════╝

  1) Run full update
  2) Select languages to update
  3) Dry-run (preview)
  4) View configuration
  5) Edit configuration
  6) Security audit only
  7) Generate reports
  8) Check tools
  9) Exit
```

---

## ⚙️ Configuration

### Setup

```bash
cp .github/templates/config.example ~/.depsync.config
```

### Key Settings

```bash
# ═══════════════════════════════════════════════
# LANGUAGES
# ═══════════════════════════════════════════════
ENABLE_NODEJS=true
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=false

# ═══════════════════════════════════════════════
# SAFETY (Recommended: keep enabled)
# ═══════════════════════════════════════════════
RUN_TESTS=true
RUN_SECURITY_AUDIT=true
CREATE_BACKUP_BRANCH=true

# ═══════════════════════════════════════════════
# UPDATE STRATEGY
# ═══════════════════════════════════════════════
# patch = safest (x.y.Z only)
# minor = recommended (x.Y.z)
# major = breaking possible (X.y.z)
UPDATE_STRATEGY=minor

# ═══════════════════════════════════════════════
# GIT & PR
# ═══════════════════════════════════════════════
AUTO_COMMIT=true
CREATE_PULL_REQUEST=true
GIT_BRANCH_PREFIX=deps/update

# ═══════════════════════════════════════════════
# PERFORMANCE
# ═══════════════════════════════════════════════
PARALLEL_EXECUTION=true
MAX_PARALLEL_JOBS=4
```

---

## 🔄 GitHub Actions

### Workflow Triggers

| Trigger | When |
|---------|------|
| **Schedule** | Every Monday at midnight UTC |
| **Manual** | Actions → Run workflow |

### Setup Variables

Go to **Settings → Variables → Actions**:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_NODEJS` | `true` | Enable Node.js updates |
| `ENABLE_PYTHON` | `true` | Enable Python updates |
| `ENABLE_DOCKER` | `true` | Enable Docker updates |
| `ENABLE_JAVA` | `false` | Enable Java updates |
| `GIT_USER_NAME` | `github.actor` | Git commit author |
| `GIT_USER_EMAIL` | Auto | Git commit email |

### Secrets (Private Registries)

| Secret | Description |
|--------|-------------|
| `NEXUS_URL` | Nexus registry URL |
| `NEXUS_USER` | Nexus username |
| `NEXUS_PASSWORD` | Nexus password/token |

---

## 📁 Project Structure

```
Dep-Sync/
│
├── 📄 dependency-updater-main.sh   # Main orchestrator
├── 📄 cli.sh                       # Interactive CLI
│
├── 📁 lib/
│   └── 📄 common.sh                # Shared utilities
│
├── 📁 modules/
│   ├── 📄 nodejs.sh                # Node.js/npm
│   ├── 📄 python.sh                # Python/pip/Poetry
│   ├── 📄 docker.sh                # Docker Hub & Nexus
│   ├── 📄 java.sh                  # Maven/Gradle
│   ├── 📄 audit.sh                 # Security audits
│   ├── 📄 config.sh                # Configuration
│   ├── 📄 reports.sh               # Report generation
│   ├── 📄 monorepo.sh              # Monorepo support
│   └── 📄 pr-enhance.sh            # PR enhancements
│
├── 📁 .github/
│   ├── 📁 workflows/
│   │   └── 📄 auto-update.yaml     # GitHub Actions
│   └── 📁 templates/
│       └── 📄 config.example       # Config template
│
└── 📄 README.md
```

---

## 📋 Prerequisites

### Required Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| `bash` 4.0+ | Shell | Built-in |
| `git` | Version control | `apt install git` |
| `curl` | API calls | `apt install curl` |
| `jq` | JSON parsing | `apt install jq` |

### Language-Specific

| Language | Requirements |
|----------|-------------|
| **Node.js** | Node 18+, `npm i -g npm-check-updates` |
| **Python** | Python 3.8+, `pip install pip-tools pip-audit` |
| **Docker** | Docker Engine, `trivy` (optional) |
| **Java** | JDK 11+, Maven 3.6+ or Gradle 7+ |

---

## 🛠️ Usage Examples

```bash
# Full update (all languages)
./dependency-updater-main.sh

# Interactive mode
./cli.sh

# Preview changes (dry-run)
./cli.sh  # Select option 3

# Security audit only
./cli.sh  # Select option 6

# Selective update
./cli.sh  # Select option 2

# Generate reports
./cli.sh  # Select option 7
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| `ncu: command not found` | `npm i -g npm-check-updates` |
| `pip-audit not found` | `pip install pip-audit` |
| `Permission denied` | `chmod +x *.sh modules/*.sh` |
| `No changes detected` | Dependencies are up-to-date |
| `Push failed` | Check git credentials / branch protection |
| `PR creation failed` | Run `gh auth login` |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Made with ❤️ by DevOps-Busters</strong><br>
  <em>Automate your dependency updates safely!</em>
</p>

<p align="center">
  <a href="https://github.com/DevOps-Busters/Dep-Sync/issues">Report Bug</a> •
  <a href="https://github.com/DevOps-Busters/Dep-Sync/issues">Request Feature</a>
</p>
