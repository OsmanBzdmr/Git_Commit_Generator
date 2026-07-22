const diffParser = {
  parseDiff(diffContent) {
    if (!diffContent) {
      return { filesChanged: 0, additions: 0, deletions: 0, files: [] };
    }
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
};

module.exports = diffParser;
