const messages = {
  feat: 'Implement new feature',
  fix: 'Resolve issue',
  docs: 'Update documentation',
  test: 'Add test coverage',
  refactor: 'Restructure code',
  style: 'Improve code formatting',
  perf: 'Optimize performance',
  chore: 'Maintenance update'
};

const BRANCH_PATTERNS = [
  { regex: /^(?:feature|feat)\/(.+)/i, type: 'feat' },
  { regex: /^(?:bugfix|fix|hotfix)\/(.+)/i, type: 'fix' },
  { regex: /^docs\/(.+)/i, type: 'docs' },
  { regex: /^refactor\/(.+)/i, type: 'refactor' },
  { regex: /^test\/(.+)/i, type: 'test' },
  { regex: /^chore\/(.+)/i, type: 'chore' },
  { regex: /^perf\/(.+)/i, type: 'perf' },
  { regex: /^style\/(.+)/i, type: 'style' },
];

function branchInfo(branchName) {
  if (!branchName) return { type: null, scope: null };
  for (const { regex, type } of BRANCH_PATTERNS) {
    const match = branchName.match(regex);
    if (match) {
      return { type, scope: match[1] || null };
    }
  }
  return { type: null, scope: null };
}

function detectType(diff, branchName) {
  const fromBranch = branchInfo(branchName);
  if (fromBranch.type) return fromBranch.type;

  const lower = diff.toLowerCase();

  if (/\btest\b|spec|\.test\.|\.spec\./.test(diff)) return 'test';
  if (/doc|readme|comment|\.md|documentation/.test(lower)) return 'docs';
  if (/refactor|reorganize|simplify|cleanup|rewrite/.test(lower)) return 'refactor';
  if (/style|format|whitespace|indent|prettier|lint/.test(lower)) return 'style';
  if (/perf|optim|cache|speed|fast|slow/.test(lower)) return 'perf';
  if (/bug|fix|error|issue|resolve|patch|broken/.test(lower)) return 'fix';
  if (/feature|add|new|implement|create|support/.test(lower)) return 'feat';

  return 'chore';
}

function detectBreaking(diff) {
  return /BREAKING|^(?:renamed|removed|deleted).*\(|exports\.\w+\s*=|function\s+\w+\s*\(/.test(diff);
}

function generateFallbackMessage(diff, branchName) {
  const branch = branchInfo(branchName);
  const type = branch.type || detectType(diff, branchName);

  const fileCount = (diff.match(/^diff --git/gm) || []).length || 1;
  const additions = (diff.match(/^\+[^+]/gm) || []).length;
  const deletions = (diff.match(/^-[^-]/gm) || []).length;

  return {
    type: detectBreaking(diff) ? type + '!' : type,
    scope: branch.scope || null,
    message: messages[type] || 'Update code',
    description: fileCount > 1
      ? `Changes across ${fileCount} files: +${additions} -${deletions} lines`
      : `${additions > deletions ? 'Added' : 'Modified'} functionality: +${additions} -${deletions} lines`
  };
}

module.exports = { generateFallbackMessage, detectType, detectBreaking, branchInfo };
