document.addEventListener('DOMContentLoaded', async () => {
  const defaultDictionarySelect = document.getElementById('default-dictionary');
  const fallbackDictionarySelect = document.getElementById('fallback-dictionary');
  const tabBehaviorSelect = document.getElementById('tab-behavior');
  const historyEnabledToggle = document.getElementById('history-enabled');
  const clearHistoryBtn = document.getElementById('clear-history');
  const dictionariesList = document.getElementById('dictionaries-list');
  const addDictionaryBtn = document.getElementById('add-dictionary');
  const exportBtn = document.getElementById('export-settings');
  const importBtn = document.getElementById('import-settings');
  const importFile = document.getElementById('import-file');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalSave = document.getElementById('modal-save');
  const dictNameInput = document.getElementById('dict-name');
  const dictUrlInput = document.getElementById('dict-url');
  const dictIconInput = document.getElementById('dict-icon');
  const toast = document.getElementById('toast');
  
  let editingDictionaryId = null;
  let draggedItem = null;
  
  await loadSettings();
  
  async function getSettings() {
    const result = await chrome.storage.local.get('settings');
    return result.settings || getDefaultSettings();
  }
  
  function getDefaultSettings() {
    return {
      defaultDictionary: null,
      fallbackDictionary: null,
      tabBehavior: 'new',
      historyEnabled: false,
      firstRun: true,
      dictionaries: getDefaultDictionaries(),
      searchHistory: []
    };
  }
  
  function getDefaultDictionaries() {
    return [
      { id: 'merriam-webster', name: 'Merriam-Webster', url: 'https://www.merriam-webster.com/dictionary/{word}', enabled: true, builtin: true },
      { id: 'oxford', name: 'Oxford', url: 'https://www.oxfordlearnersdictionaries.com/definition/english/{word}', enabled: true, builtin: true },
      { id: 'cambridge', name: 'Cambridge', url: 'https://dictionary.cambridge.org/dictionary/english/{word}', enabled: true, builtin: true },
      { id: 'dictionary-com', name: 'Dictionary.com', url: 'https://www.dictionary.com/browse/{word}', enabled: true, builtin: true },
      { id: 'urban-dictionary', name: 'Urban Dictionary', url: 'https://www.urbandictionary.com/define.php?term={word}', enabled: true, builtin: true },
      { id: 'wiktionary', name: 'Wiktionary', url: 'https://en.wiktionary.org/wiki/{word}', enabled: true, builtin: true },
      { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=define+{word}', enabled: true, builtin: true },
      { id: 'collins', name: 'Collins Dictionary', url: 'https://www.collinsdictionary.com/dictionary/english/{word}', enabled: true, builtin: true },
      { id: 'longman', name: 'Longman Dictionary', url: 'https://www.ldoceonline.com/dictionary/{word}', enabled: true, builtin: true },
      { id: 'vocabulary', name: 'Vocabulary.com', url: 'https://www.vocabulary.com/dictionary/{word}', enabled: true, builtin: true },
      { id: 'free-dictionary', name: 'The Free Dictionary', url: 'https://www.thefreedictionary.com/{word}', enabled: true, builtin: true },
      { id: 'yourdictionary', name: 'YourDictionary', url: 'https://www.yourdictionary.com/{word}', enabled: true, builtin: true },
      { id: 'wordreference', name: 'WordReference', url: 'https://www.wordreference.com/definition/{word}', enabled: true, builtin: true },
      { id: 'onelook', name: 'OneLook Dictionary Search', url: 'https://www.onelook.com/?w={word}', enabled: true, builtin: true },
      { id: 'etymonline', name: 'Etymonline', url: 'https://www.etymonline.com/word/{word}', enabled: true, builtin: true },
      { id: 'rhymezone', name: 'RhymeZone', url: 'https://www.rhymezone.com/r/rhyme.cgi?Word={word}&typeofrhyme=def', enabled: true, builtin: true }
    ];
  }
  
  async function saveSettings(settings) {
    await chrome.storage.local.set({ settings });
    chrome.runtime.sendMessage({ action: 'refreshMenus' });
  }
  
  async function loadSettings() {
    const settings = await getSettings();
    
    tabBehaviorSelect.value = settings.tabBehavior;
    historyEnabledToggle.checked = settings.historyEnabled;
    
    await renderDictionarySelects(settings);
    await renderDictionariesList(settings);
  }
  
  async function renderDictionarySelects(settings) {
    const enabledDicts = settings.dictionaries.filter(d => d.enabled);
    
    defaultDictionarySelect.innerHTML = '<option value="">Select default...</option>';
    fallbackDictionarySelect.innerHTML = '<option value="">None</option>';
    
    for (const dict of enabledDicts) {
      const option1 = document.createElement('option');
      option1.value = dict.id;
      option1.textContent = dict.name;
      if (dict.id === settings.defaultDictionary) option1.selected = true;
      defaultDictionarySelect.appendChild(option1);
      
      const option2 = document.createElement('option');
      option2.value = dict.id;
      option2.textContent = dict.name;
      if (dict.id === settings.fallbackDictionary) option2.selected = true;
      fallbackDictionarySelect.appendChild(option2);
    }
  }
  
  async function renderDictionariesList(settings) {
    dictionariesList.innerHTML = '';
    
    for (const dict of settings.dictionaries) {
      const item = document.createElement('div');
      item.className = 'dictionary-item';
      item.draggable = true;
      item.dataset.id = dict.id;
      
      item.innerHTML = `
        <div class="drag-handle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="2"></circle>
            <circle cx="15" cy="6" r="2"></circle>
            <circle cx="9" cy="12" r="2"></circle>
            <circle cx="15" cy="12" r="2"></circle>
            <circle cx="9" cy="18" r="2"></circle>
            <circle cx="15" cy="18" r="2"></circle>
          </svg>
        </div>
        <div class="dictionary-info">
          <span class="dictionary-name">${escapeHtml(dict.name)}</span>
          <span class="dictionary-url">${escapeHtml(dict.url)}</span>
        </div>
        <span class="dictionary-badge ${dict.builtin ? '' : 'custom'}">${dict.builtin ? 'Built-in' : 'Custom'}</span>
        <div class="dictionary-actions">
          ${!dict.builtin ? `
            <button class="btn-icon edit-btn" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon danger delete-btn" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"></path>
              </svg>
            </button>
          ` : ''}
          <label class="toggle">
            <input type="checkbox" class="enable-toggle" ${dict.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      `;
      
      item.querySelector('.enable-toggle').addEventListener('change', async (e) => {
        const settings = await getSettings();
        const dictIndex = settings.dictionaries.findIndex(d => d.id === dict.id);
        if (dictIndex !== -1) {
          settings.dictionaries[dictIndex].enabled = e.target.checked;
          await saveSettings(settings);
          await renderDictionarySelects(settings);
        }
      });
      
      const editBtn = item.querySelector('.edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => openEditModal(dict));
      }
      
      const deleteBtn = item.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (confirm(`Delete "${dict.name}"?`)) {
            const settings = await getSettings();
            settings.dictionaries = settings.dictionaries.filter(d => d.id !== dict.id);
            await saveSettings(settings);
            await loadSettings();
            showToast('Dictionary deleted', 'success');
          }
        });
      }
      
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragend', handleDragEnd);
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('drop', handleDrop);
      item.addEventListener('dragleave', handleDragLeave);
      
      dictionariesList.appendChild(item);
    }
  }
  
  function handleDragStart(e) {
    draggedItem = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }
  
  function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.dictionary-item').forEach(item => {
      item.classList.remove('drag-over');
    });
    draggedItem = null;
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.currentTarget !== draggedItem) {
      e.currentTarget.classList.add('drag-over');
    }
  }
  
  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }
  
  async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedItem === e.currentTarget) return;
    
    const items = [...dictionariesList.querySelectorAll('.dictionary-item')];
    const fromIndex = items.indexOf(draggedItem);
    const toIndex = items.indexOf(e.currentTarget);
    
    const settings = await getSettings();
    const [movedItem] = settings.dictionaries.splice(fromIndex, 1);
    settings.dictionaries.splice(toIndex, 0, movedItem);
    
    await saveSettings(settings);
    await renderDictionariesList(settings);
    showToast('Order updated', 'success');
  }
  
  defaultDictionarySelect.addEventListener('change', async () => {
    const settings = await getSettings();
    settings.defaultDictionary = defaultDictionarySelect.value || null;
    await saveSettings(settings);
  });
  
  fallbackDictionarySelect.addEventListener('change', async () => {
    const settings = await getSettings();
    settings.fallbackDictionary = fallbackDictionarySelect.value || null;
    await saveSettings(settings);
  });
  
  tabBehaviorSelect.addEventListener('change', async () => {
    const settings = await getSettings();
    settings.tabBehavior = tabBehaviorSelect.value;
    await saveSettings(settings);
  });
  
  historyEnabledToggle.addEventListener('change', async () => {
    const settings = await getSettings();
    settings.historyEnabled = historyEnabledToggle.checked;
    await saveSettings(settings);
  });
  
  clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Clear all search history?')) {
      const settings = await getSettings();
      settings.searchHistory = [];
      await saveSettings(settings);
      showToast('History cleared', 'success');
    }
  });
  
  addDictionaryBtn.addEventListener('click', () => {
    editingDictionaryId = null;
    modalTitle.textContent = 'Add Custom Dictionary';
    dictNameInput.value = '';
    dictUrlInput.value = '';
    dictIconInput.value = '';
    modalOverlay.classList.remove('hidden');
    dictNameInput.focus();
  });
  
  function openEditModal(dict) {
    editingDictionaryId = dict.id;
    modalTitle.textContent = 'Edit Dictionary';
    dictNameInput.value = dict.name;
    dictUrlInput.value = dict.url;
    dictIconInput.value = dict.icon || '';
    modalOverlay.classList.remove('hidden');
    dictNameInput.focus();
  }
  
  function closeModal() {
    modalOverlay.classList.add('hidden');
    editingDictionaryId = null;
  }
  
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  modalSave.addEventListener('click', async () => {
    const name = dictNameInput.value.trim();
    const url = dictUrlInput.value.trim();
    const icon = dictIconInput.value.trim();
    
    if (!name || !url) {
      showToast('Name and URL are required', 'error');
      return;
    }
    
    if (!url.includes('{word}')) {
      showToast('URL must contain {word} placeholder', 'error');
      return;
    }
    
    const settings = await getSettings();
    
    if (editingDictionaryId) {
      const dictIndex = settings.dictionaries.findIndex(d => d.id === editingDictionaryId);
      if (dictIndex !== -1) {
        settings.dictionaries[dictIndex].name = name;
        settings.dictionaries[dictIndex].url = url;
        settings.dictionaries[dictIndex].icon = icon || null;
      }
      showToast('Dictionary updated', 'success');
    } else {
      settings.dictionaries.push({
        id: `custom-${Date.now()}`,
        name,
        url,
        icon: icon || null,
        enabled: true,
        builtin: false
      });
      showToast('Dictionary added', 'success');
    }
    
    await saveSettings(settings);
    await loadSettings();
    closeModal();
  });
  
  exportBtn.addEventListener('click', async () => {
    const settings = await getSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quick-define-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported', 'success');
  });
  
  importBtn.addEventListener('click', () => {
    importFile.click();
  });
  
  importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const settings = JSON.parse(text);
      await saveSettings(settings);
      await loadSettings();
      showToast('Settings imported', 'success');
    } catch (err) {
      showToast('Invalid settings file', 'error');
    }
    
    importFile.value = '';
  });
  
  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});

