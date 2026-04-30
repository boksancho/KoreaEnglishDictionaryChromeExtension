# English-Korean Dictionary and Translator Chrome Extension

A Chrome extension that provides instant English-to-Korean word lookup and translation directly on any webpage. Built with WXT, Vue 3, and integrated with multiple translation backends.

## Features

* **Auto Word Lookup (Naver Dictionary):** Select 1–2 words on any webpage and an inline overlay instantly shows the Korean definition sourced from Naver Dictionary.
* **Translate via Google Gemini AI:** Right-click any selected text and choose **"Translate to Korean (by Gemini)"** to get an AI-powered translation using the `gemini-2.5-flash-lite` model.
* **Translate via Azure AI Translator:** Right-click any selected text and choose **"Translate to Korean (by Azure)"** to translate using Microsoft Azure Cognitive Services Translator.
* **Inline Overlay UI:** Translation results appear in a floating overlay near the selected text. Dismiss by clicking, pressing Escape, or scrolling.
* **Enable/Disable Toggle:** Turn the extension on or off via a toggle switch in the popup. The extension badge shows **On** or **Off** status.
* **Settings Popup:** Configure your Gemini API key and Azure AI key securely through the extension popup.

## Technologies Used

* **WXT (Web eXtension Toolkit):** Simplifies Chrome extension development with modern tooling.
* **Vue 3:** Progressive JavaScript framework for the popup and content script UI.
* **Bootstrap & bootstrap-vue-next:** UI component library for the settings popup.
* **Google Gemini AI (`@google/genai`, `gemini-2.5-flash-lite`):** AI-powered Korean translation.
* **Azure Cognitive Services Translator:** Cloud-based machine translation.
* **Naver Dictionary API:** Fast dictionary lookup for short English words.
* **`@wxt-dev/storage`:** Persistent extension storage for settings and API keys.
* **axios:** HTTP client for API requests.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/boksancho/KoreaEnglishDictionaryChromeExtension.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load into Chrome:**
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `.output/chrome-mv3/` directory

## Development

```bash
npm run dev        # Start dev server with hot reload
npm run build      # Production build
npm run zip        # Package extension as zip for distribution
```

## Configuration

After installing the extension, open the popup and configure your API keys:

| Setting | Description |
|---|---|
| **Enable toggle** | Turn the extension on or off |
| **Gemini API Key** | Required for "Translate to Korean (by Gemini)" context menu option. Get a key at [Google AI Studio](https://aistudio.google.com/). |
| **Azure AI Key** | Required for "Translate to Korean (by Azure)" context menu option. Get a key from [Azure Cognitive Services](https://portal.azure.com/). |

## Usage

1. **Quick word lookup:** Select 1–2 English words on any webpage. An overlay will appear with the Korean translation from Naver Dictionary (requires the extension to be **enabled**).
2. **Translate longer text:** Select any text, right-click, and choose:
   - **"Translate to Korean (by Gemini)"** — uses Google Gemini AI
   - **"Translate to Korean (by Azure)"** — uses Azure AI Translator
3. **Dismiss overlay:** Click anywhere on the page, press `Escape`, or scroll.
