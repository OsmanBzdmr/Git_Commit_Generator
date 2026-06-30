const VALID_TYPES = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'perf'];

function format(type, message, description) {
  const normalizedType = VALID_TYPES.includes(type.toLowerCase()) ? type.toLowerCase() : 'feat';
  let fullMessage = `${normalizedType}: ${message}`;

  if (description && description.trim()) {
    fullMessage += `\n\n${description.trim()}`;
  }

  return fullMessage;
}

function validate(message) {
  const parts = message.split('\n')[0];
  const [typeSection] = parts.split(':');

  if (!typeSection) return false;

  return VALID_TYPES.some(t => typeSection.includes(t));
}

module.exports = { format, validate };
