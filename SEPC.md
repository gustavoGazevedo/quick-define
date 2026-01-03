# Quick Define - Chrome Extension Specification

## Overview

A Chrome extension that enables users to search dictionary websites for definitions of selected text in the browser. The extension opens dictionary results in a new tab and supports multiple built-in and custom dictionary sources.

---

## Core Functionality

### Trigger Mechanism

- **Right-click context menu** is the sole trigger method
- Context menu item **hidden** when no text is selected
- Menu structure: `Search Dictionary` > `[submenu with dictionary list]` + `Search All Dictionaries`

### Text Selection Handling

- Allow **any selection length** (single words, phrases, sentences)
- **URL encode** special characters automatically before constructing the search URL
- Trim leading/trailing whitespace

### Dictionary Display

- Open dictionary website in a **new browser tab**
- Tab behavior is **user-configurable**:
  - Always open new tab
  - Reuse existing dictionary tab if already open

### Search All Dictionaries

- Context menu includes **"Search All Dictionaries"** option
- Opens the selected word in **all enabled dictionaries** simultaneously (multiple tabs)
- Tabs open in sequence, grouped together in the tab bar

---

## Dictionary Sources

### Built-in Dictionaries

| Dictionary       | URL Pattern                                              |
| ---------------- | -------------------------------------------------------- |
| Merriam-Webster  | `https://www.merriam-webster.com/dictionary/{word}`      |
| Oxford           | `https://www.oxfordlearnersdictionaries.com/definition/english/{word}` |
| Cambridge        | `https://dictionary.cambridge.org/dictionary/english/{word}` |
| Dictionary.com   | `https://www.dictionary.com/browse/{word}`               |
| Urban Dictionary | `https://www.urbandictionary.com/define.php?term={word}` |
| Wiktionary       | `https://en.wiktionary.org/wiki/{word}`                  |

### Custom Dictionaries

- Users can add **unlimited** custom dictionaries
- Two input modes:
  1. **Simple template**: Enter URL with `{word}` placeholder
     - Example: `https://example.com/define/{word}`
  2. **Advanced form**: Name, URL pattern, and optional custom icon (URL or upload)
- Custom dictionaries appear alongside built-in ones in the submenu

---

## User Interface

### Extension Popup

Clicking the extension icon opens a popup with:

1. **Quick search box** - Type a word manually to search
2. **Link to settings/options page**

**Styling**: Minimal dark theme

### Settings/Options Page

Features:

- **Default dictionary selection** (prompted on first use)
- **Dictionary management**:
  - Enable/disable individual dictionaries
  - **Drag-and-drop reordering** for submenu order
  - Add/edit/remove custom dictionaries
- **Tab behavior toggle**: New tab vs. reuse existing
- **Fallback dictionary selection** (user-configured backup)
- **Search history toggle**: Enable/disable with clear history button
- **Import/export settings** (optional for power users)

### First-Time User Experience

- **Minimal onboarding**: Badge the extension icon to indicate setup available
- User prompted to select default dictionary on first context menu use
- No intrusive welcome page or wizard

---

## Error Handling

- If the primary dictionary fails or URL is invalid:
  - **Automatically fallback** to the user-configured backup dictionary
- If no fallback is configured, attempt to open the tab anyway (silent fail)

---

## Data Storage

### Settings Storage

- **Local storage only** (no Chrome sync)
- Stored data:
  - Default dictionary selection
  - Dictionary order and enabled/disabled state
  - Custom dictionary configurations
  - Tab behavior preference
  - Fallback dictionary selection
  - History enabled/disabled state

### Search History

- **Optional feature** - user can enable/disable
- Stored locally with explicit **clear history** option
- No history synced or sent externally

---

## Permissions & Privacy

### Required Permissions

- `contextMenus` - For right-click menu
- `storage` - For local settings storage
- `activeTab` - For reading selected text

### Incognito Mode

- Extension works in incognito **only if user manually enables** it via `chrome://extensions`
- No special incognito permission requested

### Privacy

- No analytics or tracking
- No external API calls (only opens user-selected dictionary URLs)
- All data stored locally

---

## Technical Implementation

### Manifest

- **Manifest V3** (Chrome's current extension standard)

### Project Structure

```
quick-define/
├── manifest.json
├── background.js          # Service worker for context menu
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── lib/
    └── storage.js         # Shared storage utilities
```

### Key Implementation Details

1. **Context Menu Creation**
   - Dynamically create/update context menu based on enabled dictionaries
   - Use `chrome.contextMenus.onClicked` listener in service worker
   - Menu visibility controlled by `contexts: ["selection"]`

2. **URL Construction**
   - Replace `{word}` placeholder with `encodeURIComponent(selectedText.trim())`

3. **Tab Management**
   - Track dictionary tab ID in session storage for reuse mode
   - Use `chrome.tabs.create()` or `chrome.tabs.update()` based on setting

4. **Drag-and-Drop Reordering**
   - Implement using HTML5 Drag and Drop API or a lightweight library
   - Persist order to local storage on change

---

## Future Considerations (Out of Scope for V1)

- Keyboard shortcut support
- Floating icon near selection
- Inline definition preview without opening new tab
- Chrome sync storage option
- Pronunciation audio playback
- Word of the day feature

---

## Summary

| Feature                  | Implementation                           |
| ------------------------ | ---------------------------------------- |
| Trigger                  | Context menu (submenu structure)         |
| Display                  | New tab (configurable reuse)             |
| Search All               | Opens all enabled dictionaries at once   |
| Built-in dictionaries    | 6 presets                                |
| Custom dictionaries      | Unlimited, simple + advanced modes       |
| Default dictionary       | User-selected on first use               |
| Ordering                 | Drag-and-drop                            |
| Fallback                 | User-configured                          |
| History                  | Optional, local-only                     |
| Popup                    | Quick search + settings link             |
| Theme                    | Minimal dark                             |
| Storage                  | Local only (no sync)                     |
| Incognito                | Manual enable only                       |
| Manifest                 | V3                                       |
