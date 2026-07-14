# Contributing

## Getting Started

1. Fork the repository
2. `npm install`
3. Copy `.env.example` to `.env` and add your `GROQ_API_KEY` (optional, fallback mode works without it)

## Development

### Tests

```bash
npm test
```

All new features and bug fixes must include tests. Coverage should not drop below current levels (~96%).

### Code Style

- 2-space indentation
- Single quotes for strings
- Semicolons required
- No commented-out code
- Use `execFileSync` instead of `execSync` for external commands (security)

### Commit Convention

This tool generates conventional commits, and the same convention applies to this repo:

```
<type>: <short description>

<body> (optional)
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`

## Pull Request Process

1. Create a branch with a descriptive name (`fix/clipboard-linux`, `feat/config-file`)
2. Write or update tests for your change
3. Run `npm test` and ensure all tests pass
4. Update `CHANGELOG.md` if the change is user-facing
5. Open a PR against `main`

## Security

- Never use `execSync` with unsanitized user input or shell commands
- Use `execFileSync` with explicit argument arrays instead
- Report vulnerabilities by opening an issue
