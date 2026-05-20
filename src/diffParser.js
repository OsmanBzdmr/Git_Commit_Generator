const diffParser = {
  parseDiff(diffContent) {
    const lines = diffContent.split('\n');
    const stats = {
      filesChanged: 0,
      additions: 0,
      deletions: 0,
      files: []
    };

    let currentFile = null;

    for (const line of lines) {
      // Track file changes
      if (line.startsWith('diff --git') || line.startsWith('+++')) {
        if (line.startsWith('+++')) {
          const fileName = line.replace('+++', '').trim();
          if (fileName && fileName !== 'b/dev/null') {
            currentFile = fileName.replace('b/', '');
            stats.filesChanged++;
            stats.files.push(currentFile);
          }
        }
      }

      // Count additions and deletions
      if (line.startsWith('+') && !line.startsWith('+++')) {
        stats.additions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        stats.deletions++;
      }
    }

    return stats;
  },

  detectChangeType(diffContent) {
    const lower = diffContent.toLowerCase();

    // Detect type based on content patterns
    if (lower.includes('test') || lower.includes('spec')) return 'test';
    if (lower.includes('doc') || lower.includes('readme')) return 'docs';
    if (lower.includes('refactor')) return 'refactor';
    if (lower.includes('style') || lower.includes('format')) return 'style';
    if (lower.includes('perf') || lower.includes('performance')) return 'perf';
    if (lower.includes('chore') || lower.includes('bump')) return 'chore';
    if (/bug|fix|error|issue/i.test(lower)) return 'fix';

    return null;
  }
};

module.exports = diffParser;
