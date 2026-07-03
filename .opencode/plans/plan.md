# Implementation Plan: Git Commit Message Generator — Skill-Driven Restructuring

## Overview

Mevcut `commit-msg-generator` projesini skill-driven development workflow'una uygun hale getirmek. Proje çalışır durumda ancak spec belgesi, task planı ve yeterli test coverage'ı yok. Bu plan, projeyi spec-driven-development → planning → TDD → incremental-implementation sürecine sokar.

**Mevcut Durum:**
- Genel coverage: %49.43 statements, %38.29 branches
- `database.js`: **hiç test yok** (%0)
- `groqApi.js`: %34.69 statements
- Tüm testler tek dosyada (`src/tests.test.js`)
- Spec/plan/task dokümanı yok

**Hedef:** Coverage ≥ %80, skill workflow'una uygun dökümantasyon, temiz modül yapısı.

## Architecture Decisions

- Testler `tests/` dizinine taşınacak, her modül için ayrı test dosyası
- `database.js` testleri için SQLite in-memory kullanılacak (gerçek DB'ye bağımlılık yok)
- Fallback fonksiyonu `groqApi.js`'den ayrılıp `src/fallbackGenerator.js`'e çıkarılacak (SRP + test edilebilirlik)
- Spec dokümanı `specs/spec.md`'de yaşayacak, kodla birlikte version control'de olacak

## Task List

### Phase 1: Foundation (Spec + Infrastructure)

- [ ] Task 1: Create specification document (`specs/spec.md`)
- [ ] Task 2: Create task plan files (`.opencode/plans/plan.md`, `.opencode/plans/todo.md`)

### Phase 2: Test Infrastructure Restructure

- [ ] Task 3: Restructure test directory — move `src/tests.test.js` to `tests/`, split into per-module test files, update `package.json`
- [ ] Task 4: Write comprehensive tests for `diffParser.js` (edge cases: empty diff, multi-file, /dev/null, binary files)
- [ ] Task 5: Write comprehensive tests for `msgFormatter.js` (all types, empty description, multi-line body)
- [ ] Task 6: Write comprehensive tests for `groqApi.js` — API parsing, error handling, fallback paths
- [ ] Task 7: Write tests for `database.js` using SQLite in-memory

### Phase 3: Incremental Refactor

- [ ] Task 8: Extract fallback message generator from `groqApi.js` to `src/fallbackGenerator.js`
- [ ] Task 9: Clean up `database.js` — promisify/callback consistency, error handling
- [ ] Task 10: Add edge case handling to `diffParser.js` (empty content, null input)

### Phase 4: Final Verification

- [ ] Task 11: Final test run, coverage report generation, documentation update

## Dependency Graph

```
specs/spec.md (Task 1)
    │
    ├── tasks/plan.md, tasks/todo.md (Task 2)
    │
    ├── tests/ directory restructure (Task 3)
    │       │
    │       ├── tests/diffParser.test.js (Task 4)
    │       ├── tests/msgFormatter.test.js (Task 5)
    │       ├── tests/groqApi.test.js (Task 6)
    │       └── tests/database.test.js (Task 7)
    │
    └── refactoring (Tasks 8-10)
            │
            └── final verification (Task 11)
```

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Groq API testleri gerçek API çağrısı yapabilir | High | Testlerde API çağrısı mock'lanacak, sadece fallback ve parsing test edilecek |
| SQLite dosyası testleri etkileyebilir | Medium | Testler in-memory SQLite kullanacak, production DB'ye dokunulmayacak |
| npm test çalışmazsa | High | İlk task olarak test altyapısını doğrulama |

## Verification

- [ ] `npm test` — tüm testler geçmeli
- [ ] Coverage ≥ %80
- [ ] `npm start` — sunucu hatasız başlamalı
- [ ] Her modül için ayrı test dosyası
