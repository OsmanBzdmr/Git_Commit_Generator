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

function detectType(diff) {
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

function generateFallbackMessage(diff) {
  const type = detectType(diff);

  const fileCount = (diff.match(/^diff --git/gm) || []).length || 1;
  const additions = (diff.match(/^\+[^+]/gm) || []).length;
  const deletions = (diff.match(/^-[^-]/gm) || []).length;

  return {
    type: detectBreaking(diff) ? type + '!' : type,
    message: messages[type] || 'Update code',
    description: fileCount > 1
      ? `Changes across ${fileCount} files: +${additions} -${deletions} lines`
      : `${additions > deletions ? 'Added' : 'Modified'} functionality: +${additions} -${deletions} lines`
  };
}

module.exports = { generateFallbackMessage, detectType, detectBreaking };
