const express = require('express');
const router = express.Router();
const grokApi = require('../src/groqApi');
const diffParser = require('../src/diffParser');
const msgFormatter = require('../src/msgFormatter');
const { saveCommit, getCommitHistory } = require('../src/database');

// Generate commit message from diff
router.post('/api/generate-message', async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff || diff.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Diff content is required',
        message: 'Please paste your git diff output'
      });
    }

    // Parse diff stats
    const stats = diffParser.parseDiff(diff);

    // Call AI API (with fallback built-in)
    const result = await grokApi.generateCommitMessage(diff);
    
    const formattedMessage = msgFormatter.formatCommitMessage(
      result.type,
      result.message,
      result.description
    );

    // Save to database
    saveCommit(diff, formattedMessage, result.type, stats, (err) => {
      if (err) {
        console.error('Database save error:', err);
      }
    });

    res.json({
      success: true,
      type: result.type,
      message: result.message,
      description: result.description,
      formatted: formattedMessage,
      stats: stats
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate commit message',
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
