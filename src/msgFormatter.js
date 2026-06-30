const VALID_TYPES = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'perf'];

function format(type, message, description) {
  const normalizedType = VALID_TYPES.includes(type.toLowerCase()) ? type.toLowerCase() : 'feat';
  let fullMessage = `${normalizedType}: ${message}`;

  if (description && description.trim()) {
    fullMessage += `\n\n${description.trim()}`;
  }

  return fullMessage;
}

module.exports = { format };
