import { createApp } from "vue"
import { storage } from '@wxt-dev/storage'
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client"
import modalApp from "./App.vue"
// import "./reset.css";
// import "./wordSearch.css";

let thisContainer:any|undefined 
let overlayUi: ShadowRootContentScriptUi
let appInstance: any = null;

type WordDefinition = {
  wordToLookup: string;
  url: string;
  wordDefinition: string;
};

interface MyShadowRootContentScriptUi extends ShadowRootContentScriptUi<any> {
  updateData: (newData: WordDefinition) => void;
  appInstance: any; // Add appInstance property (optional, but useful)
  container: HTMLElement; // Add container property for remounting
}

async function handleSelection() {
  // overlayUi.mount()
  const isActive: boolean|null = await storage.getItem<boolean>("local:isActive");
  if (!isActive) {
    return
  }
  const selectedText = window.getSelection()?.toString();
  if (selectedText) {
    await searchWord(selectedText)
  }
}

async function searchWord(word: string) {
  const wordToLookup = word?.trim()
  if (!wordToLookup) { return }

  try {
    chrome.runtime.sendMessage({ action: 'wordLookup', wordToLookup: wordToLookup})
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

function getRect (): DOMRect {
  let selection = window.getSelection()
  let range = selection?.getRangeAt(0)
  let rect = range?.getBoundingClientRect()
  return rect as DOMRect
}

function wordCount(text: string) {
  const words = text.trim().split(/\s+/);
  return words.length;
}

function handleWordLookup (request: any, sender: any, sendResponse: any) {
  if (request.message === 'wordLookup') {
    try {
      let wordToLookup = window.getSelection()?.toString() ?? ''
      const workCount = wordCount(wordToLookup)
      const wordObject: WordDefinition ={
        wordToLookup: workCount > 2 ? '' : wordToLookup,
        url: "",
        wordDefinition: request.data,
      }
      overlayUi.mount()
      overlayUi.updateData(wordObject)
    } catch (err) {
      console.log("handleWordLookup ~ err:", err)
      // do nothing
    } finally {
      // Optionally send a response back to the background script
      sendResponse({ response: "Message received successfully! (from content script)" });
    }
  }

  // Important: Return true for asynchronous responses
  // (If you need to call sendResponse later)
  // return true; // Only if you need asynchronous response
}

async function defineOverlay(ctx: ContentScriptContext) {
  let overlay = await createShadowRootUi(ctx, {
    name: "vue-overlay",
    position: 'inline', // inline work with position well, but not working with link, 'modal' vice versa
    anchor: 'body',
    // zIndex: 99999,
    onMount(container, _shadow, shadowHost) {
      thisContainer = container
      appInstance = createApp(modalApp, {wordDefinition: ''});
      appInstance.mount(container);

      const rect = getRect()
      shadowHost.style.display = "block"
      shadowHost.style.position = "absolute"
      shadowHost.style.left = `${(rect?.left ?? 0)}px`
      shadowHost.style.top = `${(rect?.top ?? 0) + 18 }px`
      shadowHost.style.color = "blue"
      shadowHost.style.backgroundColor = "#ebf183"
      shadowHost.style.width = "500px"
      // shadowHost.style.paddingLeft = "15px"
      // shadowHost.style.paddingRight = "15px"
      
      container.style.position = "absolute"
      // container.style.paddingLeft = "5px"
      // container.style.paddingRight = "5px"

      shadowHost.style.pointerEvents = "none";
      return appInstance;
    },
    onRemove(app) {
      app?.unmount();
    },
  }) as MyShadowRootContentScriptUi;
  
  overlay.updateData = (wordDefinition: WordDefinition) => {
    if (appInstance) {
      appInstance.unmount();
      appInstance = createApp(modalApp, {wordToLookup:wordDefinition.wordToLookup, wordDefinition: wordDefinition.wordDefinition, url:wordDefinition.url});
      appInstance.mount(thisContainer);
      // appInstance.mount(overlay.uiContainer);
      // appInstance.mount();
    }
}

  return overlay
}

function closeModal () {
  if (appInstance) {
    appInstance.unmount()
  }
}

function closeModalOnEscape (evt: KeyboardEvent) {
  evt = evt || window.event;
  var isEscape = false;
  if ("key" in evt) {
      isEscape = (evt.key == "Escape" || evt.key == "Esc");
  } else {
      // isEscape = (evt.keyCode == 27);
  }

  if (isEscape) {
    closeModal()
  }
}


export default defineContentScript({
  // matches: ['<all_urls>'],
  matches: ['*://*/*'],
  async main(ctx) {
    overlayUi = await defineOverlay(ctx)
    document.addEventListener('mouseup', handleSelection)
    chrome.runtime.onMessage.addListener(handleWordLookup)
    document.addEventListener("click", () => { closeModal()})
    window.onkeydown = (evt: KeyboardEvent) => { closeModalOnEscape(evt) }
  },
});