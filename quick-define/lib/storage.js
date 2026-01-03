const DEFAULT_DICTIONARIES = [
  {
    id: 'merriam-webster',
    name: 'Merriam-Webster',
    url: 'https://www.merriam-webster.com/dictionary/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'oxford',
    name: 'Oxford',
    url: 'https://www.oxfordlearnersdictionaries.com/definition/english/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'cambridge',
    name: 'Cambridge',
    url: 'https://dictionary.cambridge.org/dictionary/english/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'dictionary-com',
    name: 'Dictionary.com',
    url: 'https://www.dictionary.com/browse/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'urban-dictionary',
    name: 'Urban Dictionary',
    url: 'https://www.urbandictionary.com/define.php?term={word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'wiktionary',
    name: 'Wiktionary',
    url: 'https://en.wiktionary.org/wiki/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=define+{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'collins',
    name: 'Collins Dictionary',
    url: 'https://www.collinsdictionary.com/dictionary/english/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'longman',
    name: 'Longman Dictionary',
    url: 'https://www.ldoceonline.com/dictionary/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'macmillan',
    name: 'Macmillan Dictionary',
    url: 'https://www.macmillandictionary.com/dictionary/british/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary.com',
    url: 'https://www.vocabulary.com/dictionary/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'free-dictionary',
    name: 'The Free Dictionary',
    url: 'https://www.thefreedictionary.com/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'yourdictionary',
    name: 'YourDictionary',
    url: 'https://www.yourdictionary.com/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'wordreference',
    name: 'WordReference',
    url: 'https://www.wordreference.com/definition/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'onelook',
    name: 'OneLook Dictionary Search',
    url: 'https://www.onelook.com/?w={word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'etymonline',
    name: 'Etymonline',
    url: 'https://www.etymonline.com/word/{word}',
    enabled: true,
    builtin: true
  },
  {
    id: 'rhymezone',
    name: 'RhymeZone',
    url: 'https://www.rhymezone.com/r/rhyme.cgi?Word={word}&typeofrhyme=def',
    enabled: true,
    builtin: true
  }
];

const DEFAULT_SETTINGS = {
  defaultDictionary: null,
  fallbackDictionary: null,
  tabBehavior: 'new',
  historyEnabled: false,
  firstRun: true,
  dictionaries: DEFAULT_DICTIONARIES,
  searchHistory: []
};

async function getSettings() {
  const result = await chrome.storage.local.get('settings');
  if (!result.settings) {
    await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...result.settings };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}

async function getDictionaries() {
  const settings = await getSettings();
  return settings.dictionaries;
}

async function getEnabledDictionaries() {
  const dictionaries = await getDictionaries();
  return dictionaries.filter(d => d.enabled);
}

async function saveDictionaries(dictionaries) {
  const settings = await getSettings();
  settings.dictionaries = dictionaries;
  await saveSettings(settings);
}

async function addCustomDictionary(dictionary) {
  const dictionaries = await getDictionaries();
  const newDict = {
    id: `custom-${Date.now()}`,
    name: dictionary.name,
    url: dictionary.url,
    icon: dictionary.icon || null,
    enabled: true,
    builtin: false
  };
  dictionaries.push(newDict);
  await saveDictionaries(dictionaries);
  return newDict;
}

async function updateDictionary(id, updates) {
  const dictionaries = await getDictionaries();
  const index = dictionaries.findIndex(d => d.id === id);
  if (index !== -1) {
    dictionaries[index] = { ...dictionaries[index], ...updates };
    await saveDictionaries(dictionaries);
  }
}

async function removeDictionary(id) {
  const dictionaries = await getDictionaries();
  const filtered = dictionaries.filter(d => d.id !== id);
  await saveDictionaries(filtered);
}

async function reorderDictionaries(orderedIds) {
  const dictionaries = await getDictionaries();
  const reordered = orderedIds.map(id => dictionaries.find(d => d.id === id)).filter(Boolean);
  await saveDictionaries(reordered);
}

async function getDefaultDictionary() {
  const settings = await getSettings();
  if (settings.defaultDictionary) {
    const dictionaries = await getDictionaries();
    return dictionaries.find(d => d.id === settings.defaultDictionary);
  }
  return null;
}

async function setDefaultDictionary(id) {
  const settings = await getSettings();
  settings.defaultDictionary = id;
  await saveSettings(settings);
}

async function getFallbackDictionary() {
  const settings = await getSettings();
  if (settings.fallbackDictionary) {
    const dictionaries = await getDictionaries();
    return dictionaries.find(d => d.id === settings.fallbackDictionary);
  }
  return null;
}

async function setFallbackDictionary(id) {
  const settings = await getSettings();
  settings.fallbackDictionary = id;
  await saveSettings(settings);
}

async function getTabBehavior() {
  const settings = await getSettings();
  return settings.tabBehavior;
}

async function setTabBehavior(behavior) {
  const settings = await getSettings();
  settings.tabBehavior = behavior;
  await saveSettings(settings);
}

async function isHistoryEnabled() {
  const settings = await getSettings();
  return settings.historyEnabled;
}

async function setHistoryEnabled(enabled) {
  const settings = await getSettings();
  settings.historyEnabled = enabled;
  await saveSettings(settings);
}

async function getSearchHistory() {
  const settings = await getSettings();
  return settings.searchHistory || [];
}

async function addToHistory(word, dictionaryId) {
  const settings = await getSettings();
  if (!settings.historyEnabled) return;
  
  const entry = {
    word,
    dictionaryId,
    timestamp: Date.now()
  };
  settings.searchHistory = settings.searchHistory || [];
  settings.searchHistory.unshift(entry);
  settings.searchHistory = settings.searchHistory.slice(0, 100);
  await saveSettings(settings);
}

async function clearHistory() {
  const settings = await getSettings();
  settings.searchHistory = [];
  await saveSettings(settings);
}

async function isFirstRun() {
  const settings = await getSettings();
  return settings.firstRun;
}

async function setFirstRunComplete() {
  const settings = await getSettings();
  settings.firstRun = false;
  await saveSettings(settings);
}

async function exportSettings() {
  const settings = await getSettings();
  return JSON.stringify(settings, null, 2);
}

async function importSettings(jsonString) {
  const settings = JSON.parse(jsonString);
  await saveSettings(settings);
}

function buildSearchUrl(urlPattern, word) {
  const encodedWord = encodeURIComponent(word.trim());
  return urlPattern.replace('{word}', encodedWord);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getSettings,
    saveSettings,
    getDictionaries,
    getEnabledDictionaries,
    saveDictionaries,
    addCustomDictionary,
    updateDictionary,
    removeDictionary,
    reorderDictionaries,
    getDefaultDictionary,
    setDefaultDictionary,
    getFallbackDictionary,
    setFallbackDictionary,
    getTabBehavior,
    setTabBehavior,
    isHistoryEnabled,
    setHistoryEnabled,
    getSearchHistory,
    addToHistory,
    clearHistory,
    isFirstRun,
    setFirstRunComplete,
    exportSettings,
    importSettings,
    buildSearchUrl,
    DEFAULT_DICTIONARIES,
    DEFAULT_SETTINGS
  };
}

