const diffParser = {
  parseDiff(diffContent) {
    const lines = diffContent.split('\n');
    const stats = {
      filesChanged: 0,
      additions: 0,
      deletions: 0,
      files: []
    };

    for (const line of lines) {
      // Track file changes
      if (line.startsWith('diff --git')) {
        const match = line.match(/diff --git a\/(.*?) b\/(.*?)$/);
        if (match) {
          const fileName = match[2];
          if (fileName && fileName !== '/dev/null') {
            stats.filesChanged++;
            stats.files.push(fileName);
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
