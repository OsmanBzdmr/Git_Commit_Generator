const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dbDir, 'commits.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeSchema();
  }
});

const initializeSchema = () => {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  db.exec(schema, (err) => {
    if (err) {
      console.error('Schema initialization error:', err);
    }
  });
};

const getCommitHistory = (callback) => {
  db.all('SELECT * FROM commits ORDER BY created_at DESC LIMIT 50', callback);
};

const saveCommit = (diffInput, generatedMessage, messageType, stats = {}, callback) => {
  const stmt = db.prepare(`
    INSERT INTO commits (diff_input, generated_message, message_type, files_changed, additions, deletions)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    diffInput,
    generatedMessage,
    messageType,
    stats.filesChanged || 0,
    stats.additions || 0,
    stats.deletions || 0,
    callback
  );
  
  stmt.finalize();
};

module.exports = {
  db,
  getCommitHistory,
  saveCommit
};
