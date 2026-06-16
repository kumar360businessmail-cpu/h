// Background Service Worker

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'autofill-form',
    title: 'Simplify: Autofill with my resume',
    contexts: ['editable']
  });

  console.log('Simplify Copilot installed successfully!');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'autofill-form') {
    const resume = await chrome.storage.local.get('simplify_copilot');
    const data = resume.simplify_copilot || {};
    
    chrome.tabs.sendMessage(tab.id, {
      action: 'autofill',
      data: data.resume || {}
    });
  }
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getResume') {
    chrome.storage.local.get('simplify_copilot', (result) => {
      const resume = result.simplify_copilot?.resume || {};
      sendResponse({ resume });
    });
    return true;
  }
});
