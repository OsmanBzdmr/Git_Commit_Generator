#!/usr/bin/env node
require('dotenv').config({ path: __dirname + '/.env' });
const groqApi = require('./src/groqApi');
const msgFormatter = require('./src/msgFormatter');
const diffParser = require('./src/diffParser');
const { saveCommit, getCommitHistory } = require('./src/database');
const { execSync, execFileSync } = require('child_process');

function sh(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
}

function printUsage() {
  console.log(`
Usage:
  git diff | git-commit-gen              Generate message from piped diff
  git-commit-gen --commit, -c            Stage all + commit
  git-commit-gen --all, -a               Stage all + commit + push
  git-commit-gen --history, -h           Show commit history
  git-commit-gen --help                  Show this help
  `);
}

async function showHistory() {
  const commits = await getCommitHistory();
  if (!commits || commits.length === 0) {
    console.log('No commit history found.\n');
    return;
  }
  for (const c of commits) {
    const date = new Date(c.created_at).toLocaleString('tr-TR');
    console.log(`[${date}] ${c.generated_message}`);
    console.log(`  files: ${c.files_changed}  +${c.additions}  -${c.deletions}\n`);
  }
}

async function getDiffFromGit() {
  try {
    const staged = sh('git diff --cached');
    if (staged) return { diff: staged, staged: true };
    const unstaged = sh('git diff');
    if (unstaged) return { diff: unstaged, staged: false };
    return { diff: '', staged: false };
  } catch (e) {
    if (/not a git repository/i.test(e.message)) {
      process.stderr.write('Not inside a git repository.\n');
      process.exit(1);
    }
    return { diff: '', staged: false };
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    printUsage();
    return;
  }

  if (args.includes('--history') || args.includes('-h')) {
    await showHistory();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    console.log(require('./package.json').version);
    return;
  }

  const isAll = args.includes('--all') || args.includes('-a');
  const isCommit = args.includes('--commit') || args.includes('-c');

  let diff;
  let wasStaged = false;
  let formatted;

  if (isAll || isCommit) {
    const result = await getDiffFromGit();
    if (!result.diff) {
      if (isCommit) {
        process.stderr.write('No changes to commit.\n');
        process.exit(1);
      }
    } else {
      diff = result.diff;
      wasStaged = result.staged;
      if (!wasStaged) {
        sh('git add .');
        process.stderr.write('(staged all changes)\n');
      }
    }
  } else {
    const timeoutMs = parseInt(process.env.STDIN_TIMEOUT_MS, 10) || 5000;
    const controller = new AbortController();

    async function readStdin() {
      const chunks = [];
      const reader = process.stdin[Symbol.asyncIterator]();
      try {
        while (true) {
          const result = await Promise.race([
            reader.next(),
            new Promise((_, reject) => {
              if (controller.signal.aborted) return reject(new Error('timeout'));
              controller.signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true });
            }),
          ]);
          if (result.done) break;
          chunks.push(result.value);
        }
      } finally {
        if (reader.return) await reader.return();
      }
      return Buffer.concat(chunks).toString('utf8');
    }

    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      diff = await readStdin();
    } catch {
      process.stderr.write('No input received (timeout).\n');
      process.exit(1);
    } finally {
      clearTimeout(id);
    }

    if (!diff.trim()) {
      printUsage();
      process.exit(1);
    }
  }

  if (diff) {
    const result = await groqApi.generateCommitMessage(diff);
    formatted = msgFormatter.format(result.type, result.message, result.description);
    console.log(formatted);

    const stats = diffParser.parseDiff(diff);
    saveCommit(diff, formatted, result.type, stats);
  }

  if (diff && (isAll || isCommit)) {
    process.stderr.write('(committing...)\n');
    const parts = formatted.split(/\n\n/);
    const commitArgs = ['commit'];
    for (const p of parts) {
      commitArgs.push('-m', p);
    }
    execFileSync('git', commitArgs, { stdio: 'pipe', encoding: 'utf8' });
    process.stderr.write('(committed)\n');
  }

  if (isAll) {
    process.stderr.write('(pushing...)\n');
    try {
      execFileSync('git', ['push'], { stdio: 'pipe', encoding: 'utf8' });
      process.stderr.write('(pushed)\n');
    } catch (e) {
      const branch = sh('git rev-parse --abbrev-ref HEAD');
      execFileSync('git', ['push', '-u', 'origin', branch], { stdio: 'pipe', encoding: 'utf8' });
      process.stderr.write('(pushed with upstream)\n');
    }
  }

  if (formatted) {
    try {
      switch (process.platform) {
        case 'win32':
          execFileSync('powershell', ['-c', 'Set-Clipboard'], { input: formatted });
          break;
        case 'darwin':
          execFileSync('pbcopy', { input: formatted });
          break;
        case 'linux':
          try {
            execFileSync('clip.exe', { input: formatted });
          } catch {
            try {
              execFileSync('wl-copy', { input: formatted });
            } catch {
              execFileSync('xclip', ['-selection', 'clipboard'], { input: formatted });
            }
          }
          break;
      }
      process.stderr.write('(panoya kopyalandi)\n');
    } catch {}
  }
}

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write('Error: ' + err.message + '\n');
    process.exit(1);
  });
}

module.exports = { main, sh, getDiffFromGit, showHistory, printUsage };
