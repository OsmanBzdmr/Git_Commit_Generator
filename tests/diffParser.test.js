const diffParser = require('../src/diffParser');

describe('Diff Parser', () => {
  describe('parseDiff', () => {
    test('should parse single file diff with additions and deletions', () => {
      const diff = `diff --git a/test.js b/test.js
index 123..456 100644
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
-old code
+new code
+console.log('test');`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.filesChanged).toBe(1);
      expect(stats.files).toEqual(['test.js']);
      expect(stats.additions).toBe(2);
      expect(stats.deletions).toBe(1);
    });

    test('should return zero stats for empty diff', () => {
      const stats = diffParser.parseDiff('');
      expect(stats.filesChanged).toBe(0);
      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(0);
      expect(stats.files).toEqual([]);
    });

    test('should handle multi-file diff', () => {
      const diff = `diff --git a/src/a.js b/src/a.js
--- a/src/a.js
+++ b/src/a.js
@@ -1 +1,2 @@
 old
+new
diff --git a/src/b.js b/src/b.js
--- a/src/b.js
+++ b/src/b.js
@@ -1 +1 @@
-older
+newer`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.filesChanged).toBe(2);
      expect(stats.files).toEqual(['src/a.js', 'src/b.js']);
      expect(stats.additions).toBe(2);
      expect(stats.deletions).toBe(1);
    });

    test('should handle new file (diff to /dev/null)', () => {
      const diff = `diff --git a/dev/null b/newfile.js
new file mode 100644
--- /dev/null
+++ b/newfile.js
@@ -0,0 +1 @@
+new content`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.filesChanged).toBe(1);
      expect(stats.files).toEqual(['newfile.js']);
      expect(stats.additions).toBe(1);
      expect(stats.deletions).toBe(0);
    });

    test('should handle deleted file', () => {
      const diff = `diff --git a/deleted.js b/deleted.js
deleted file mode 100644
--- a/deleted.js
+++ /dev/null
@@ -1 +0,0 @@
-old content`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.filesChanged).toBe(1);
      expect(stats.files).toEqual(['deleted.js']);
      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(1);
    });

    test('should handle diff with only additions', () => {
      const diff = `diff --git a/file.js b/file.js
--- a/file.js
+++ b/file.js
@@ -0,0 +1,2 @@
+new line 1
+new line 2`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.filesChanged).toBe(1);
      expect(stats.additions).toBe(2);
      expect(stats.deletions).toBe(0);
    });

    test('should handle diff with only deletions', () => {
      const diff = `diff --git a/file.js b/file.js
--- a/file.js
+++ b/file.js
@@ -1,2 +0,0 @@
-old line 1
-old line 2`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.filesChanged).toBe(1);
      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(2);
    });

    test('should not count +++ and --- lines as additions/deletions', () => {
      const diff = `diff --git a/file.js b/file.js
--- a/file.js
+++ b/file.js
@@ -1 +1,2 @@
-old
+new
+extra`;

      const stats = diffParser.parseDiff(diff);
      expect(stats.additions).toBe(2);
      expect(stats.deletions).toBe(1);
    });

    test('should handle diff without diff --git lines', () => {
      const stats = diffParser.parseDiff('just some text\n+addition\n-deletion');
      expect(stats.filesChanged).toBe(0);
      expect(stats.additions).toBe(1);
      expect(stats.deletions).toBe(1);
      expect(stats.files).toEqual([]);
    });

    test('should handle null input gracefully', () => {
      const stats = diffParser.parseDiff(null);
      expect(stats.filesChanged).toBe(0);
      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(0);
      expect(stats.files).toEqual([]);
    });

    test('should handle undefined input gracefully', () => {
      const stats = diffParser.parseDiff(undefined);
      expect(stats.filesChanged).toBe(0);
      expect(stats.additions).toBe(0);
      expect(stats.deletions).toBe(0);
      expect(stats.files).toEqual([]);
    });
  });
});
