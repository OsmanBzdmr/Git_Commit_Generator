const express = require('express');
const router = express.Router();
const groqApi = require('../src/groqApi');
const diffParser = require('../src/diffParser');
const msgFormatter = require('../src/msgFormatter');
const { saveCommit, getCommitHistory } = require('../src/database');

router.post('/api/generate-message', async (req, res) => {
  try {
    const { diff } = req.body;

    if (!diff || diff.trim().length === 0) {
      return res.status(400).json({
        error: 'Content is required',
        message: 'Please paste your git diff'
      });
    }

    const stats = diffParser.parseDiff(diff);
    const aiResult = await groqApi.generateCommitMessage(diff);

    const formattedMessage = msgFormatter.format(
      aiResult.type,
      aiResult.message,
      aiResult.description
    );

    saveCommit(diff, formattedMessage, aiResult.type, stats);

    res.json({
      success: true,
      type: aiResult.type,
      message: aiResult.message,
      description: aiResult.description,
      formatted: formattedMessage,
      stats: stats
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Failed to process input',
      details: error.message
    });
  }
});

router.get('/api/history', async (req, res) => {
  try {
    const commits = await getCommitHistory();
    res.json({
      success: true,
      commits: commits || [],
      total: commits ? commits.length : 0
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch history',
      details: err.message
    });
  }
});

router.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Git Commit Generator is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
