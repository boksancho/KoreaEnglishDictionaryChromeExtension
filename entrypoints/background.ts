import axios from 'axios'
import { storage } from '@wxt-dev/storage'

export default defineBackground(async () => {
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

  function sendTranslationToContentScript (tabId: number, source: string, data: string|null) {
    if (data) {
      chrome.tabs.sendMessage(tabId, { message: "wordLookup", source: source, data: data })
    }

  }
  
  /// get translation of english word from Gemini
  async function lookupWordOnGemini(word: string) {
      const apiKey: string|null = await storage.getItem<string>("local:geminiApiKey")
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`
      const axiosConfig = {headers: { 'Content-Type': 'application/json'}}
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
  
  async function lookupWordOnAzureAi(word: string) {
    const resourceKey: string|null = await storage.getItem<string>("local:azureAiKey")
    const region = 'eastus'
    const url = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=ko'
    const azureAiConfigData = [{text: word }]
    const axiosConfig = {
      headers: {
          "Ocp-Apim-Subscription-Key": resourceKey,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
      },
    }
    const response = await axios.post(url, azureAiConfigData, axiosConfig)
    return response.data[0].translations.map((item: { text: any }) => item.text).toString()
  }
  
  async function lookupWordOnNaver (wordToLookup: string) {
    const stNumber = 10 //Math.max(10, request.wordToLookup.length)
    const rltNumber = 10 //Math.max(10, request.wordToLookup.length)
    const url = `http://ac-dict.naver.com/enko/ac?st=${stNumber}&r_lt=${rltNumber}&q=${wordToLookup}`
    const response = await axios.get(url)
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
        sendTranslationToContentScript(tabId, 'naver', data)
      } catch (error: any) {
        sendResponse({ error: error.message });
      }
    }
    return true; // Important: Indicate asynchronous response
  })

  const unwatch = storage.watch<boolean>('local:isActive', (newValue, oldValue) => {
    const caption = newValue === true ? 'On' : 'Off'
    chrome.action.setBadgeText({"text":caption });
  })

  chrome.contextMenus.create({
    id: "bxTranslateByGemini", // Unique ID for the item
    title: "Translate to Korean (by Gemini)", // Text displayed in the menu
    contexts: ["page", "selection", "link", "image"], // Contexts where the menu item appears
  })

  chrome.contextMenus.create({
    id: "bxTranslateByAzureAi", // Unique ID for the item
    title: "Translate to Korean (by Azure)", // Text displayed in the menu
    contexts: ["page", "selection", "link", "image"], // Contexts where the menu item appears

  })

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'bxTranslateByGemini') {
      try {
        const tabId: number = tab?.id ?? 0
        const data: string|null = await lookupWordOnGemini(info?.selectionText ?? '')
        sendTranslationToContentScript(tabId, 'gemini', data)
      } catch (error: any) {
        // translation failed
      }
    } else if (info.menuItemId === 'bxTranslateByAzureAi') {
      try {
        const tabId: number = tab?.id ?? 0
        const data: string|null = await lookupWordOnAzureAi(info?.selectionText ?? '')
        sendTranslationToContentScript(tabId, 'azure', data)
      } catch (error: any) {
        // translation failed
      }
    }
  })
})
