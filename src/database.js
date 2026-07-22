const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const dbDir = path.join(__dirname, '..', 'data');
const dbPath = process.env.DB_PATH || path.join(dbDir, 'commits.db');

if (dbPath !== ':memory:' && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
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

const getCommitHistory = promisify(db.all.bind(db, 'SELECT * FROM commits ORDER BY created_at DESC LIMIT 50'));

const saveCommit = (diffInput, generatedMessage, messageType, stats) => {
  const safeStats = stats || {};
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO commits (diff_input, generated_message, message_type, files_changed, additions, deletions)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      diffInput || '',
      generatedMessage,
      messageType,
      safeStats.filesChanged || 0,
      safeStats.additions || 0,
      safeStats.deletions || 0,
      (err) => {
        if (err) {
          console.error('Commit kaydedilemedi:', err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );

    stmt.finalize();
  });
};

module.exports = {
  db,
  getCommitHistory,
  saveCommit
};
