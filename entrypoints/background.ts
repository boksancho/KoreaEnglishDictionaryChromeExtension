import axios from 'axios'
import { storage } from '@wxt-dev/storage'

export default defineBackground(async () => {
  // console.log('Hello background!', { id: browser.runtime.id });
  async function updateBadgeFromStorage() {
    const isActive = await storage.getItem<boolean>("local:isActive")
    const caption = isActive === true ? 'On' : 'Off'
    chrome.action.setBadgeText({"text": caption });
  }
  
  // Update badge when background script initializes
  await updateBadgeFromStorage();

  // Handle browser startup
  chrome.runtime.onStartup.addListener(async () => {
    await updateBadgeFromStorage();
  });
  
  // Handle extension installation or update
  chrome.runtime.onInstalled.addListener(async () => {
    await updateBadgeFromStorage();
  });

  function sendTranslationToContentScript (tabId: number, data: string|null) {
    if (data) {
      chrome.tabs.sendMessage(tabId, { message: "wordLookup", data: data }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError); // Tab might be closed
        } else {
          console.log("Response from content script:", response); // If the content script sends a reply
        }
      })
      // sendResponse({response: data}); // notworking???
    }

  }
  /// get translation of english word from Gemini
  async function lookupWordOnGemini(word: string) {
      const apiKey: string|null = await storage.getItem<string>("local:geminiApiKey")
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`
      const axiosConfig = {headers: { 'Content-Type': 'application/json'}}
      // const systemPromptContent = "I want you to act as a highly proficient Korean translator.  If I provide an English word, give me the direct, simple Korean equivalent(s) in comma delimiter format without using example sentences. Just a list of the Korean word(s) is sufficient. If I provide sentences, please translate to Korean."
      const systemPromptContent = "I want you to act as a highly proficient Korean translator. Please translate to Korean."
      const geminiConfigData = {
        systemInstruction: { role: "user", parts: [{ text: systemPromptContent }] },
        contents: [{ role: "user", parts: [{ text: word.toLowerCase() }] }],
        generationConfig: {
            temperature: 1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain"
        }
      }
      const response:any = await axios.post(url, geminiConfigData, axiosConfig)
      let foundWord = response.data.candidates[0].content.parts[0].text

      return foundWord
  }
  
  async function lookupWordOnNaver (wordToLookup: string) {
    const stNumber = 10 //Math.max(10, request.wordToLookup.length)
    const rltNumber = 10 //Math.max(10, request.wordToLookup.length)
    const url = `http://ac-dict.naver.com/enko/ac?st=${stNumber}&r_lt=${rltNumber}&q=${wordToLookup}`
    const response = await axios.get(url)
    //   // const data = await response.json(); // Or response.text() if not JSON
    const foundWordDefinitionObject = response.data
    const foundWordDefinition = foundWordDefinitionObject.items[0][0][2][0]

    return foundWordDefinition
  }

  function wordCount(text: string) {
    const words = text.trim().split(/\s+/);
    return words.length;
  }
  
  chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    const tabId:number = sender?.tab?.id ?? 0
    if (request.action === 'wordLookup' && wordCount(request.wordToLookup) < 3) {
      try {
        let data:string|null = await lookupWordOnNaver(request.wordToLookup)
        sendTranslationToContentScript(tabId, data)
      } catch (error: any) {
        console.log('Error fetching from API in background script:', JSON.stringify(error));
        sendResponse({ error: error.message }); // Send an error back
      }
    }
    return true; // Important: Indicate asynchronous response
  })

  const unwatch = storage.watch<boolean>('local:isActive', (newValue, oldValue) => {
    // console.log('Count changed:', { newValue, oldValue });
    const caption = newValue === true ? 'On' : 'Off'
    chrome.action.setBadgeText({"text":caption });
  })

  chrome.contextMenus.create({
    id: "bxTranslateByGemini", // Unique ID for the item
    title: "Translate to Korean", // Text displayed in the menu
    contexts: ["page", "selection", "link", "image"], // Contexts where the menu item appears

  })

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'bxTranslateByGemini') { 
      return
    }
    await lookupWordOnGemini(info?.selectionText ?? '')
    const tabId: number = tab?.id ?? 0
    let data: string|null = await lookupWordOnGemini(info?.selectionText ?? '')
    sendTranslationToContentScript(tabId, data)
  })
})
