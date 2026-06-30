require('dotenv').config();
const groqApi = require('../src/groqApi');
const diffParser = require('../src/diffParser');
const msgFormatter = require('../src/msgFormatter');

describe('Git Commit Message Generator', () => {

  describe('Diff Parser', () => {
    test('should parse diff stats correctly', () => {
      const diff = `diff --git a/test.js b/test.js
index 123..456 100644
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
-old code
+new code
+console.log('test');`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.filesChanged).toBeGreaterThan(0);
      expect(stats.additions).toBeGreaterThan(0);
      expect(stats.deletions).toBeGreaterThan(0);
    });

    test('should detect commit type from diff content', () => {
      const testDiff = 'diff --git a/test/file.test.js';
      const type = diffParser.detectChangeType(testDiff);
      expect(type).toBe('test');
    });
  });

  describe('Message Formatter', () => {
    test('should format commit message correctly', () => {
      const formatted = msgFormatter.format(
        'feat',
        'Add new feature',
        'This is a new feature'
      );
      expect(formatted).toContain('feat:');
      expect(formatted).toContain('Add new feature');
    });

    test('should validate conventional commit format', () => {
      const valid = 'feat: Add feature';
      const invalid = 'some random message';

      expect(msgFormatter.validate(valid)).toBe(true);
      expect(msgFormatter.validate(invalid)).toBe(false);
    });

    test('should use default type if invalid', () => {
      const formatted = msgFormatter.format('invalid-type', 'Message');
      expect(formatted).toContain('feat:');
    });
  });

  describe('Groq API Integration', () => {
    test('should have generateCommitMessage method', () => {
      expect(typeof groqApi.generateCommitMessage).toBe('function');
    });

    test('should fallback when no API key is set', async () => {
      const originalKey = process.env.GROQ_API_KEY;
      delete process.env.GROQ_API_KEY;

      const result = await groqApi.generateCommitMessage('test diff');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('message');

      process.env.GROQ_API_KEY = originalKey;
    });
  });
});
