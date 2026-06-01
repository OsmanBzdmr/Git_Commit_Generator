const express = require('express');
const router = express.Router();
const ollamaApi = require('../src/ollamaApi');
const diffParser = require('../src/diffParser');
const examParser = require('../src/examParser');
const msgFormatter = require('../src/msgFormatter');
const { saveCommit, getCommitHistory } = require('../src/database');

// Generate response from diff or exam format
router.post('/api/generate-message', async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff || diff.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Content is required',
        message: 'Please paste your git diff or exam question'
      });
    }

    // Detect input format
    const isExam = examParser.isExamFormat(diff);
    let result;

    if (isExam) {
      // Handle exam format
      const parsed = examParser.parseExam(diff);
      const examSummary = examParser.generateExamSummary(parsed);
      
      result = {
        inputFormat: 'exam',
        analysisType: examSummary.type,
        subject: examSummary.subject,
        findings: examSummary.findings,
        parsed: {
          question: parsed.question,
          options: parsed.options,
          hasDuplicates: parsed.hasDuplicates,
          duplicateCount: parsed.duplicateOptions.length
        },
        message: `Exam Question Analysis: ${examSummary.findings[0]}`,
        type: 'analysis'
      };
    } else {
      // Handle git diff format
      const stats = diffParser.parseDiff(diff);
      const aiResult = await ollamaApi.generateCommitMessage(diff);
      
      const formattedMessage = msgFormatter.formatCommitMessage(
        aiResult.type,
        aiResult.message,
        aiResult.description
      );

      // Save to database
      saveCommit(diff, formattedMessage, aiResult.type, stats, (err) => {
        if (err) {
          console.error('Database save error:', err);
        }
      });

      result = {
        inputFormat: 'diff',
        success: true,
        type: aiResult.type,
        message: aiResult.message,
        description: aiResult.description,
        formatted: formattedMessage,
        stats: stats
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Failed to process input',
      details: error.message
    });
  }
});

// Get commit history
router.get('/api/history', (req, res) => {
  getCommitHistory((err, rows) => {
    if (err) {
      return res.status(500).json({
        error: 'Failed to fetch history',
        details: err.message
      });
    }
    res.json({ 
      success: true, 
      commits: rows || [],
      total: rows ? rows.length : 0
    });
  });
});

// Health check
router.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Git Commit Generator is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
