# Git Commit Generator

![Test](https://github.com/OsmanBzdmr/Git_Commit_Generator/actions/workflows/test.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-brightgreen)
![Version](https://img.shields.io/badge/version-1.3.2-blue)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)

AI-powered CLI tool that analyzes your `git diff` and generates clean, conventional commit messages using Groq (Llama 3.3 70B).

---

## Features

- 🤖 **Groq AI** — fast commit message generation via Llama 3.3 70B
- 🧠 **Fallback mode** — generates stat-based messages when API is unavailable
- 🏷️ **Conventional Commits** — `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`
- 🎯 **Scope support** — detects type and scope from branch names (`feat/login` → `feat(login):`)
- 🌿 **Branch-aware** — uses branch name to improve fallback type & scope detection
- 📝 **Custom messages** — `--message` / `-m` flag bypasses AI entirely
- 📋 **Cross-platform clipboard** — auto-copies result on Windows, macOS and Linux
- 💾 **Local history** — stores generated messages in SQLite, viewable with `--history`
- 🚀 **Git integration** — stage, commit, and push in one command

---

## Installation

**Requirements:** Node.js 18+, [Groq API key](https://console.groq.com)

```bash
git clone https://github.com/OsmanBzdmr/Git_Commit_Generator.git
cd Git_Commit_Generator
npm install
cp .env.example .env
# Add your GROQ_API_KEY to .env
```

**Link globally** so you can use it in any repo:

```bash
npm link
```

---

## Usage

```bash
# Generate message from piped diff
git diff | git-commit-gen

# Stage all + commit
git-commit-gen --commit

# Stage all + commit + push
git-commit-gen --all

# View last 50 generated messages
git-commit-gen --history
```

| Flag | Short | Description |
|------|-------|-------------|
| _(none)_ | — | Reads diff from stdin, prints message, copies to clipboard |
| `--commit` | `-c` | Stages all changes, generates message, commits |
| `--all` | `-a` | Stages all changes, commits, and pushes |
| `--message` | `-m` | Use a custom commit message (skips AI) |
| `--dry-run` | — | Preview the message without saving or committing |
| `--version` | `-v` | Show version number |
| `--history` | `-h` | Shows last 50 commit messages from local history |

**Example output:**

```
feat: add user authentication middleware

Introduced JWT validation middleware and attached it to protected routes.
```

---

## Fallback Mode

If `GROQ_API_KEY` is missing or the API call fails, the tool falls back to a local generator that analyzes the diff statistically (file count, additions, deletions) — no extra configuration needed.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | — | Your Groq API key (required for AI mode) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model to use |
| `STDIN_TIMEOUT_MS` | `5000` | Timeout in milliseconds for stdin input |

---

## Project Structure

```
Git_Commit_Generator/
├── src/
│   ├── groqApi.js            # Groq AI integration
│   ├── fallbackGenerator.js  # Offline fallback message generator
│   ├── diffParser.js         # Git diff parsing and stats
│   ├── msgFormatter.js       # Commit message formatting
│   └── database.js           # SQLite history storage
├── tests/
│   ├── cli.test.js
│   ├── diffParser.test.js
│   ├── msgFormatter.test.js
│   ├── groqApi.test.js
│   ├── database.test.js
│   └── fallbackGenerator.test.js
├── db/
│   └── schema.sql
├── cli.js                    # CLI entry point
├── .env.example
└── package.json
```

---

## Testing

```bash
npm test
```

| Module | Coverage | Tests |
|--------|:--------:|:-----:|
| `cli.js` | 95% | 32 |
| `diffParser.js` | 100% | 11 |
| `fallbackGenerator.js` | 100% | 18 |
| `msgFormatter.js` | 100% | 25 |
| `groqApi.js` | 98% | 23 |
| `database.js` | 83% | 8 |
| **Total** | **95%** | **127** |

---

## Uninstall

```bash
npm unlink -g git-commit-gen
```
