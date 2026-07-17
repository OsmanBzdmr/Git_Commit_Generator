const { format } = require('../src/msgFormatter');

describe('Message Formatter', () => {
  describe('format', () => {
    const validTypes = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'perf'];

    validTypes.forEach(type => {
      test(`formats "${type}" type correctly`, () => {
        const result = format(type, 'Some message');
        expect(result).toBe(`${type}: Some message`);
      });
    });

    test('uses feat as default type for invalid type', () => {
      const result = format('invalid-type', 'Message');
      expect(result).toContain('feat:');
      expect(result).toContain('Message');
    });

    test('normalizes type to lowercase', () => {
      const result = format('FIX', 'Lowercase test');
      expect(result).toContain('fix:');
    });

    test('normalizes mixed case type', () => {
      const result = format('ReFaCtOr', 'Case test');
      expect(result).toContain('refactor:');
    });

    test('formats message with description body', () => {
      const result = format('feat', 'Add login', 'Implement OAuth2 login flow');
      expect(result).toBe('feat: Add login\n\nImplement OAuth2 login flow');
    });

    test('handles multiline description', () => {
      const result = format('fix', 'Fix bug', 'Line one\nLine two\nLine three');
      expect(result).toBe('fix: Fix bug\n\nLine one\nLine two\nLine three');
    });

    test('omits body when description is empty', () => {
      const result = format('feat', 'No body');
      expect(result).toBe('feat: No body');
    });

    test('omits body when description is empty string', () => {
      const result = format('feat', 'No body', '');
      expect(result).toBe('feat: No body');
    });

    test('omits body when description is whitespace only', () => {
      const result = format('docs', 'Whitespace', '   ');
      expect(result).toBe('docs: Whitespace');
    });

    test('trims description whitespace', () => {
      const result = format('test', 'Add tests', '  Some description  ');
      expect(result).toBe('test: Add tests\n\nSome description');
    });

    test('handles empty message string', () => {
      const result = format('chore', '');
      expect(result).toBe('chore: ');
    });

    test('handles message with special characters', () => {
      const result = format('perf', 'Optimize @ $peed!');
      expect(result).toBe('perf: Optimize @ $peed!');
    });

    test('handles type with number suffix as invalid', () => {
      const result = format('feat2', 'Numbered type');
      expect(result).toContain('feat:');
    });

    test('formats breaking change type with !', () => {
      const result = format('feat!', 'Breaking change');
      expect(result).toBe('feat!: Breaking change');
    });

    test('normalizes breaking change type and preserves !', () => {
      const result = format('FIX!', 'Breaking fix');
      expect(result).toBe('fix!: Breaking fix');
    });

    test('formats breaking change with description', () => {
      const result = format('feat!', 'Remove old API', 'Drops v1 endpoints');
      expect(result).toBe('feat!: Remove old API\n\nDrops v1 endpoints');
    });

    test('invalid breaking type falls back to feat with !', () => {
      const result = format('invalid!', 'Breaking change');
      expect(result).toBe('feat!: Breaking change');
    });

    test('formats with scope', () => {
      const result = format('feat', 'Add login', '', 'auth');
      expect(result).toBe('feat(auth): Add login');
    });

    test('formats breaking change with scope', () => {
      const result = format('feat!', 'Remove API', 'Drops old endpoints', 'api');
      expect(result).toBe('feat!(api): Remove API\n\nDrops old endpoints');
    });

    test('normalizes type with scope', () => {
      const result = format('FIX', 'Bug fix', '', 'login');
      expect(result).toBe('fix(login): Bug fix');
    });
  });
});
