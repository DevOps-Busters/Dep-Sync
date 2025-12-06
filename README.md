# Dep-Sync

**Automated dependency updater** for Node.js, Python, Docker, and Java projects with security audits, parallel execution, and GitHub Actions.

> 🔒 **Safety First**: Creates backup branches and runs tests after updates.

---

## 🎯 Supported Languages

| Language | Package Manager | Detection | Update Method |
|----------|----------------|-----------|---------------|
| **Node.js** | npm | `package.json` | `npm-check-updates` |
| **Python** | pip / Poetry | `requirements.txt`, `pyproject.toml` | `pip-tools` / `poetry` |
| **Docker** | Docker Hub / Nexus | `Dockerfile` | Docker Hub API |
| **Java** | Maven / Gradle | `pom.xml`, `build.gradle` | `mvn versions:*` |

---

## 🚀 Quick Start

```bash
git clone https://github.com/DevOps-Busters/Dep-Sync.git
cd Dep-Sync
chmod +x *.sh modules/*.sh

# Interactive CLI
./cli.sh

# Or run directly
./dependency-updater-main.sh
```

---

## 📋 Prerequisites

**Required:**
- `bash` 4.0+, `git`, `curl`, `jq`

**Language-Specific:**

| Language | Requirements |
|----------|-------------|
| Node.js | Node 18+, `npm i -g npm-check-updates` |
| Python | Python 3.8+, `pip install pip-tools pip-audit` |
| Docker | Docker Engine |
| Java | JDK 11+, Maven 3.6+ or Gradle 7+ |

---

## 🎮 Interactive CLI

```bash
./cli.sh
```

```
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

```bash
cp .github/templates/config.example ~/.depsync.config
```

**Key Settings:**

```bash
# Languages
ENABLE_NODEJS=true
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=false

# Safety
RUN_TESTS=true
RUN_SECURITY_AUDIT=true
CREATE_BACKUP_BRANCH=true

# Strategy: patch, minor, major
UPDATE_STRATEGY=minor

# Git
AUTO_COMMIT=true
CREATE_PULL_REQUEST=true
```

---

## 🔒 Safety Features

1. **Backup Branches** - Automatic backup before changes
2. **Test Verification** - Runs tests after updates
3. **Security Audits** - Vulnerability scanning
4. **Dry-Run Mode** - Preview without applying
5. **Minor Updates** - Safer version bumps by default

---

## 📊 Reports

Generate dependency inventory:

```bash
./cli.sh  # Option 7
```

**Formats:** JSON, CSV, Markdown, SBOM (CycloneDX)

---

## 🔄 GitHub Actions

Automated workflow runs on schedule or manual trigger.

**Setup Variables** (Settings → Variables → Actions):

| Variable | Description |
|----------|-------------|
| `ENABLE_NODEJS` | Enable Node.js (default: true) |
| `ENABLE_PYTHON` | Enable Python (default: true) |
| `ENABLE_DOCKER` | Enable Docker (default: true) |
| `GIT_USER_NAME` | Git author name |
| `GIT_USER_EMAIL` | Git author email |

**Secrets** (for private registries):

| Secret | Description |
|--------|-------------|
| `NEXUS_URL` | Nexus registry URL |
| `NEXUS_USER` | Nexus username |
| `NEXUS_PASSWORD` | Nexus password |

---

## 📁 Project Structure

```
Dep-Sync/
├── dependency-updater-main.sh   # Main orchestrator
├── cli.sh                       # Interactive CLI
├── lib/
│   └── common.sh                # Shared utilities
├── modules/
│   ├── nodejs.sh                # Node.js/npm
│   ├── python.sh                # Python/pip/Poetry
│   ├── docker.sh                # Docker Hub & Nexus
│   ├── java.sh                  # Maven/Gradle
│   ├── audit.sh                 # Security audits
│   ├── config.sh                # Configuration
│   ├── reports.sh               # Report generation
│   ├── monorepo.sh              # Monorepo support
│   └── pr-enhance.sh            # PR enhancements
├── .github/
│   ├── workflows/
│   │   └── auto-update.yaml     # GitHub Actions
│   └── templates/
│       └── config.example       # Config template
└── README.md
```

---

## 🛠️ Usage

```bash
# Full update
./dependency-updater-main.sh

# Preview changes
./cli.sh  # Option 3

# Security audit only
./cli.sh  # Option 6

# Selective update
./cli.sh  # Option 2
```

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| `ncu: command not found` | `npm i -g npm-check-updates` |
| `pip-audit not found` | `pip install pip-audit` |
| `Permission denied` | `chmod +x *.sh modules/*.sh` |
| `Push failed` | Check git credentials |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

---

## 📄 License

MIT License
