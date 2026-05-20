const msgFormatter = {
  formatCommitMessage(type, message, description = '') {
    // Validate conventional commit type
    const validTypes = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'perf'];
    const normalizedType = type.toLowerCase();

    if (!validTypes.includes(normalizedType)) {
      return this.format('feat', message, description);
    }

    return this.format(normalizedType, message, description);
  },

  format(type, message, description) {
    let fullMessage = `${type}: ${message}`;

    if (description && description.trim()) {
      fullMessage += `\n\n${description.trim()}`;
    }

    return fullMessage;
  },

  validate(message) {
    const parts = message.split('\n')[0];
    const [typeSection] = parts.split(':');

    if (!typeSection || typeSection.indexOf('feat') === -1 && 
        typeSection.indexOf('fix') === -1 && 
        typeSection.indexOf('docs') === -1 &&
        typeSection.indexOf('refactor') === -1 &&
        typeSection.indexOf('test') === -1 &&
        typeSection.indexOf('chore') === -1 &&
        typeSection.indexOf('style') === -1 &&
        typeSection.indexOf('perf') === -1) {
      return false;
    }

    return true;
  }
};

module.exports = msgFormatter;
