const examParser = {
  /**
   * Detects if input is exam format (Turkish multiple choice question)
   * Checks for patterns like:
   * - @@ markers with question content
   * - Answer options starting with - A), - B), etc.
   */
  isExamFormat(content) {
    const hasExamMarkers = /@@ .+?(?:@@|$)/s.test(content);
    const hasAnswerOptions = /^\s*-\s*[A-Z]\)/m.test(content);
    const hasQuestionPattern = /(?:Soru|Soru:|Sınav|Exam|Test|Cevap)/i.test(content);
    
    // Multiple options without @@ markers can still be exam format
    const optionCount = (content.match(/^\s*-\s*[A-Z]\)/gm) || []).length;
    const isMultipleChoice = optionCount >= 3;
    
    return (hasExamMarkers && hasAnswerOptions) || (hasAnswerOptions && hasQuestionPattern) || isMultipleChoice;
  },

  /**
   * Parses Turkish exam format and extracts question, options, and duplicate detection
   * Returns structured data for AI to analyze
   */
  parseExam(content) {
    const lines = content.split('\n');
    let questionContent = '';
    const options = {};
    const duplicates = [];
    let currentOption = null;
    let inQuestion = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect question section (between @@ markers)
      if (line.startsWith('@@')) {
        inQuestion = true;
        // Extract question content from @@ line
        const questionPart = line.replace(/^@@.*?@@/, '').trim();
        if (questionPart) {
          questionContent += questionPart + '\n';
        }
        continue;
      }

      // Parse answer options (A, B, C, D, etc.)
      const optionMatch = line.match(/^[\s\t]*-?\s*([A-Z])\)\s*(.+?)$/);
      if (optionMatch) {
        const [, letter, optionText] = optionMatch;
        
        // Check for duplicate option text (exact match)
        if (options[letter]) {
          duplicates.push({
            letter,
            option: optionText.trim(),
            isDuplicate: true
          });
        } else {
          options[letter] = optionText.trim();
        }
        
        currentOption = letter;
        inQuestion = false;
        continue;
      }

      // Continue reading question content if in question section
      if (inQuestion && line.trim() && !line.match(/^[\s\t]*-\s*[A-Z]\)/)) {
        questionContent += line + '\n';
      }
    }

    return {
      format: 'exam',
      question: questionContent.trim(),
      options,
      duplicateOptions: duplicates,
      hasDuplicates: duplicates.length > 0,
      optionCount: Object.keys(options).length,
      rawInput: content
    };
  },

  /**
   * Generates summary about the exam structure
   */
  generateExamSummary(parsed) {
    const summary = {
      type: 'exam_analysis',
      subject: 'Multiple Choice Question Analysis',
      findings: []
    };

    // Basic structure info
    summary.findings.push(`Question Format: Turkish Multiple Choice`);
    summary.findings.push(`Total Options: ${parsed.optionCount}`);
    summary.findings.push(`Question Length: ${parsed.question ? parsed.question.length : 0} characters`);

    // Check for duplicates
    if (parsed.hasDuplicates) {
      summary.findings.push(`⚠️ DUPLICATE OPTIONS DETECTED: ${parsed.duplicateOptions.length}`);
      parsed.duplicateOptions.forEach(dup => {
        summary.findings.push(`   • Option ${dup.letter}: "${dup.option.substring(0, 50)}..."`);
      });
    }

    // Check for format consistency
    if (parsed.options) {
      const optionLetters = Object.keys(parsed.options);
      const expectedSequence = optionLetters.every((letter, i) => 
        letter === String.fromCharCode(65 + i)
      );
      
      if (!expectedSequence && optionLetters.length > 1) {
        summary.findings.push(`⚠️ Options not in sequential order: ${optionLetters.join(', ')}`);
      }
    }

    return summary;
  }
};

module.exports = examParser;
