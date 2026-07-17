require('dotenv').config();
const groqApi = require('../src/groqApi');

const mockFetch = (response, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: jest.fn().mockResolvedValue(response),
    status: ok ? 200 : 500
  });
};

describe('Groq API Integration', () => {
  beforeEach(() => {
    global.fetch = undefined;
  });

  describe('generateCommitMessage', () => {
    test('should have generateCommitMessage method', () => {
      expect(typeof groqApi.generateCommitMessage).toBe('function');
    });

    describe('fallback mode (no API key)', () => {
      let originalKey;

      beforeAll(() => {
        originalKey = process.env.GROQ_API_KEY;
        delete process.env.GROQ_API_KEY;
      });

      afterAll(() => {
        process.env.GROQ_API_KEY = originalKey;
      });

      test('should return type and message when no API key', async () => {
        const result = await groqApi.generateCommitMessage('test diff');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('description');
      });

      test('should truncate diff over 4000 chars', async () => {
        const bigDiff = 'a\n'.repeat(3000);
        const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
        const result = await groqApi.generateCommitMessage(bigDiff);
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('message');
        expect(stderrSpy).toHaveBeenCalledWith('(diff truncated to 4000 chars)\n');
        stderrSpy.mockRestore();
      });

      const fallbackCases = [
        { diff: 'adding test for login spec', expectedType: 'test' },
        { diff: 'update readme documentation', expectedType: 'docs' },
        { diff: 'refactor user module', expectedType: 'refactor' },
        { diff: 'fix style formatting', expectedType: 'style' },
        { diff: 'optim performance improvement', expectedType: 'perf' },
        { diff: 'fix bug in login', expectedType: 'fix' },
        { diff: 'implement new feature', expectedType: 'feat' },
        { diff: 'bump version to 1.2', expectedType: 'chore' },
        { diff: 'random unrelated change', expectedType: 'chore' },
      ];

      fallbackCases.forEach(({ diff, expectedType }) => {
        test(`fallback detects "${expectedType}" for "${diff}"`, async () => {
          const result = await groqApi.generateCommitMessage(diff);
          expect(result.type).toBe(expectedType);
        });
      });

      test('fallback detects breaking change', async () => {
        const result = await groqApi.generateCommitMessage('BREAKING CHANGE: removed public API');
        expect(result.type).toBe('chore!');
      });

      test('fallback does not mark non-breaking as breaking', async () => {
        const result = await groqApi.generateCommitMessage('refactor user module');
        expect(result.type).toBe('refactor');
        expect(result.type).not.toContain('!');
      });
    });

    describe('API success path', () => {
      beforeEach(() => {
        process.env.GROQ_API_KEY = 'test-key-123';
      });

      afterEach(() => {
        delete process.env.GROQ_API_KEY;
      });

      test('should parse valid API response', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'TYPE: feat\nMESSAGE: Add new feature\nBODY: Implements the login flow'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.type).toBe('feat');
        expect(result.message).toBe('Add new feature');
        expect(result.description).toBe('Implements the login flow');
      });

      test('should append ! to type when BREAKING is yes', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'TYPE: feat\nBREAKING: yes\nMESSAGE: Remove deprecated API\nBODY: Drops v1 endpoints'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.type).toBe('feat!');
        expect(result.message).toBe('Remove deprecated API');
      });

      test('should not add ! when BREAKING is no', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'TYPE: fix\nBREAKING: no\nMESSAGE: Fix login bug'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.type).toBe('fix');
      });

      test('should parse SCOPE field', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'TYPE: feat\nSCOPE: auth\nMESSAGE: Add login'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.scope).toBe('auth');
        expect(result.type).toBe('feat');
      });

      test('should set scope to null when absent', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'TYPE: fix\nMESSAGE: Fix bug'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.scope).toBeNull();
      });

      test('should handle API response without BODY', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'TYPE: fix\nMESSAGE: Fix login bug'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.type).toBe('fix');
        expect(result.message).toBe('Fix login bug');
        expect(result.description).toBe('');
      });

      test('should use default type when parse fails', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'unexpected format without labels'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.type).toBe('chore');
        expect(result.message).toBe('Update code');
      });

      test('should use default message when MESSAGE label is missing', async () => {
        mockFetch({
          choices: [{
            message: {
              content: 'TYPE: unknown\nSOMETHING: test'
            }
          }]
        });

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result.type).toBe('unknown');
        expect(result.message).toBe('Update code');
      });
    });

    describe('API error handling', () => {
      beforeEach(() => {
        process.env.GROQ_API_KEY = 'test-key-123';
      });

      afterEach(() => {
        delete process.env.GROQ_API_KEY;
      });

      test('should fallback on HTTP error', async () => {
        mockFetch({ error: { message: 'Server error' } }, false);

        const result = await groqApi.generateCommitMessage('fix login bug');
        expect(result.type).toBe('fix');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('description');
      });

      test('should fallback on fetch rejection', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const result = await groqApi.generateCommitMessage('test diff');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('message');
      });

      test('should fallback on 401 error', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: jest.fn().mockResolvedValue({ error: { message: 'Unauthorized' } })
        });

        const result = await groqApi.generateCommitMessage('test content');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('message');
      });

      test('should fallback on 429 rate limit', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 429,
          json: jest.fn().mockResolvedValue({ error: { message: 'Rate limit exceeded' } })
        });

        const result = await groqApi.generateCommitMessage('test content');
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('message');
      });
    });
  });
});
