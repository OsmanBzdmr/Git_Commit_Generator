# Task List: Git Commit Message Generator — Skill-Driven Restructuring

## Phase 1: Foundation

- [ ] **Task 1:** Create specification document (`specs/spec.md`)
  - **Acceptance:** All 6 core areas covered (Objective, Commands, Project Structure, Code Style, Testing Strategy, Boundaries)
  - **Verify:** File exists, human review
  - **Files:** `specs/spec.md`

- [ ] **Task 2:** Create task plan files
  - **Acceptance:** `.opencode/plans/plan.md` and `.opencode/plans/todo.md` exist
  - **Verify:** File exists, human review
  - **Files:** `.opencode/plans/plan.md`, `.opencode/plans/todo.md`

## Checkpoint 1: Foundation Complete
- [ ] Spec document exists with all 6 areas
- [ ] Plan and todo files exist
- [ ] Human reviewed and approved

## Phase 2: Tests

- [ ] **Task 3:** Restructure test directory
  - **Acceptance:** `tests/diffParser.test.js`, `tests/msgFormatter.test.js`, `tests/groqApi.test.js`, `tests/database.test.js` exist. `src/tests.test.js` removed. `package.json` test script updated.
  - **Verify:** `npm test` passes
  - **Files:** `tests/*.test.js`, `package.json`

- [ ] **Task 4:** Write tests for `diffParser.js`
  - **Acceptance:** Covers: empty diff, multi-file, +/-, `/dev/null`, all detectChangeType types, no-match
  - **Verify:** `npm test` passes, diffParser coverage ≥ 90%
  - **Files:** `tests/diffParser.test.js`

- [ ] **Task 5:** Write tests for `msgFormatter.js`
  - **Acceptance:** Covers: all 8 types, invalid type fallback, empty description, multi-line body, special characters
  - **Verify:** `npm test` passes, msgFormatter 100%
  - **Files:** `tests/msgFormatter.test.js`

- [ ] **Task 6:** Write tests for `groqApi.js`
  - **Acceptance:** Covers: no-API-key fallback, `parseAIResponse` (all formats), error handling, all fallback type detections
  - **Verify:** `npm test` passes, groqApi ≥ 70%
  - **Files:** `tests/groqApi.test.js`

- [ ] **Task 7:** Write tests for `database.js`
  - **Acceptance:** Covers: save + retrieve, empty DB, error cases. Uses in-memory SQLite.
  - **Verify:** `npm test` passes, database ≥ 70%
  - **Files:** `tests/database.test.js`

## Checkpoint 2: Tests Complete
- [ ] `npm test` passes
- [ ] Coverage ≥ %70
- [ ] No tests in `src/`

## Phase 3: Refactor

- [ ] **Task 8:** Extract fallback generator to `src/fallbackGenerator.js`
  - **Acceptance:** `generateFallbackMessage()` in separate file. `groqApi.js` imports it. All tests pass.
  - **Verify:** `npm test` passes
  - **Files:** `src/fallbackGenerator.js`, `src/groqApi.js`, `tests/groqApi.test.js`

- [ ] **Task 9:** Clean up `database.js` — consistent promises, proper error handling
  - **Acceptance:** No callback/promisify mix, returns promises consistently
  - **Verify:** `npm test` passes, `npm start` works
  - **Files:** `src/database.js`

- [ ] **Task 10:** Add edge case handling to `diffParser.js`
  - **Acceptance:** Handles null/undefined/empty input gracefully
  - **Verify:** `npm test` passes, diffParser ≥ 95%
  - **Files:** `src/diffParser.js`, `tests/diffParser.test.js`

## Checkpoint 3: Refactor Complete
- [ ] `npm test` passes
- [ ] Coverage ≥ %80
- [ ] `npm start` works

## Phase 4: Final

- [ ] **Task 11:** Final verification
  - **Acceptance:** Full test run, coverage report, manual smoke test
  - **Verify:** Coverage ≥ %80, no regressions
  - **Files:** None (verification only)

## Final Checkpoint
- [ ] All tests pass
- [ ] Coverage ≥ %80
- [ ] Ready for review
