const axios = require('axios');

const ollamaApi = {
  async generateCommitMessage(diffContent) {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'mistral:7b';

    const prompt = `You are a Git commit message expert. Analyze this git diff and generate a concise, professional commit message following the Angular convention.

Git Diff:
\`\`\`
${diffContent}
\`\`\`

Rules:
- Use Angular convention: feat, fix, docs, refactor, test, chore, style, perf
- Keep message under 50 characters
- Be specific about WHAT changed, not HOW
- Add optional body for more details

Respond in this exact format:
TYPE: feat|fix|docs|refactor|test|chore|style|perf
MESSAGE: [Your message here]
BODY: [Optional details about the change]`;

    try {
      const response = await axios.post(
        `${ollamaUrl}/api/generate`,
        {
          model: model,
          prompt: prompt,
          stream: false,
          temperature: 0.5
        },
        {
          timeout: 30000
        }
      );

      const content = response.data.response;
      return parseOllamaResponse(content);
    } catch (error) {
      console.error('Ollama API Error:', error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Ollama is not running. Start it with: ollama serve');
      }
      // Fallback to smart analysis
      return generateFallbackMessage(diffContent);
    }
  }
};

function parseOllamaResponse(content) {
  const typeMatch = content.match(/TYPE:\s*(\w+)/i);
  const messageMatch = content.match(/MESSAGE:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = content.match(/BODY:\s*(.+?)(?:\n|$)/i);

  return {
    type: typeMatch ? typeMatch[1].toLowerCase() : 'chore',
    message: messageMatch ? messageMatch[1].trim() : 'Update code',
    description: bodyMatch ? bodyMatch[1].trim() : ''
  };
}

function generateFallbackMessage(diff) {
  const lower = diff.toLowerCase();
  
  // Determine type from diff content
  let type = 'chore';
  if (/\btest\b|spec|\.test\.|\.spec\./.test(diff)) type = 'test';
  else if (/doc|readme|comment|\.md|documentation/.test(lower)) type = 'docs';
  else if (/refactor|reorganize|simplify|cleanup|rewrite/.test(lower)) type = 'refactor';
  else if (/style|format|whitespace|indent|prettier|lint/.test(lower)) type = 'style';
  else if (/perf|optim|cache|speed|fast|slow/.test(lower)) type = 'perf';
  else if (/bug|fix|error|issue|resolve|patch|broken/.test(lower)) type = 'fix';
  else if (/feature|add|new|implement|create|support/.test(lower)) type = 'feat';

  // Count changes
  const fileCount = (diff.match(/^diff --git/gm) || []).length || 1;
  const additions = (diff.match(/^\+[^+]/gm) || []).length;
  const deletions = (diff.match(/^-[^-]/gm) || []).length;

  // Generate appropriate message based on type
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

  return {
    type,
    message: messages[type] || 'Update code',
    description: fileCount > 1 
      ? `Changes across ${fileCount} files: +${additions} -${deletions} lines` 
      : `${additions > deletions ? 'Added' : 'Modified'} functionality: +${additions} -${deletions} lines`
  };
}

module.exports = ollamaApi;
