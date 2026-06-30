const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const groqApi = {
  async generateCommitMessage(diffContent) {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      console.warn('GROQ_API_KEY bulunamadı, fallback modu kullanılıyor');
      return generateFallbackMessage(diffContent);
    }

    const systemPrompt = 'You are a Git commit message expert. Generate concise, professional commit messages following the Angular convention.';
    const userPrompt = `Analyze this git diff and generate a commit message.

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
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.5,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return parseAIResponse(content);
    } catch (error) {
      console.error('Groq API Error:', error.message);

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('Geçersiz API anahtarı.');
      } else if (error.message.includes('429') || error.message.includes('rate')) {
        console.error('Rate limit aşıldı.');
      }

      return generateFallbackMessage(diffContent);
    }
  }
};

function parseAIResponse(content) {
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

  let type = 'chore';
  if (/\btest\b|spec|\.test\.|\.spec\./.test(diff)) type = 'test';
  else if (/doc|readme|comment|\.md|documentation/.test(lower)) type = 'docs';
  else if (/refactor|reorganize|simplify|cleanup|rewrite/.test(lower)) type = 'refactor';
  else if (/style|format|whitespace|indent|prettier|lint/.test(lower)) type = 'style';
  else if (/perf|optim|cache|speed|fast|slow/.test(lower)) type = 'perf';
  else if (/bug|fix|error|issue|resolve|patch|broken/.test(lower)) type = 'fix';
  else if (/feature|add|new|implement|create|support/.test(lower)) type = 'feat';

  const fileCount = (diff.match(/^diff --git/gm) || []).length || 1;
  const additions = (diff.match(/^\+[^+]/gm) || []).length;
  const deletions = (diff.match(/^-[^-]/gm) || []).length;

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

module.exports = groqApi;
