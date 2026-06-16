// Background Service Worker - NO EXTERNAL API CALLS
// 100% Offline - All processing local

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'autofill-form',
    title: 'Simplify: Autofill with Resume',
    contexts: ['editable']
  });
  console.log('✅ Simplify Copilot installed');
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'autofill-form') {
    try {
      const result = await chrome.storage.local.get('simplify_copilot_data');
      const resume = result.simplify_copilot_data?.resume || {};
      chrome.tabs.sendMessage(tab.id, {
        action: 'autofill',
        data: resume
      });
    } catch (error) {
      console.error('Context menu error:', error);
    }
  }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getResume') {
    chrome.storage.local.get('simplify_copilot_data', (result) => {
      const resume = result.simplify_copilot_data?.resume || {};
      sendResponse({ resume });
    });
    return true;
  }
});
