// ============ DOM ELEMENTS ============
const generateBtn = document.getElementById('generateBtn');
const diffInput = document.getElementById('diffInput');
const resultSection = document.getElementById('resultSection');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const historyDrawerBtn = document.getElementById('historyDrawerBtn');
const historyDrawer = document.getElementById('historyDrawer');
const closeDrawer = document.getElementById('closeDrawer');
const newMessageBtn = document.getElementById('newMessageBtn');

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  loadHistory();
  setupEventListeners();
});

// ============ EVENT LISTENERS ============
function setupEventListeners() {
  generateBtn.addEventListener('click', generateMessage);
  themeToggle.addEventListener('click', toggleTheme);
  historyDrawerBtn.addEventListener('click', () => historyDrawer.classList.add('open'));
  closeDrawer.addEventListener('click', () => historyDrawer.classList.remove('open'));
  diffInput.addEventListener('input', updateCharCount);
  
  if (newMessageBtn) {
    newMessageBtn.addEventListener('click', () => {
      diffInput.focus();
      diffInput.select();
    });
  }

  // Close drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.history-drawer') && !e.target.closest('#historyDrawerBtn')) {
      historyDrawer.classList.remove('open');
    }
  });
}

// ============ THEME MANAGEMENT ============
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
  
  showToast(`Switched to ${newTheme} mode`, 'info');
}

function updateThemeIcon(theme) {
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ============ CHAR COUNT ============
function updateCharCount() {
  const count = diffInput.value.length;
  const charCountEl = document.getElementById('charCount');
  if (charCountEl) {
    charCountEl.textContent = count;
  }
  
  if (count > 5000) {
    diffInput.value = diffInput.value.substring(0, 5000);
  }
}

// ============ GENERATE MESSAGE ============
async function generateMessage() {
  const diff = diffInput.value.trim();

  if (!diff) {
    showToast('Please paste a Git diff first', 'error');
    diffInput.focus();
    return;
  }

  if (diff.length < 10) {
    showToast('Diff is too short. Please paste a complete diff', 'error');
    return;
  }

  loading.style.display = 'flex';
  generateBtn.disabled = true;

  try {
    const response = await fetch('/api/generate-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ diff })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate message');
    }

    displayResult(data);
    loadHistory();
    showToast('✅ Commit message generated successfully!', 'success');
    
  } catch (error) {
    console.error('Error:', error);
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    loading.style.display = 'none';
    generateBtn.disabled = false;
  }
}

// ============ DISPLAY RESULT ============
function displayResult(data) {
  const typeClass = `type-${data.type}`;
  
  // Update type badge
  const msgTypeEl = document.getElementById('msgType');
  msgTypeEl.className = `type-badge ${typeClass}`;
  msgTypeEl.textContent = data.type.toUpperCase();
  
  // Update type explanation
  const typeExplEl = document.getElementById('typeExpl');
  const typeExplanations = {
    'feat': 'A new feature',
    'fix': 'A bug fix',
    'docs': 'Documentation only',
    'style': 'Code style changes',
    'refactor': 'Code refactoring',
    'perf': 'Performance improvement',
    'test': 'Adding tests',
    'chore': 'Build process, dependencies'
  };
  typeExplEl.textContent = typeExplanations[data.type] || '';
  
  // Update message title
  document.getElementById('msgTitle').textContent = data.message;
  
  // Update description if exists
  const descriptionRow = document.getElementById('descriptionRow');
  const msgDescription = document.getElementById('msgDescription');
  if (data.description && data.description.trim()) {
    msgDescription.textContent = data.description;
    descriptionRow.style.display = 'flex';
  } else {
    descriptionRow.style.display = 'none';
  }
  
  // Update formatted message
  document.getElementById('formattedMsg').textContent = data.formatted;
  
  // Update stats
  document.getElementById('statFiles').textContent = data.stats.filesChanged || 0;
  document.getElementById('statAdds').textContent = '+' + (data.stats.additions || 0);
  document.getElementById('statDels').textContent = '-' + (data.stats.deletions || 0);
  
  // Show result section
  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Setup copy button
  const copyBtn = document.getElementById('copyBtn');
  copyBtn.onclick = () => copyToClipboard(data.formatted, copyBtn);
}

// ============ COPY TO CLIPBOARD ============
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="copy-icon">✅</span><span class="copy-text">Copied!</span>';
    btn.classList.add('copied');
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('copied');
    }, 2000);
    
    showToast('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Failed to copy. Please try again', 'error');
  });
}

// ============ LOAD HISTORY ============
async function loadHistory() {
  try {
    const response = await fetch('/api/history');
    const data = await response.json();

    const historyList = document.getElementById('historyList');
    
    if (!data.commits || data.commits.length === 0) {
      historyList.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-secondary);">
          <p style="font-size: 2em; margin-bottom: 8px;">📭</p>
          <p>No commit history yet</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = data.commits.slice(0, 10).map((commit, index) => `
      <div class="history-item" data-index="${index}" title="Click to use this message">
        <div>
          <span class="history-item-type type-${commit.message_type}">${commit.message_type}</span>
          <span class="history-item-time">${formatDate(commit.created_at)}</span>
        </div>
        <div class="history-item-msg">${escapeHtml(commit.generated_message.split('\n')[0])}</div>
      </div>
    `).join('');

    // Add click handlers to history items
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', function() {
        const index = parseInt(this.dataset.index);
        const commit = data.commits[index];
        displayHistoryItem(commit);
      });
    });

  } catch (error) {
    console.error('History loading error:', error);
  }
}

// ============ DISPLAY HISTORY ITEM ============
function displayHistoryItem(commit) {
  const data = {
    type: commit.message_type,
    message: commit.generated_message.split('\n')[0],
    description: commit.generated_message.split('\n').slice(1).join('\n').trim(),
    formatted: commit.generated_message,
    stats: {
      filesChanged: commit.files_changed,
      additions: commit.additions,
      deletions: commit.deletions
    }
  };
  
  displayResult(data);
  historyDrawer.classList.remove('open');
  showToast('History item loaded', 'success');
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info') {
  const toastEl = document.createElement('div');
  toastEl.className = `toast ${type}`;
  toastEl.textContent = message;
  
  toast.appendChild(toastEl);
  
  setTimeout(() => {
    toastEl.remove();
  }, 3000);
}

// ============ UTILITY FUNCTIONS ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && diffInput.value.trim()) {
    generateMessage();
  }
  
  // Ctrl/Cmd + K for theme toggle
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleTheme();
  }
});

// ============ PREVENT PAGE RELOAD ON FORM SUBMIT ============
document.addEventListener('submit', (e) => {
  if (e.target.tagName === 'FORM') {
    e.preventDefault();
  }
});

console.log('✨ Git Commit Generator loaded successfully!');
