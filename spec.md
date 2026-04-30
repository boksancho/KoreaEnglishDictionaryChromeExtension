# Specification: English-Korean Dictionary Chrome Extension

## Overview

A Chrome extension that provides English-to-Korean dictionary lookup and translation directly on any webpage, without navigating away. It supports three translation backends and offers a non-intrusive inline overlay UI.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Chrome Extension                                   │
│                                                     │
│  ┌───────────────┐      ┌────────────────────────┐  │
│  │  Popup UI     │      │  Content Script        │  │
│  │  (Vue 3)      │      │  (index.ts + App.vue)  │  │
│  │  SettingsUi   │      │  - mouseup → lookup    │  │
│  │  - Enable     │      │  - overlay mount/unmount│  │
│  │  - Gemini Key │      └──────────┬─────────────┘  │
│  │  - Azure Key  │                 │ chrome.runtime  │
│  └───────────────┘                 │ .sendMessage    │
│                                    ▼                 │
│                   ┌────────────────────────────────┐ │
│                   │  Background Script             │ │
│                   │  (background.ts)               │ │
│                   │  - Naver (selection lookup)    │ │
│                   │  - Gemini (context menu)       │ │
│                   │  - Azure (context menu)        │ │
│                   │  - Badge state management      │ │
│                   └────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Components

### Background Script (`entrypoints/background.ts`)

Runs persistently in the extension service worker.

**Responsibilities:**
- Manages the extension badge text (`On` / `Off`) synced with `local:isActive` storage
- Listens for `wordLookup` messages from the content script
- Registers and handles two right-click context menu items
- Makes API calls to Naver, Gemini, and Azure Translator

**Message Handler (`chrome.runtime.onMessage`):**
- Trigger: content script sends `{ action: 'wordLookup', wordToLookup }` on text selection
- Condition: word count < 3 (short words only)
- Backend: Naver Dictionary
- Response: sends result back to content script via `chrome.tabs.sendMessage`

**Context Menu Items:**
| Menu Item ID | Label | Backend |
|---|---|---|
| `bxTranslateByGemini` | Translate to Korean (by Gemini) | Google Gemini AI |
| `bxTranslateByAzureAi` | Translate to Korean (by Azure) | Azure Cognitive Services |

**Translation Functions:**

| Function | Backend | API Endpoint | Storage Key |
|---|---|---|---|
| `lookupWordOnNaver` | Naver Dictionary | `http://ac-dict.naver.com/enko/ac` | — |
| `lookupWordOnGemini` | Google Gemini AI | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent` | `local:geminiApiKey` |
| `lookupWordOnAzureAi` | Azure Translator | `https://api.cognitive.microsofttranslator.com/translate` (region: `eastus`) | `local:azureAiKey` |

---

### Content Script (`entrypoints/content/index.ts` + `App.vue`)

Injected into all pages (`*://*/*`).

**Responsibilities:**
- Listens for `mouseup` events; sends selected text to background for lookup
- Renders an inline Shadow DOM overlay near the selected text showing the translation result
- Listens for `wordLookup` messages from background and updates the overlay
- Dismisses overlay on: click, `Escape` key, scroll

**Overlay behaviour:**
- Positioned absolutely at the selection's bounding rect (`left`, `top + 18px`)
- Width: 500px, background: `#ebf183` (yellow), pointer-events disabled
- Shows source icon: Naver/Gemini logo or Azure dictionary icon based on `source` prop
- Displays: `{word}: {definition}`

**Storage dependency:** reads `local:isActive` before triggering lookup; silently skips if disabled.

---

### Popup (`entrypoints/popup/` + `components/SettingsUi.vue`)

Rendered when the user clicks the extension icon.

**UI Elements:**
- Extension logo + "Settings" heading
- Toggle switch (Bootstrap-Vue `BFormCheckbox`) — enables/disables the extension; persisted to `local:isActive`; updates badge immediately
- Gemini API Key field (`password` input) — persisted to `local:geminiApiKey` on Save
- Azure AI Key field (`password` input) — persisted to `local:azureAiKey` on Save
- **Save Keys** button — saves both API keys to storage

---

## Storage Schema

All storage via `@wxt-dev/storage` (Chrome `localStorage` namespace `local:`).

| Key | Type | Description |
|---|---|---|
| `local:isActive` | `boolean` | Whether the extension is enabled |
| `local:geminiApiKey` | `string` | Google Gemini API key |
| `local:azureAiKey` | `string` | Azure Cognitive Services subscription key |

---

## Permissions

Declared in `wxt.config.ts`:

| Permission | Purpose |
|---|---|
| `storage` | Persist settings and API keys |
| `tabs` | Send messages to specific tabs |
| `contextMenus` | Register right-click context menu items |

---

## Data Flow

### Selection-based lookup (Naver)

```
User selects text
  → content script mouseup
  → checks isActive (storage)
  → chrome.runtime.sendMessage({ action: 'wordLookup', wordToLookup })
  → background onMessage
  → wordCount < 3 check
  → lookupWordOnNaver(word)
  → Naver Dictionary API
  → sendTranslationToContentScript(tabId, 'naver', data)
  → content script handleWordLookup
  → overlayUi.mount() + updateData()
  → App.vue renders overlay
```

### Context menu translation (Gemini / Azure)

```
User right-clicks selected text → picks menu item
  → background contextMenus.onClicked
  → lookupWordOnGemini(selectionText) OR lookupWordOnAzureAi(selectionText)
  → external API call
  → sendTranslationToContentScript(tabId, 'gemini'|'azure', data)
  → content script handleWordLookup
  → overlayUi.mount() + updateData()
  → App.vue renders overlay
```

---

## Tech Stack

| Package | Version | Role |
|---|---|---|
| `wxt` | ^0.19.13 | Extension build framework |
| `@wxt-dev/module-vue` | ^1.0.1 | WXT Vue integration |
| `@wxt-dev/storage` | ^1.1.0 | Typed extension storage |
| `vue` | ^3.5.13 | UI framework |
| `bootstrap` | ^5.3.3 | CSS framework |
| `bootstrap-vue-next` | ^0.26.26 | Vue 3 Bootstrap components |
| `axios` | ^1.7.9 | HTTP client for API calls |
| `@google/genai` | ^1.35.0 | Google Gemini AI SDK (available, not yet used in background) |
| `webext-bridge` | ^6.0.1 | Extension messaging bridge (available) |
| `typescript` | 5.6.3 | Type safety |
| `vue-tsc` | ^2.1.10 | Vue TypeScript compiler |

---

## Build & Development

```bash
npm run dev          # Dev server with hot reload (Chrome)
npm run dev:firefox  # Dev server (Firefox)
npm run build        # Production build (Chrome)
npm run build:firefox # Production build (Firefox)
npm run zip          # Package as .zip for Chrome Web Store
npm run zip:firefox  # Package as .zip for Firefox Add-ons
npm run compile      # Type-check only (vue-tsc --noEmit)
```

Output directory: `.output/chrome-mv3/`

---

## Known Limitations

- Naver lookup only works for short words (< 3 words); longer selections are silently ignored for the auto-lookup path
- Naver Dictionary API is an undocumented endpoint (`ac-dict.naver.com`) and may be subject to change
- Azure Translator region is hardcoded to `eastus`
- Gemini and Azure translations require user-supplied API keys; no fallback if keys are missing or invalid
- Overlay is non-interactive (`pointerEvents: none`) so users cannot copy the translation text from the overlay
