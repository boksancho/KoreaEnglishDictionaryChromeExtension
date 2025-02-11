import axios from 'axios'
import { storage } from '@wxt-dev/storage'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  /// get translation of english word from Gemini
  async function lookupWordOnGemini(word: string) {
      const apiKey: string|null = await storage.getItem<string>("local:googleApiKey")
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`
      const axiosConfig = {headers: { 'Content-Type': 'application/json'}}
      const systemPromptContent = "I want you to act as a highly proficient Korean translator.  If I provide an English word, give me the direct, simple Korean equivalent(s) in comma delimiter format without using example sentences. Just a list of the Korean word(s) is sufficient. If I provide sentences, please translate to Korean."
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
    if (request.action === 'wordLookup') {
      try {
        let data:string|null = wordCount(request.wordToLookup) < 3
          ? await lookupWordOnNaver(request.wordToLookup)
          : await lookupWordOnGemini(request.wordToLookup)
        if (data) {
          chrome.tabs.sendMessage(tabId, { message: "wordLookup", data: data }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError); // Tab might be closed
            } else {
              console.log("Response from content script:", response); // If the content script sends a reply
            }
          })
          sendResponse({response: data}); // notworking???
        }

      } catch (error: any) {
        console.log('Error fetching from API in background script:', JSON.stringify(error));
        sendResponse({ error: error.message }); // Send an error back
      }
    }
    if (request.action === "processText") {
      const text = request.text;
      // ... process the text (e.g., API call, calculations) ...
      const processedData = `Processed: ${text.toUpperCase()}`; // Example
      sendResponse({ status: "success", data: processedData }); // Send back to content script
  
      // You can also send a message to other parts of your extension
      chrome.runtime.sendMessage({ type: "backgroundResponse", data: processedData });
    }

    return true; // Important: Indicate asynchronous response
  });


});
