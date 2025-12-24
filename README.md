# Marginalia

![GitHub release (latest by date)](https://img.shields.io/github/v/release/OpeNopEn2007/obsidian-marginalia)
![GitHub license](https://img.shields.io/github/license/OpeNopEn2007/obsidian-marginalia)
![Downloads](https://img.shields.io/github/downloads/OpeNopEn2007/obsidian-marginalia/total)

> [🇨🇳 中文说明 (Chinese Documentation)](README.zh-CN.md)

> Utilizing the marginal space of your screen to provide unexpected inspiration for writers.

**Marginalia** is a lightweight, immersive status bar plugin for Obsidian. It utilizes the status bar space at the bottom of the screen to display quotes, aphorisms, or fragments of inspiration from the "Hitokoto" API, the "Quotable" API (with ZenQuotes fallback), or a custom quote library.

## Table of Contents

* [✨ Features](#-features)
* [📥 Installation](#-installation)
* [🔒 Privacy &amp; Network](#-privacy--network)
* [⚙️ Configuration](#-configuration)
* [🛠️ Development](#-development)
* [📜 License](#-license)
* [🤝 Contribution &amp; Contact](#-contribution--contact)
* [📅 Changelog](#-changelog)

## ✨ Features

* 📝 **Multiple Data Sources**: Supports ["Hitokoto"](https://hitokoto.cn/) API, ["Quotable"](https://quotable.io/) API (with [ZenQuotes](https://zenquotes.io/) fallback), and local custom lists.
* 🔄 **Auto Refresh**: Configurable auto-refresh interval (1-60 minutes) to keep inspiration flowing.
* 🔀 **Category Selection**: Supports filtering for specific types of sentences such as Anime, Literature, Philosophy, Poetry, etc.
* 📋 **Private Library**: Supports adding and managing your own collection of excerpts.
* 🖱️ **Minimalist Interaction**: Hover to view the source, click to refresh immediately, and right-click to copy.
* 📱 **Cross-Platform**: Perfectly adapted for both Desktop and Mobile UIs.

### Feature Demo

* **Local Custom List Mode**

![local_mode_demo](asset/local_mode_demo.gif)

* **"Hitokoto" API Mode**

![online_mode_demo](asset/online_mode_demo.gif)

* **Right-click to Copy**

![copy_demo](asset/copy_demo.gif)

## 📥 Installation

### Method 1: Install using BRAT Plugin (Recommended for testing)

Before approval in the official store, it is recommended to use the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin for installation:

1. Search for and install **BRAT** in the Obsidian Community Plugins market.
2. Open BRAT settings and click `Add Beta plugin`.
3. Enter the repository URL: `https://github.com/OpeNopEn2007/obsidian-marginalia`
4. Click `Add Plugin`.

### Method 2: Install from Obsidian Community Plugins

> **Note**: The plugin is currently under official review. Once approved, you can search for and install it directly.

1. Open Obsidian Settings -> **Community Plugins**.
2. Turn off "Restricted mode".
3. Click "Browse" and search for `Marginalia`.
4. Click Install and Enable.

### Method 3: Manual Installation

1. Download the latest `main.js`, `manifest.json`, and `styles.css` from the GitHub Releases page.
2. Place the files into the `.obsidian/plugins/marginalia/` folder.
3. Restart Obsidian and enable the plugin.

## 🔒 Privacy & Network

### Network Access Statement

* When using **[Hitokoto](https://hitokoto.cn/) API** as the data source, the plugin periodically accesses `https://v1.hitokoto.cn/` to fetch random quotes.
* When using **[Quotable](https://quotable.io/) API** as the data source, the plugin accesses `https://api.quotable.io/random` (and falls back to `https://zenquotes.io/api/random` from [ZenQuotes](https://zenquotes.io/) if needed).
* When using **Local Custom List**, the plugin does not generate any network requests.

### Privacy Commitment

* **No User Data Collection**: The plugin does not collect, store, or transmit any personal information or usage data.
* **No User Tracking**: The plugin does not track any user actions or preferences.
* **Transparent Data Usage**: All network requests are solely for fetching public quote content and do not contain any user identification information.

### Offline Support

Even in a completely offline environment, the plugin works normally; simply switch the data source to "Local Custom List".

## ⚙️ Configuration

### 1. Data Source Settings

* **["Hitokoto"](https://hitokoto.cn/) API**: Fetches random quotes via the internet.
* **["Quotable"](https://quotable.io/) API**: Fetches random quotes via the internet (with [ZenQuotes](https://zenquotes.io/) fallback).
* **Local Custom List**: Displays locally configured content only, available offline.

### 2. "Hitokoto" Category Reference

| **Code** | **Category** | **Code** | **Category** | **Code** | **Category** |
| :------------- | :----------------- | :------------- | :----------------- | :------------- | :----------------- |
| **a**    | Anime              | **e**    | Original           | **i**    | Poetry             |
| **b**    | Manga              | **f**    | Internet           | **j**    | Netease Cloud      |
| **c**    | Game               | **g**    | Other              | **k**    | Philosophy         |
| **d**    | Literature         | **h**    | Film & TV          | **l**    | Clever/Witty       |

### 3. Custom Quote Format

Supports plain text or text with a source, one per line:

```plaintext
Here is the quote content
Here is the quote content | Here is the author/source
```

## 🛠️ Development

If you are a developer or want to modify the source code yourself, please refer to the following process.

**Environment Requirements**

* Node.js 16+
* npm or yarn

**Quick Start**

1. **Clone the repository and install dependencies:**

```bash
git clone https://github.com/OpeNopEn2007/obsidian-marginalia.git
cd obsidian-marginalia
npm install
```

2. **Configure Auto-Deployment Environment (Optional):** This project supports automatically syncing the built plugin to your Obsidian test vault during development.

* Copy the `.env.example` file in the root directory and rename it to `.env`.
* Modify `OBSIDIAN_VAULT_PATH` in the `.env` file to the absolute path of your local Obsidian plugins directory.

```plaintext
# .env Example
OBSIDIAN_VAULT_PATH=D:\Vault\MyTestVault\.obsidian\plugins\marginalia
```

* *Note: The `.env` file is ignored by git, so your path privacy will not be uploaded.*

3. **Start Development Mode:**

```bash
npm run dev
```

At this point, modifying the code will automatically trigger a recompile (and sync to your test vault). You can see the effect in Obsidian by running the command `Reload app without saving`.

4. **Build Production Version:**

```bash
npm run build
```

The build artifacts will be output to the `./marginalia` directory.

**Project Structure**

```plaintext
Marginalia/
├── src/
│   ├── services/           # Quote services and local quote manager
│   │   ├── hitokoto.ts     # Hitokoto API (with category support)
│   │   ├── quotable.ts     # Quotable API (with ZenQuotes fallback)
│   │   └── quoteManager.ts # Local custom quote parsing + randomization
│   ├── ui/
│   │   └── statusBar.ts    # Status bar UI component
│   ├── main.ts             # Plugin entry point
│   └── settings.ts         # Settings panel logic
├── esbuild.config.mjs      # Build configuration (includes auto-deployment logic)
├── .env.example            # Environment variable example
└── manifest.json           # Plugin manifest file
```

## 📜 License

MIT License. Copyright (c) 2025 Open Open.

## 🤝 Contribution & Contact

Issues for bug reports and Pull Requests for code contributions are welcome!

* **Author:** Open Open
* **GitHub:** [OpeNopEn2007](https://github.com/OpeNopEn2007)

## 📅 Changelog

**v1.1.0**

* ✨ **New Feature:** Added "Quotable" API as a new data source (with ZenQuotes fallback).
* ⚙️ **Settings:** Added data source selection (Hitokoto / Quotable / Local Custom List).
* 🌐 **Locale:** Improved default data source selection based on UI language (Chinese → Hitokoto, others → Quotable).
* 📝 **Docs:** Updated README network statement and project structure.

**v1.0.0.5**

* 🐛 **Fix**: Fixed the `main` field in the `manifest` file.

**v1.0.0.4**

* ✨ **New Feature:** Implemented a brand new floating Tooltip with smooth fade-in/out animations.
* 🎨 **UI Optimization:** Replaced status bar Emojis with Obsidian native Lucide icons for a more unified visual style.
* 🐛 **Fix:** Fixed Hitokoto API request parameter format errors.
* ⚡ **Performance:** Added Debounce processing to input boxes in the settings panel to avoid frequent refreshing.

**v1.0.0.3**

* 🔧 **Engineering:** Refactored build scripts to support automatic file distribution to specified directories.
* 🌐 **Network:** Optimized URL parameter construction logic to comply with RESTful specifications.

**v1.0.0.2**

* ⚡ **Algorithm Optimization:** Fixed random repetition logic to ensure the same quote is not returned twice in a row.
* 🛡️ **Protection Mechanism:** Added extra protection for the API; automatically retries if content is repeated.
* 🎨 **UI Purification:** Removed Emojis from prompt messages, returning to a pure text minimalist style.

**v1.0.0.1**

* 💄 **UI Refinement:** Optimized status bar hover tooltip logic to only display the source attribute.

**v1.0.0.0**

* 🔨 **Build Optimization:** Modified build scripts to implement automated folder distribution build flow.
* 📝 **Documentation:** Updated author information, officially signed as Open Open.

**v1.0.0**

* 🎉 **Initial Release.**
* Supports Hitokoto API and local custom lists.
* Supports auto-refresh (1-60 minutes) and manual click refresh.
* Supports right-click to copy.
* Supports multiple Hitokoto category selections.
