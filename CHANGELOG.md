# Changelog

## [1.1.0] - 2026-07-14

### Added

- macOS clipboard support (pbcopy)
- `--version` / `-v` flag for CLI
- `engines` field in package.json (Node >=18)
- CI: `npm audit` step in GitHub Actions

### Fixed

- `--all` flag now pushes even when there are no new changes (previously exited with "No changes")
- Security: command injection vulnerability in `execSync` calls replaced with `execFileSync`
- Windows clipboard fallback: removed temp-file approach, all platforms use direct pipe

### Changed

- License: MIT added to README badges
- Version bumped from 1.0.0 to 1.1.0

## [1.0.0] - 2026-07-13

### Added

- Initial release
- AI-powered commit message generation via Groq (Llama 3.3 70B)
- Fallback mode for offline/API-unavailable scenarios
- Conventional Commits (feat, fix, docs, refactor, test, chore, style, perf)
- Cross-platform clipboard (Windows via powershell, Linux via clip.exe/wl-copy/xclip)
- Local SQLite history with `--history` flag
- `--commit` / `-c`: stage all + commit
- `--all` / `-a`: stage all + commit + push
- Stdin mode: pipe diff directly
- Unit test suite with Jest (~96% coverage)
