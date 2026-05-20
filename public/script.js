const generateBtn = document.getElementById('generateBtn');
const diffInput = document.getElementById('diffInput');
const resultSection = document.getElementById('resultSection');
const loading = document.getElementById('loading');

generateBtn.addEventListener('click', generateMessage);

async function generateMessage() {
  const diff = diffInput.value.trim();

  if (!diff) {
    alert('Lütfen Git diff girin');
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
      throw new Error(data.error || 'Hata oluştu');
    }

    displayResult(data);
    loadHistory();
  } catch (error) {
    alert('Hata: ' + error.message);
  } finally {
    loading.style.display = 'none';
    generateBtn.disabled = false;
  }
}

function displayResult(data) {
  const typeClass = `type-${data.type}`;
  
  document.getElementById('msgType').className = `type-badge ${typeClass}`;
  document.getElementById('msgType').textContent = data.type.toUpperCase();
  
  document.getElementById('msgTitle').textContent = data.message;
  document.getElementById('msgDescription').textContent = data.description || '(Açıklama yok)';
  document.getElementById('formattedMsg').textContent = data.formatted;
  
  document.getElementById('statFiles').textContent = data.stats.filesChanged;
  document.getElementById('statAdds').textContent = '+' + data.stats.additions;
  document.getElementById('statDels').textContent = '-' + data.stats.deletions;
  
  resultSection.style.display = 'block';
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Copy button
  const copyBtn = document.getElementById('copyBtn');
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(data.formatted);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Kopyalandı!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  };
}

async function loadHistory() {
  try {
    const response = await fetch('/api/history');
    const data = await response.json();

    const historyList = document.getElementById('historyList');
    
    if (!data.commits || data.commits.length === 0) {
      historyList.innerHTML = '<p style="color: #999;">Henüz commit kaydı yok</p>';
      return;
    }

    historyList.innerHTML = data.commits.slice(0, 5).map(commit => `
      <div class="history-item">
        <div>
          <span class="history-item-type type-${commit.message_type}">${commit.message_type}</span>
          <span class="history-item-time">${new Date(commit.created_at).toLocaleString('tr-TR')}</span>
        </div>
        <div class="history-item-msg">${escapeHtml(commit.generated_message.split('\n')[0])}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('History loading error:', error);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load history on page load
loadHistory();
