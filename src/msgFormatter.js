const VALID_TYPES = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'perf'];

function format(type, message, description, scope) {
  const isBreaking = type.endsWith('!');
  const cleanType = isBreaking ? type.slice(0, -1) : type;
  const normalizedType = VALID_TYPES.includes(cleanType.toLowerCase()) ? cleanType.toLowerCase() : 'feat';
  const scopePart = scope ? `(${scope})` : '';
  let fullMessage = `${normalizedType}${isBreaking ? '!' : ''}${scopePart}: ${message}`;

  if (description && description.trim()) {
    fullMessage += `\n\n${description.trim()}`;
  }

  return fullMessage;
}

module.exports = { format };
