# Dependency Updater - GitHub Template Guide

Welcome! You've created a new repository from the Dependency Updater template. This guide will help you get started quickly.

## 🎯 What Is This Template?

The Dependency Updater is an automated tool that:
- Scans your repository for dependencies across 7 programming languages
- Updates all dependencies automatically
- Runs security audits
- Generates comprehensive reports
- Creates pull requests with automated labels
- Works with both public and enterprise registries

## 🚀 Initial Setup (5 minutes)

### Step 1: Clone and Prepare
```bash
git clone https://github.com/YOUR-ORG/YOUR-REPO.git
cd YOUR-REPO
chmod +x dependency-updater-main.sh cli.sh
```

### Step 2: View Quick Start
```bash
bash QUICKSTART.sh
```

### Step 3: Configure for Your Project

**Option A: Using Interactive CLI (Recommended)**
```bash
./cli.sh
# Navigate to: Option 5 "Update configuration"
```

**Option B: Direct Config Edit**
```bash
nano ~/.dependency-updater.config
# Or create new one:
cp .github/templates/config.example ~/.dependency-updater.config
nano ~/.dependency-updater.config
```

**Key Settings to Customize:**
```bash
# Languages your project uses
ENABLE_NODEJS=true           # Set to false if not used
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=false
ENABLE_GO=false
ENABLE_RUST=false

# Update frequency
UPDATE_STRATEGY=minor        # patch, minor, or major

# Automation
AUTO_COMMIT=true
CREATE_PULL_REQUEST=true
RUN_SECURITY_AUDIT=true

# Performance
PARALLEL_EXECUTION=true
MAX_PARALLEL_JOBS=4
```

### Step 4: Set Up GitHub Secrets (Optional - For Enterprise Registries)

If your team uses Enterprise Docker registries (Nexus, Artifactory):

1. Go to: **Settings → Secrets and variables → Actions**
2. Add these secrets:
   - `NEXUS_URL`: Your Nexus server URL
   - `NEXUS_USER`: Your Nexus username
   - `NEXUS_PASSWORD`: Your Nexus API token

### Step 5: Customize GitHub Actions Workflow

Edit `.github/workflows/auto-update.yaml`:

```yaml
# Change the schedule (default: every Monday at midnight UTC)
schedule:
  - cron: '0 0 * * 1'    # Monday at 00:00 UTC

# Or trigger manually:
# Go to Actions tab → "Auto Update Dependencies" → Run workflow
```

## 📖 Usage

### Interactive CLI (Recommended for First Time)
```bash
./cli.sh
```
**Menu Options:**
1. Full update (all languages)
2. Select specific languages
3. Dry-run mode (preview without changes)
4. View config
5. Edit config
6. Security audit only
7. Generate reports
8. Exit

### Automated Full Update
```bash
./dependency-updater-main.sh
```

### Dry-Run (Preview Changes)
```bash
./cli.sh
# Select: 3 - Run in DRY-RUN mode
```

### Generate Reports
```bash
./cli.sh
# Select: 7 - Generate dependency report
```

Reports generated:
- `dependency-report.json` - Machine-readable
- `dependency-report.csv` - Spreadsheet format
- `sbom.json` - CycloneDX format
- `dependency-report.md` - Human-readable

## 🔧 Customization Examples

### Example 1: Only Update Node.js Dependencies
```bash
./cli.sh
# Select: 2 - Select languages
# Choose: Node.js only
```

### Example 2: Security Audit Without Updates
```bash
./cli.sh
# Select: 6 - Security audit only
```

### Example 3: Preview Changes (Dry-Run)
```bash
./cli.sh
# Select: 3 - Run in DRY-RUN mode
# See what would change without applying
```

### Example 4: Monorepo Project
If your project uses workspaces (npm, Lerna, Go workspaces):
```bash
./dependency-updater-main.sh
# Script automatically detects and updates all workspaces
```

## 🔒 Security Features

All language modules include security audits:

| Language | Tool          | Purpose                              |
| -------- | ------------- | ------------------------------------ |
| Node.js  | `npm audit`   | Find vulnerabilities in npm packages |
| Python   | `pip-audit`   | Scan Python package vulnerabilities  |
| Docker   | `trivy`       | Scan container images for CVEs       |
| Java     | Maven/Gradle  | Check for vulnerable dependencies    |
| Go       | `govulncheck` | Detect Go module vulnerabilities     |
| Rust     | `cargo audit` | Check crate vulnerabilities          |

**Install security tools:**
```bash
npm install -g npm-check-updates
pip install pip-audit
cargo install cargo-audit
go install golang.org/x/vuln/cmd/govulncheck@latest
# Download trivy from: https://github.com/aquasecurity/trivy
```

## 🏗️ Project Structure

```
your-repo/
├── dependency-updater-main.sh          Main orchestrator (parallel execution)
├── cli.sh                              Interactive CLI
├── README.md                           Full documentation
├── QUICKSTART.sh                       Quick start guide
├── TEMPLATE.md                         This template guide
├── template.json                       Template metadata
├── modules/
│   ├── nodejs.sh                       Node.js/npm
│   ├── python.sh                       Python/pip/poetry
│   ├── docker.sh                       Docker Hub & Nexus
│   ├── java.sh                         Java/Maven/Gradle
│   ├── go.sh                           Go modules
│   ├── rust.sh                         Rust/Cargo
│   ├── audit.sh                        Security audits
│   ├── reports.sh                      Report generation
│   ├── config.sh                       Configuration
│   ├── pr-enhance.sh                   PR automation
│   └── monorepo.sh                     Monorepo support
├── .github/
│   └── workflows/
│       └── auto-update.yaml            GitHub Actions workflow
└── .gitignore
```

## 🤖 GitHub Actions Automation

The template includes a ready-to-use GitHub Actions workflow that runs automatically:

**Schedule:** Every Monday at midnight UTC (customizable)

**What it does:**
1. Detects your project's dependencies
2. Updates all supported languages
3. Runs security audits
4. Runs tests for each language
5. Creates a pull request with:
   - Auto-labels (dependencies, language tags, priority)
   - Detailed changelog
   - Test results
   - Security audit summary

**Manual Trigger:**
1. Go to your repo → **Actions** tab
2. Select: **"Auto Update Dependencies"**
3. Click: **"Run workflow"**

## 📊 Generated Reports

After running updates, you get:

**JSON Report** (`dependency-report.json`)
```json
{
  "projects": [
    {"type": "nodejs", "dependencies": 45},
    {"type": "python", "dependencies": 28}
  ]
}
```

**CSV Report** (`dependency-report.csv`)
- Easy to import into spreadsheets
- Track dependencies by language

**SBOM** (`sbom.json`)
- CycloneDX format
- Share with security teams
- Compliance documentation

**Markdown Report** (`dependency-report.md`)
- Human-readable summary
- Include in documentation

## 🚨 Troubleshooting

### "Command not found" errors
Make scripts executable:
```bash
chmod +x dependency-updater-main.sh cli.sh
```

### Security tools not detected
Install missing tools:
```bash
pip install pip-audit
cargo install cargo-audit
go install golang.org/x/vuln/cmd/govulncheck@latest
```

### GitHub CLI not working for PR creation
Install GitHub CLI:
```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo apt-get update
sudo apt-get install gh
```

### Parallel execution too slow
Disable parallel mode in config:
```bash
PARALLEL_EXECUTION=false
```

## 💡 Team Best Practices

### 1. Review PRs Before Merging
Always review the generated PRs:
- Check for breaking changes
- Verify security audit results
- Review test results

### 2. Use Dry-Run Mode First
Test updates without committing:
```bash
./cli.sh → Option 3: Dry-run mode
```

### 3. Schedule Regular Updates
Use GitHub Actions to run on schedule:
- Weekly: `0 0 * * 1` (Monday midnight)
- Bi-weekly: `0 0 1,15 * *` (1st & 15th)
- Monthly: `0 0 1 * *` (1st of month)

### 4. Configure by Project Type
Set `ENABLE_*=false` for unused languages to speed up execution

### 5. Monitor Security Audits
Review security reports regularly:
```bash
./cli.sh → Option 6: Security audit only
```

## 📞 Support & Contribution

For issues or feature requests:
1. Check `README.md` for full documentation
2. Review `QUICKSTART.sh` for examples
3. Open an issue on GitHub

## 📄 Next Steps

1. ✅ Configure your project settings
2. ✅ Add GitHub secrets (if using enterprise registries)
3. ✅ Customize workflow schedule
4. ✅ Run first update: `./cli.sh`
5. ✅ Review generated reports
6. ✅ Enable GitHub Actions automation

Happy updating! 🚀
