document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const dictionarySelect = document.getElementById('dictionary-select');
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const settingsLink = document.getElementById('settings-link');
  
  await loadDictionaries();
  await loadHistory();
  
  searchInput.focus();
  
  async function loadDictionaries() {
    const settings = await getSettings();
    const dictionaries = settings.dictionaries.filter(d => d.enabled);
    
    dictionarySelect.innerHTML = '<option value="">Default Dictionary</option>';
    
    for (const dict of dictionaries) {
      const option = document.createElement('option');
      option.value = dict.id;
      option.textContent = dict.name;
      if (dict.id === settings.defaultDictionary) {
        option.selected = true;
      }
      dictionarySelect.appendChild(option);
    }
  }
  
  async function loadHistory() {
    const settings = await getSettings();
    
    if (!settings.historyEnabled || !settings.searchHistory?.length) {
      historySection.classList.add('hidden');
      return;
    }
    
    historySection.classList.remove('hidden');
    historyList.innerHTML = '';
    
    const recentHistory = settings.searchHistory.slice(0, 5);
    const dictionaries = settings.dictionaries;
    
    for (const entry of recentHistory) {
      const li = document.createElement('li');
      const dict = dictionaries.find(d => d.id === entry.dictionaryId);
      
      li.innerHTML = `
        <span class="word">${escapeHtml(entry.word)}</span>
        <span class="dict-name">${dict ? dict.name : 'Unknown'}</span>
      `;
      
      li.addEventListener('click', () => {
        searchWord(entry.word, entry.dictionaryId);
      });
      
      historyList.appendChild(li);
    }
  }
  
  async function searchWord(word, dictionaryId) {
    if (!word.trim()) return;
    
    chrome.runtime.sendMessage({
      action: 'searchWord',
      word: word.trim(),
      dictionaryId: dictionaryId || dictionarySelect.value || null
    }, () => {
      window.close();
    });
  }
  
  searchBtn.addEventListener('click', () => {
    searchWord(searchInput.value);
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchWord(searchInput.value);
    }
  });
  
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  
  async function getSettings() {
    const result = await chrome.storage.local.get('settings');
    return result.settings || {
      dictionaries: [],
      historyEnabled: false,
      searchHistory: [],
      defaultDictionary: null
    };
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

