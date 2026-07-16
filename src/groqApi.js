const { generateFallbackMessage } = require('./fallbackGenerator');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const groqApi = {
  async generateCommitMessage(diffContent) {
    const MAX_CHARS = 4000;
    if (diffContent.length > MAX_CHARS) {
      diffContent = diffContent.slice(0, MAX_CHARS) + '\n... (truncated)';
      process.stderr.write('(diff truncated to ' + MAX_CHARS + ' chars)\n');
    }

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
- If the change is breaking (API/contract changes), set BREAKING to yes

Respond in this exact format:
TYPE: feat|fix|docs|refactor|test|chore|style|perf
BREAKING: yes|no
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

      if (/401|Unauthorized/i.test(error.message)) {
        console.error('Geçersiz API anahtarı.');
      } else if (/429|rate/i.test(error.message)) {
        console.error('Rate limit aşıldı.');
      }

      return generateFallbackMessage(diffContent);
    }
  }
};

function parseAIResponse(content) {
  const typeMatch = content.match(/TYPE:\s*(\w+)/i);
  const breakingMatch = content.match(/BREAKING:\s*(yes|no)/i);
  const messageMatch = content.match(/MESSAGE:\s*(.+?)(?:\n|$)/i);
  const bodyMatch = content.match(/BODY:\s*([\s\S]*?)(?=\n\w+:|$)/i);

  let type = typeMatch ? typeMatch[1].toLowerCase() : 'chore';
  if (breakingMatch && breakingMatch[1].toLowerCase() === 'yes') {
    type += '!';
  }

  return {
    type,
    message: messageMatch ? messageMatch[1].trim() : 'Update code',
    description: bodyMatch ? bodyMatch[1].trim() : ''
  };
}

module.exports = groqApi;
