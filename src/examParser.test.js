const examParser = require('./examParser');

describe('Exam Format Parser', () => {
  describe('isExamFormat', () => {
    test('should detect Turkish exam format with @@ markers and options', () => {
      const examContent = `@@ -417,20 +417,31 @@ Some context
Soru: Test sorusu
- A) First option
- B) Second option`;

      expect(examParser.isExamFormat(examContent)).toBe(true);
    });

    test('should detect exam format with just options', () => {
      const examContent = `- A) Ag *(Agent)* ve Fc *(Function Call)*
- B) Gr *(Guardrails)* ve Rt *(Red-Team)*
- C) Rg *(RAG)* ve Ft *(Fine-Tune)*
- D) Ma *(Multi-Agent)* ve Sy *(Synthetic)*`;

      expect(examParser.isExamFormat(examContent)).toBe(true);
    });

    test('should not detect diff format as exam', () => {
      const diffContent = `diff --git a/file.txt b/file.txt
+added line
-removed line`;

      expect(examParser.isExamFormat(diffContent)).toBe(false);
    });

    test('should detect format with question keyword', () => {
      const content = `Soru: Hangi seçenek doğru?
- A) Option 1
- B) Option 2`;

      expect(examParser.isExamFormat(content)).toBe(true);
    });
  });

  describe('parseExam', () => {
    test('should parse exam content and extract question and options', () => {
      const examContent = `@@ -417,20 +417,31 @@ Context
Test question content here
- A) First option
- B) Second option
- C) Third option`;

      const result = examParser.parseExam(examContent);

      expect(result.format).toBe('exam');
      expect(result.question).toContain('Test question content here');
      expect(result.options.A).toBe('First option');
      expect(result.options.B).toBe('Second option');
      expect(result.options.C).toBe('Third option');
      expect(result.optionCount).toBe(3);
      expect(result.hasDuplicates).toBe(false);
    });

    test('should detect duplicate options', () => {
      const examContent = `Question?
- A) Same option
- B) Different option
- A) Same option`;

      const result = examParser.parseExam(examContent);

      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicateOptions.length).toBeGreaterThan(0);
      expect(result.duplicateOptions[0].letter).toBe('A');
    });

    test('should handle formatted option text with special characters', () => {
      const examContent = `- A) Ag *(Agent)* ve Fc *(Function Call)*
- B) Gr *(Guardrails)* ve Rt *(Red-Team)*`;

      const result = examParser.parseExam(examContent);

      expect(result.options.A).toBe('Ag *(Agent)* ve Fc *(Function Call)*');
      expect(result.options.B).toBe('Gr *(Guardrails)* ve Rt *(Red-Team)*');
    });
  });

  describe('generateExamSummary', () => {
    test('should generate summary with basic info', () => {
      const parsed = {
        optionCount: 4,
        question: 'Test question',
        hasDuplicates: false,
        duplicateOptions: []
      };

      const summary = examParser.generateExamSummary(parsed);

      expect(summary.subject).toBe('Multiple Choice Question Analysis');
      expect(summary.findings).toContain('Question Format: Turkish Multiple Choice');
      expect(summary.findings).toContain('Total Options: 4');
    });

    test('should include warning for duplicates', () => {
      const parsed = {
        optionCount: 4,
        question: 'Test',
        hasDuplicates: true,
        duplicateOptions: [
          { letter: 'A', option: 'Duplicate option', isDuplicate: true }
        ]
      };

      const summary = examParser.generateExamSummary(parsed);

      expect(summary.findings.some(f => f.includes('DUPLICATE'))).toBe(true);
    });
  });
});
