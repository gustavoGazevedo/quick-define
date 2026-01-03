# Quick Define

A Chrome extension that enables users to search dictionary websites for definitions of selected text with a right-click context menu.

## Features

- **Right-click context menu** - Search dictionary websites directly from selected text
- **Multiple built-in dictionaries** - 15+ popular dictionary sources including Merriam-Webster, Oxford, Cambridge, and more
- **Custom dictionaries** - Add unlimited custom dictionary sources with URL patterns
- **Search all dictionaries** - Open selected word in all enabled dictionaries simultaneously
- **Configurable tab behavior** - Choose to open new tabs or reuse existing dictionary tabs
- **Search history** - Optional history tracking for recent searches
- **Drag-and-drop ordering** - Reorder dictionaries to your preference
- **Import/Export settings** - Backup and restore your configuration

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `quick-define` folder
5. The extension is now installed and ready to use

## Usage

1. **Select text** on any webpage
2. **Right-click** to open the context menu
3. Choose a dictionary from the "Search Dictionary" submenu, or select "Search All Dictionaries" to open all enabled dictionaries

### Popup

Click the extension icon to open a quick search popup where you can:
- Type a word manually to search
- Select a default dictionary
- View recent search history (if enabled)
- Access settings

### Settings

Right-click the extension icon and select "Options" to configure:
- Default and fallback dictionaries
- Tab behavior (new tab vs reuse)
- Enable/disable individual dictionaries
- Add/edit/remove custom dictionaries
- Enable/disable search history
- Import/export settings

## Built-in Dictionaries

- Merriam-Webster
- Oxford Learner's Dictionaries
- Cambridge Dictionary
- Dictionary.com
- Urban Dictionary
- Wiktionary
- Google Define
- Collins Dictionary
- Longman Dictionary
- Vocabulary.com
- The Free Dictionary
- YourDictionary
- WordReference
- OneLook Dictionary Search
- Etymonline
- RhymeZone

## Custom Dictionaries

You can add custom dictionaries by providing:
- **Name** - Display name for the dictionary
- **URL Pattern** - URL with `{word}` placeholder (e.g., `https://example.com/define/{word}`)
- **Icon URL** (optional) - Custom icon for the dictionary

## Privacy

- No analytics or tracking
- No external API calls (only opens user-selected dictionary URLs)
- All data stored locally in your browser
- No data sent to external servers

## Permissions

- `contextMenus` - For right-click menu
- `storage` - For local settings storage
- `activeTab` - For reading selected text

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

