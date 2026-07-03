const path = require('path');
const fs = require('fs');

// Use process.env to signal test mode to database module
process.env.NODE_ENV = 'test';

const database = require('../src/database');

describe('Database', () => {
  afterAll((done) => {
    database.db.close(() => {
      // Clean up test database if we created one
      done();
    });
  });

  test('should have db object', () => {
    expect(database.db).toBeDefined();
  });

  test('should have getCommitHistory function', () => {
    expect(typeof database.getCommitHistory).toBe('function');
  });

  test('should have saveCommit function', () => {
    expect(typeof database.saveCommit).toBe('function');
  });

  test('should save and retrieve a commit', (done) => {
    database.saveCommit('test diff content', 'feat: test message', 'feat', {
      filesChanged: 2,
      additions: 10,
      deletions: 3
    });

    setTimeout(async () => {
      try {
        const commits = await database.getCommitHistory();
        expect(commits.length).toBeGreaterThan(0);

        const saved = commits.find(c => c.diff_input === 'test diff content');
        expect(saved).toBeDefined();
        done();
      } catch (err) {
        done(err);
      }
    }, 200);
  }, 5000);

  test('getCommitHistory returns an array', async () => {
    const commits = await database.getCommitHistory();
    expect(Array.isArray(commits)).toBe(true);
  });

  test('returned commits have expected fields', async () => {
    const commits = await database.getCommitHistory();
    if (commits.length > 0) {
      const commit = commits[0];
      expect(commit).toHaveProperty('id');
      expect(commit).toHaveProperty('diff_input');
      expect(commit).toHaveProperty('generated_message');
      expect(commit).toHaveProperty('message_type');
      expect(commit).toHaveProperty('files_changed');
      expect(commit).toHaveProperty('additions');
      expect(commit).toHaveProperty('deletions');
      expect(commit).toHaveProperty('created_at');
    }
  });

  test('handles undefined stats gracefully', (done) => {
    database.saveCommit('undefined stats test', 'docs: test', 'docs');

    setTimeout(async () => {
      try {
        const commits = await database.getCommitHistory();
        const saved = commits.find(c => c.diff_input === 'undefined stats test');
        expect(saved).toBeDefined();
        expect(saved.files_changed).toBe(0);
        expect(saved.additions).toBe(0);
        expect(saved.deletions).toBe(0);
        done();
      } catch (err) {
        done(err);
      }
    }, 200);
  }, 5000);
});
