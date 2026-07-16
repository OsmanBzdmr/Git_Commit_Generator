function mockStdin(data) {
  const buf = Buffer.from(data, 'utf8');
  const mock = {
    [Symbol.asyncIterator]: () => {
      let yielded = false;
      return {
        next: () => {
          if (!yielded) {
            yielded = true;
            return Promise.resolve({ value: buf, done: false });
          }
          return Promise.resolve({ done: true });
        }
      };
    }
  };
  Object.defineProperty(process, 'stdin', {
    value: mock,
    writable: true,
    configurable: true
  });
  return mock;
}

const mockExecSync = jest.fn();
const mockExecFileSync = jest.fn();
const mockGenerateCommitMessage = jest.fn();
const mockSaveCommit = jest.fn();
const mockGetCommitHistory = jest.fn();
const mockParseDiff = jest.fn();
const mockFormat = jest.fn();

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('child_process', () => ({ execSync: mockExecSync, execFileSync: mockExecFileSync }));
jest.mock('../src/groqApi', () => ({ generateCommitMessage: mockGenerateCommitMessage }));
jest.mock('../src/database', () => ({ saveCommit: mockSaveCommit, getCommitHistory: mockGetCommitHistory }));
jest.mock('../src/diffParser', () => ({ parseDiff: mockParseDiff }));
jest.mock('../src/msgFormatter', () => ({ format: mockFormat }));

const cli = require('../cli');

function setPlatform(platform) {
  Object.defineProperty(process, 'platform', { value: platform, configurable: true });
}

describe('CLI', () => {
  let exitSpy, logSpy, stderrSpy;

  beforeEach(() => {
    jest.resetAllMocks();

    mockFormat.mockReturnValue('feat: test message\n\nbody text');
    mockGenerateCommitMessage.mockResolvedValue({ type: 'feat', message: 'test message', description: 'body text' });
    mockParseDiff.mockReturnValue({ filesChanged: 1, files: ['test.js'], additions: 2, deletions: 1 });
    mockSaveCommit.mockResolvedValue();
    mockGetCommitHistory.mockResolvedValue([
      { created_at: '2025-01-01T00:00:00.000Z', generated_message: 'feat: test', files_changed: 1, additions: 2, deletions: 1 }
    ]);
    mockExecSync.mockReturnValue('');

    process.argv = ['node', 'cli.js'];
    setPlatform('darwin');

    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  test('exports main, sh, getDiffFromGit, showHistory, printUsage', () => {
    expect(cli.main).toBeDefined();
    expect(cli.sh).toBeDefined();
    expect(cli.getDiffFromGit).toBeDefined();
    expect(cli.showHistory).toBeDefined();
    expect(cli.printUsage).toBeDefined();
  });

  describe('--help', () => {
    test('prints usage and returns without any other side effects', async () => {
      process.argv = ['node', 'cli.js', '--help'];
      await cli.main();
      expect(logSpy).toHaveBeenCalled();
      expect(mockExecSync).not.toHaveBeenCalled();
      expect(mockGenerateCommitMessage).not.toHaveBeenCalled();
      expect(mockExecFileSync).not.toHaveBeenCalled();
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe('--history / -h', () => {
    test('--history shows commit history', async () => {
      process.argv = ['node', 'cli.js', '--history'];
      await cli.main();
      expect(mockGetCommitHistory).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('feat: test'));
    });

    test('--history shows empty message when no history', async () => {
      mockGetCommitHistory.mockResolvedValue(null);
      process.argv = ['node', 'cli.js', '--history'];
      await cli.main();
      expect(logSpy).toHaveBeenCalledWith('No commit history found.\n');
    });

    test('-h is alias for --history', async () => {
      process.argv = ['node', 'cli.js', '-h'];
      await cli.main();
      expect(mockGetCommitHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('--version / -v', () => {
    test('--version prints package version', async () => {
      process.argv = ['node', 'cli.js', '--version'];
      await cli.main();
      expect(logSpy).toHaveBeenCalledWith('1.1.0');
    });

    test('-v is alias for --version', async () => {
      process.argv = ['node', 'cli.js', '-v'];
      await cli.main();
      expect(logSpy).toHaveBeenCalledWith('1.1.0');
    });
  });

  describe('stdin mode (no flags)', () => {
    test('generates commit message from stdin diff', async () => {
      process.stdin = mockStdin('diff --git a/test.js b/test.js\n+test');
      await cli.main();
      expect(mockGenerateCommitMessage).toHaveBeenCalledWith('diff --git a/test.js b/test.js\n+test');
      expect(mockFormat).toHaveBeenCalledWith('feat', 'test message', 'body text');
      expect(mockParseDiff).toHaveBeenCalled();
      expect(mockSaveCommit).toHaveBeenCalled();
      expect(exitSpy).not.toHaveBeenCalled();
    });

    test('empty stdin prints usage and exits', async () => {
      process.stdin = mockStdin('');
      await expect(cli.main()).rejects.toThrow('process.exit');
      expect(logSpy).toHaveBeenCalled();
    });

    test('stdin timeout exits with message when no input received', async () => {
      process.env.STDIN_TIMEOUT_MS = '50';
      const hangingStdin = {
        [Symbol.asyncIterator]: () => ({
          next: () => new Promise(() => {}),
        }),
      };
      Object.defineProperty(process, 'stdin', {
        value: hangingStdin,
        writable: true,
        configurable: true,
      });
      await expect(cli.main()).rejects.toThrow('process.exit');
      expect(stderrSpy).toHaveBeenCalledWith('No input received (timeout).\n');
      delete process.env.STDIN_TIMEOUT_MS;
    });
  });

  describe('--commit / -c', () => {
    test('--commit with staged calls execFileSync with array args (injection regression test)', async () => {
      mockExecSync.mockReturnValueOnce('diff --git a/test.js b/test.js\n+new code');
      process.argv = ['node', 'cli.js', '--commit'];
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'feat: test message', '-m', 'body text'],
        expect.objectContaining({ stdio: 'pipe', encoding: 'utf8' })
      );
      expect(mockExecFileSync).not.toHaveBeenCalledWith('git', ['push'], expect.anything());
    });

    test('--commit with unstaged stages all first', async () => {
      mockExecSync
        .mockReturnValueOnce('')
        .mockReturnValueOnce('diff --git a/a.js b/a.js\n+a')
        .mockReturnValueOnce('');
      process.argv = ['node', 'cli.js', '--commit'];
      await cli.main();
      expect(mockExecSync).toHaveBeenCalledWith('git add .', { stdio: 'pipe', encoding: 'utf8' });
      expect(stderrSpy).toHaveBeenCalledWith('(staged all changes)\n');
    });

    test('--commit with no changes exits early, API never called', async () => {
      mockExecSync
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');
      process.argv = ['node', 'cli.js', '--commit'];
      await expect(cli.main()).rejects.toThrow('process.exit');
      expect(stderrSpy).toHaveBeenCalledWith('No changes to commit.\n');
      expect(mockGenerateCommitMessage).not.toHaveBeenCalled();
      expect(mockSaveCommit).not.toHaveBeenCalled();
      expect(mockExecFileSync).not.toHaveBeenCalled();
    });

    test('-c is alias for --commit', async () => {
      mockExecSync.mockReturnValueOnce('diff --git a/test.js b/test.js\n+new code');
      process.argv = ['node', 'cli.js', '-c'];
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'feat: test message', '-m', 'body text'],
        expect.anything()
      );
    });

    test('--commit exits with message when not in a git repository', async () => {
      const gitError = new Error('fatal: not a git repository (or any of the parent directories): .git');
      mockExecSync.mockImplementation(() => { throw gitError; });
      process.argv = ['node', 'cli.js', '--commit'];
      await expect(cli.main()).rejects.toThrow('process.exit');
      expect(stderrSpy).toHaveBeenCalledWith('Not inside a git repository.\n');
      expect(mockGenerateCommitMessage).not.toHaveBeenCalled();
    });
  });

  describe('--all / -a', () => {
    test('--all commits and pushes', async () => {
      mockExecSync.mockReturnValueOnce('diff --git a/test.js b/test.js\n+new code');
      process.argv = ['node', 'cli.js', '--all'];
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith('git', ['commit', '-m', 'feat: test message', '-m', 'body text'], expect.anything());
      expect(mockExecFileSync).toHaveBeenCalledWith('git', ['push'], expect.anything());
    });

    test('--all push failure falls back to upstream', async () => {
      mockExecSync
        .mockReturnValueOnce('diff --git a/test.js b/test.js\n+new code')
        .mockReturnValueOnce('feature/login');
      mockExecFileSync
        .mockReturnValueOnce(undefined)
        .mockImplementationOnce(() => { throw new Error('push failed'); });
      process.argv = ['node', 'cli.js', '--all'];
      await cli.main();
      expect(mockExecSync).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe', encoding: 'utf8' });
      expect(mockExecFileSync).toHaveBeenCalledWith('git', ['push', '-u', 'origin', 'feature/login'], expect.anything());
      expect(stderrSpy).toHaveBeenCalledWith('(pushed with upstream)\n');
    });

    test('-a is alias for --all', async () => {
      mockExecSync.mockReturnValueOnce('diff --git a/test.js b/test.js\n+new code');
      process.argv = ['node', 'cli.js', '-a'];
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith('git', ['push'], expect.anything());
    });

    test('--all with no diff pushes only (no commit, no AI)', async () => {
      process.argv = ['node', 'cli.js', '--all'];
      await cli.main();
      expect(mockExecSync).toHaveBeenCalledWith('git diff --cached', { stdio: 'pipe', encoding: 'utf8' });
      expect(mockExecSync).toHaveBeenCalledWith('git diff', { stdio: 'pipe', encoding: 'utf8' });
      expect(mockGenerateCommitMessage).not.toHaveBeenCalled();
      expect(mockExecFileSync).toHaveBeenCalledWith('git', ['push'], expect.anything());
      expect(stderrSpy).not.toHaveBeenCalledWith('No changes to commit.\n');
      expect(exitSpy).not.toHaveBeenCalled();
    });

    test('--all with no diff does not attempt clipboard copy', async () => {
      process.argv = ['node', 'cli.js', '--all'];
      await cli.main();
      expect(mockExecFileSync).not.toHaveBeenCalledWith('pbcopy', expect.anything());
    });

    test('--all with no diff and push failure still falls back to upstream push', async () => {
      mockExecSync
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('main');
      mockExecFileSync.mockImplementationOnce(() => { throw new Error('push failed'); });
      process.argv = ['node', 'cli.js', '--all'];
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith('git', ['push', '-u', 'origin', 'main'], expect.anything());
    });
  });

  describe('clipboard', () => {
    beforeEach(() => {
      mockExecSync.mockReturnValueOnce('diff --git a/test.js b/test.js\n+new code');
      process.argv = ['node', 'cli.js', '--commit'];
    });

    test('win32 uses powershell Set-Clipboard with input', async () => {
      setPlatform('win32');
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'powershell',
        ['-c', 'Set-Clipboard'],
        { input: 'feat: test message\n\nbody text' }
      );
    });

    test('darwin uses pbcopy with input', async () => {
      setPlatform('darwin');
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'pbcopy',
        { input: 'feat: test message\n\nbody text' }
      );
    });

    test('linux uses clip.exe with input', async () => {
      setPlatform('linux');
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'clip.exe',
        { input: 'feat: test message\n\nbody text' }
      );
    });

    test('linux fallback chain: clip.exe fails -> wl-copy fails -> xclip succeeds', async () => {
      setPlatform('linux');
      mockExecFileSync
        .mockReturnValueOnce(undefined)
        .mockImplementationOnce(() => { throw new Error('ENOENT'); })
        .mockImplementationOnce(() => { throw new Error('ENOENT'); });
      await cli.main();
      expect(mockExecFileSync).toHaveBeenCalledWith(
        'xclip',
        ['-selection', 'clipboard'],
        { input: 'feat: test message\n\nbody text' }
      );
    });
  });

  describe('error handling', () => {
    test('main() rejects when groqApi throws', async () => {
      mockGenerateCommitMessage.mockRejectedValue(new Error('Groq API failure'));
      process.stdin = mockStdin('diff content');
      await expect(cli.main()).rejects.toThrow('Groq API failure');
    });
  });
});
