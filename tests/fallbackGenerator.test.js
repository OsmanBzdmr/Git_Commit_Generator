const { generateFallbackMessage, detectType, detectBreaking, branchInfo } = require('../src/fallbackGenerator');

describe('branchInfo', () => {
  test('returns type and scope for feat/ branch', () => {
    expect(branchInfo('feat/login')).toEqual({ type: 'feat', scope: 'login' });
  });

  test('returns type and scope for fix/ branch', () => {
    expect(branchInfo('fix/auth-timeout')).toEqual({ type: 'fix', scope: 'auth-timeout' });
  });

  test('returns type and scope for feature/ branch', () => {
    expect(branchInfo('feature/checkout')).toEqual({ type: 'feat', scope: 'checkout' });
  });

  test('returns type and scope for hotfix/ branch', () => {
    expect(branchInfo('hotfix/api-crash')).toEqual({ type: 'fix', scope: 'api-crash' });
  });

  test('returns type and scope for docs/ branch', () => {
    expect(branchInfo('docs/readme')).toEqual({ type: 'docs', scope: 'readme' });
  });

  test('returns null type/scope for main branch', () => {
    expect(branchInfo('main')).toEqual({ type: null, scope: null });
  });

  test('returns null type/scope for unknown branch pattern', () => {
    expect(branchInfo('random/name')).toEqual({ type: null, scope: null });
  });

  test('returns null type/scope for null branchName', () => {
    expect(branchInfo(null)).toEqual({ type: null, scope: null });
  });

  test('returns null type/scope for undefined branchName', () => {
    expect(branchInfo(undefined)).toEqual({ type: null, scope: null });
  });

  test('returns null type/scope for empty string', () => {
    expect(branchInfo('')).toEqual({ type: null, scope: null });
  });
});

describe('detectType', () => {
  test('uses branch name to determine type when available', () => {
    expect(detectType('some random diff', 'feat/payment')).toBe('feat');
  });

  test('falls back to diff analysis when branch has no match', () => {
    expect(detectType('add new feature', 'main')).toBe('feat');
  });

  test('falls back to diff analysis when branch is null', () => {
    expect(detectType('add new feature', null)).toBe('feat');
  });

  test('branch type takes priority over diff analysis', () => {
    expect(detectType('fix a bug', 'feat/new-button')).toBe('feat');
  });
});

describe('generateFallbackMessage', () => {
  test('includes scope from branch name', () => {
    const result = generateFallbackMessage('diff --git a/a.js b/a.js\n+test', 'feat/login');
    expect(result.scope).toBe('login');
    expect(result.type).toBe('feat');
  });

  test('scope is null without branch name', () => {
    const result = generateFallbackMessage('diff --git a/a.js b/a.js\n+test');
    expect(result.scope).toBeNull();
  });

  test('scope is null for unknown branch', () => {
    const result = generateFallbackMessage('diff --git a/a.js b/a.js\n+test', 'main');
    expect(result.scope).toBeNull();
  });

  test('breaking with branch scope', () => {
    const result = generateFallbackMessage('BREAKING CHANGE\ndiff --git a/a.js b/a.js\n+test', 'feat/api');
    expect(result.type).toBe('feat!');
    expect(result.scope).toBe('api');
  });
});
