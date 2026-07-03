# Spec: Git Commit Message Generator

## Objective

AI-powered web application that generates standardized Conventional Commits messages from Git diff input. Users paste a `git diff` output and get a formatted commit message using Groq's LLM API, with automatic fallback when the API is unavailable.

**User:** Software engineers who want consistent, well-formatted commit messages.

**Success criteria:**
- User pastes a git diff → receives a Conventional Commits message
- Fallback mode works when Groq API key is missing or API returns error
- All generated messages stored in SQLite for history
- History viewable in a sidebar drawer
- Coverage ≥ 80%, all tests pass

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Database:** SQLite3 5.1
- **AI:** Groq API (Llama 3.3 70B)
- **Testing:** Jest 29.7
- **Frontend:** Vanilla HTML/CSS/JS (no framework)

## Commands

```bash
# Start production server
npm start

# Start with nodemon (auto-reload)
npm run dev

# Run tests with coverage
npm test

# Manual test with curl
curl -X POST http://localhost:3000/api/generate-message \
  -H "Content-Type: application/json" \
  -d '{"diff": "diff --git a/test.js b/test.js\n@@ -1 +1 @@\n-old code\n+new code"}'

# Health check
curl http://localhost:3000/api/health
```

## Project Structure

```
commit-msg-generator/
├── server.js               # Express entry point
├── specs/spec.md           # Specification (this file)
├── src/
│   ├── diffParser.js       # Git diff parsing + change type detection
│   ├── msgFormatter.js     # Conventional Commits formatting
│   ├── groqApi.js          # Groq API client + fallback generator
│   ├── database.js         # SQLite database operations
│   └── fallbackGenerator.js# API-unavailable fallback (extracted)
├── routes/
│   └── api.js              # Express routes: generate, history, health
├── tests/
│   ├── diffParser.test.js
│   ├── msgFormatter.test.js
│   ├── groqApi.test.js
│   └── database.test.js
├── public/
│   ├── index.html          # Single-page application
│   ├── style.css           # Styles with dark mode support
│   └── script.js           # Client-side JavaScript
├── db/
│   └── schema.sql          # Database schema
├── data/                   # SQLite DB (runtime, gitignored)
├── .opencode/
│   └── plans/              # Plan and task documents
├── .env.example            # Environment template
├── package.json
└── README.md
```

## Code Style

```js
// Naming: camelCase for variables/functions, PascalCase for classes
// Modules: CommonJS (require/module.exports)
// Async: async/await over raw promises

// Good
const diffParser = {
  parseDiff(diffContent) {
    const lines = diffContent.split('\n');
    // ...
  }
};
module.exports = diffParser;

// Validation at entry points
async function generateCommitMessage(diffContent) {
  if (!diffContent || typeof diffContent !== 'string') {
    throw new Error('Invalid diff content');
  }
  // ...
}
```

**Conventions:**
- Use `const` over `let` (no `var`)
- Early return for edge cases
- Descriptive error messages in Turkish (kullanıcı mesajları) / English (teknik loglar)
- `process.env` reads at module level, not inline
- Module exports at bottom of file

## Testing Strategy

- **Framework:** Jest 29.7
- **Location:** `tests/*.test.js` (flat, no nested dirs)
- **Coverage target:** ≥ 80% statements, ≥ 70% branches
- **Approach:** TDD (RED → GREEN → REFACTOR)
  - Write failing test first
  - Implement minimal code
  - Refactor only after green

| Module | Test Priority | Approach |
|--------|:------------:|----------|
| `diffParser.js` | High | Pure function tests, all edge cases |
| `msgFormatter.js` | High | Pure function tests, all types |
| `groqApi.js` | High | Mock fetch, test fallback paths |
| `database.js` | High | In-memory SQLite, CRUD tests |
| `routes/api.js` | Medium | SuperTest integration tests (future) |

**Test sizes:**
- Small: `diffParser`, `msgFormatter` (no I/O)
- Medium: `groqApi`, `database` (mock/lite I/O)
- Large: API integration (not yet implemented)

## Boundaries

### Always do:
- Run `npm test` before committing
- Use TDD cycle for new logic
- Validate all external inputs
- Keep tests in `tests/` directory
- Update spec when architecture changes

### Ask first:
- Adding new npm dependencies
- Changing database schema
- Modifying API response format
- Adding new API endpoints
- Changing test framework

### Never do:
- Commit `.env` files or real API keys
- Remove tests without approval
- Edit `node_modules/`
- Use real Groq API in tests (mock instead)
- Break the fallback mode

## Success Criteria

1. Coverage ≥ 80% on all modules
2. All existing functionality preserved
3. `npm test` passes with zero warnings
4. `npm start` runs without errors
5. Every module has its own test file
6. Spec document stays in version control

## Open Questions

- Should `routes/api.js` have integration tests with SuperTest?
- Should we add a CI config (GitHub Actions)?
- Coverage fail threshold in Jest config?
