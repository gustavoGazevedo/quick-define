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

let dictionaryTabIds = {};

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

async function getEnabledDictionaries() {
  const settings = await getSettings();
  return settings.dictionaries.filter(d => d.enabled);
}

function buildSearchUrl(urlPattern, word) {
  const encodedWord = encodeURIComponent(word.trim());
  return urlPattern.replace('{word}', encodedWord);
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

async function createContextMenus() {
  await chrome.contextMenus.removeAll();
  
  chrome.contextMenus.create({
    id: 'search-dictionary',
    title: 'Search Dictionary',
    contexts: ['selection']
  });
  
  const dictionaries = await getEnabledDictionaries();
  
  for (const dict of dictionaries) {
    chrome.contextMenus.create({
      id: `dict-${dict.id}`,
      parentId: 'search-dictionary',
      title: dict.name,
      contexts: ['selection']
    });
  }
  
  if (dictionaries.length > 1) {
    chrome.contextMenus.create({
      id: 'separator',
      parentId: 'search-dictionary',
      type: 'separator',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'search-all',
      parentId: 'search-dictionary',
      title: 'Search All Dictionaries',
      contexts: ['selection']
    });
  }
}

async function openDictionaryTab(dictionary, word) {
  const settings = await getSettings();
  const url = buildSearchUrl(dictionary.url, word);
  
  if (settings.tabBehavior === 'reuse' && dictionaryTabIds[dictionary.id]) {
    try {
      const tab = await chrome.tabs.get(dictionaryTabIds[dictionary.id]);
      if (tab) {
        await chrome.tabs.update(tab.id, { url, active: true });
        return tab.id;
      }
    } catch (e) {
      delete dictionaryTabIds[dictionary.id];
    }
  }
  
  const tab = await chrome.tabs.create({ url });
  dictionaryTabIds[dictionary.id] = tab.id;
  return tab.id;
}

async function handleMenuClick(info, tab) {
  const selectedText = info.selectionText;
  if (!selectedText) return;
  
  const settings = await getSettings();
  const dictionaries = await getEnabledDictionaries();
  
  if (info.menuItemId === 'search-all') {
    for (const dict of dictionaries) {
      await openDictionaryTab(dict, selectedText);
      await addToHistory(selectedText, dict.id);
    }
    return;
  }
  
  if (info.menuItemId.startsWith('dict-')) {
    const dictId = info.menuItemId.replace('dict-', '');
    let dictionary = dictionaries.find(d => d.id === dictId);
    
    if (!dictionary && settings.fallbackDictionary) {
      dictionary = dictionaries.find(d => d.id === settings.fallbackDictionary);
    }
    
    if (dictionary) {
      if (settings.firstRun && !settings.defaultDictionary) {
        settings.defaultDictionary = dictionary.id;
        settings.firstRun = false;
        await saveSettings(settings);
      }
      
      await openDictionaryTab(dictionary, selectedText);
      await addToHistory(selectedText, dictionary.id);
    }
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await createContextMenus();
});

chrome.contextMenus.onClicked.addListener(handleMenuClick);

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.settings) {
    createContextMenus();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  for (const dictId in dictionaryTabIds) {
    if (dictionaryTabIds[dictId] === tabId) {
      delete dictionaryTabIds[dictId];
      break;
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'searchWord') {
    (async () => {
      const { word, dictionaryId } = message;
      const settings = await getSettings();
      const dictionaries = settings.dictionaries;
      
      let dictionary;
      if (dictionaryId) {
        dictionary = dictionaries.find(d => d.id === dictionaryId);
      } else if (settings.defaultDictionary) {
        dictionary = dictionaries.find(d => d.id === settings.defaultDictionary);
      } else {
        dictionary = dictionaries.find(d => d.enabled);
      }
      
      if (dictionary) {
        if (settings.firstRun && !settings.defaultDictionary) {
          settings.defaultDictionary = dictionary.id;
          settings.firstRun = false;
          await saveSettings(settings);
        }
        
        await openDictionaryTab(dictionary, word);
        await addToHistory(word, dictionary.id);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No dictionary available' });
      }
    })();
    return true;
  }
  
  if (message.action === 'refreshMenus') {
    createContextMenus();
    sendResponse({ success: true });
    return true;
  }
});

