# Dep-Sync: Automated Dependency Management for Modern Projects

<div align="center">

[![Node.js Version](https://img.shields.io/badge/Node.js-14%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)

**A production-grade, multi-language dependency updater and security auditor**

[Quick Start](#quick-start)  [Documentation](#documentation)  [CLI Commands](#cli-commands)  [Architecture](#architecture)  [Contributing](#contributing)

</div>

---

## Overview

**Dep-Sync** is an enterprise-grade automation tool designed to keep dependencies up-to-date and secure across multiple language ecosystems. Built with TypeScript and following industry best practices, it provides a unified interface for dependency management across Node.js, Python, Docker, and Java projects.

### Key Features

 **Multi-Language Support**
- Node.js/npm - Dependency updates via npm-check-updates
- Python - Multiple package managers (pip, poetry, setup.py)
- Docker - Base image updates and vulnerability scanning
- Java - Maven and Gradle support

 **Security First**
- npm audit for Node.js vulnerabilities
- pip-audit and safety for Python
- Trivy for container scanning
- OWASP dependency-check for Java

 **Comprehensive Testing**
- Automatic post-update test execution
- Language-specific test runner detection
- Detailed test report generation

 **Git Integration**
- Automatic branch creation
- Commit with versioning
- Pull request generation (GitHub CLI)
- Change tracking and reporting

 **Enterprise Architecture**
- Domain-Driven Design (DDD)
- Result/Response pattern for error handling
- Railway-oriented programming principles
- Comprehensive validation layer
- Custom error types with recovery strategies

---

## Quick Start

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/apoorv-katiyar/Dep-Sync.git
cd Dep-Sync

# Install dependencies
npm install

# Build the project
npm run build

# Global installation (optional)
npm install -g .
\`\`\`

### Basic Usage

\`\`\`bash
# Scan project for supported languages
dep-sync detect

# View current configuration
dep-sync status

# Perform a dry-run update (preview changes)
dep-sync update --dry-run

# Execute full update cycle
dep-sync update --strategy minor
\`\`\`

---

## CLI Commands

### \`dep-sync update [options]\`

Perform complete dependency update cycle.

**Options:**
\`\`\`
-s, --strategy <strategy>   patch|minor|major (default: minor)
--skip-tests               Skip tests after update
--skip-audit               Skip security audit
--no-commit                Don'"'"'t commit changes
--create-pr                Create pull request
--dry-run                  Preview without modifying files
-v, --verbose              Enable verbose logging
\`\`\`

### \`dep-sync detect\`

Scan and detect project languages.

### \`dep-sync test\`

Run tests for all detected languages.

### \`dep-sync audit\`

Perform security audits.

### \`dep-sync status\`

Display configuration and tool status.

### \`dep-sync config [options]\`

Manage configuration.

---

## Configuration

Configuration via \`.env\` file:

\`\`\`env
# Languages
ENABLE_NODEJS=true
ENABLE_PYTHON=true
ENABLE_DOCKER=true
ENABLE_JAVA=false

# Strategy
UPDATE_STRATEGY=minor

# Options
RUN_TESTS=true
RUN_SECURITY_AUDIT=true
AUTO_COMMIT=true
CREATE_PULL_REQUEST=false

# Git
GIT_BRANCH_PREFIX=deps/update
GIT_COMMIT_MESSAGE=chore(deps): update dependencies

# Performance
PARALLEL_EXECUTION=true
MAX_PARALLEL_JOBS=4
\`\`\`

---

## Architecture

### Layered Design

\`\`\`

   CLI Presentation Layer            

   Application Services              

   Domain Layer                      

   Infrastructure Layer              

   Common Utilities                  

\`\`\`

### Design Patterns

1. **Domain-Driven Design (DDD)** - Business logic in domain layer
2. **Result Pattern** - Railway-oriented programming for error handling
3. **Dependency Injection** - Loose coupling and testability
4. **Factory Pattern** - Language handler creation
5. **Singleton Pattern** - Logger and Shell instances

### Error Handling

Custom error types with semantic meaning:

\`\`\`typescript
// Validation errors (400)
throw new ValidationError('"'"'Invalid input'"'"');

// Not found errors (404)
throw new NotFoundError('"'"'Language'"'"', '"'"'rust'"'"');

// Conflict errors (409)
throw new ConflictError('"'"'Uncommitted changes found'"'"');

// Command errors (500)
throw new CommandExecutionError('"'"'npm install'"'"', exitCode, stderr);
\`\`\`

---

## Project Structure

\`\`\`
src/
 cli.ts                  # CLI entry point
 index.ts                # Exports
 config/                 # Configuration
 constants/              # Application constants
 domain/                 # Business entities
 errors/                 # Custom errors
 validators/             # Input validation
 common/                 # Result pattern
 utils/                  # Utilities (Logger, Shell)
 languages/              # Language handlers
 managers/               # Manager services
\`\`\`

---

## Supported Languages

| Language | Package Manager | Test Runner | Audit Tool |
|----------|-----------------|-------------|------------|
| Node.js | npm | npm test | npm audit |
| Python | pip/poetry | pytest/unittest | pip-audit/safety |
| Docker | - | docker build | Trivy |
| Java | Maven/Gradle | mvn test / gradle test | OWASP check |

---

## Development

### Build & Run

\`\`\`bash
npm run build         # Build TypeScript
npm run dev          # Development mode
npm run lint         # Check code quality
npm run lint:fix     # Fix linting errors
npm run format       # Format code
\`\`\`

### Code Quality

Dep-Sync uses:
- **ESLint** - Code quality
- **Prettier** - Formatting
- **TypeScript** - Strict mode type checking

---

## Troubleshooting

### Tool Not Found

\`\`\`bash
# Install missing tools
# Git: https://git-scm.com/download
# Node: https://nodejs.org
# Docker: https://docs.docker.com/get-docker/
\`\`\`

### Debug Logging

\`\`\`bash
DEBUG=true npm run dev -- detect
\`\`\`

---

## Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/amazing\`)
3. Commit changes (\`git commit -am '"'"'feat: add feature'"'"'\`)
4. Push to branch (\`git push origin feature/amazing\`)
5. Open a Pull Request

### Code Standards

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Run \`npm run lint:fix\` before committing
- Ensure tests pass
- Update documentation

---

## Performance

Typical execution times:

| Operation | Duration |
|-----------|----------|
| Detect | 100-500ms |
| Update (npm) | 5-30s |
| Test | 10-60s |
| Audit | 2-5s |
| Full cycle | 20-120s |

---

## Security

### Best Practices

1. Review all updates before merging
2. Test thoroughly after updates
3. Review audit reports
4. Use separate branches per language
5. Pin major versions if needed

### Report Security Issues

Found a vulnerability? Please report privately to: security@dep-sync.local

---

## Roadmap

### Upcoming Features

- [ ] Web UI dashboard
- [ ] REST API
- [ ] Monorepo improvements
- [ ] Custom hooks/plugins
- [ ] Scheduled automation
- [ ] Slack/Teams notifications
- [ ] Docker image
- [ ] Kubernetes Operator

---

## License

MIT  2025 - DevOps-Busters

---

## Support

- **Issues**: [GitHub Issues](https://github.com/apoorv-katiyar/Dep-Sync/issues)
- **Discussions**: [GitHub Discussions](https://github.com/apoorv-katiyar/Dep-Sync/discussions)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

Made with  by the DevOps-Busters team

**Thank you for using Dep-Sync!**

</div>
