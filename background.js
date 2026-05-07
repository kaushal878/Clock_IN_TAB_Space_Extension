// Background Service Worker for Floating Clock Extension

class BackgroundService {
  constructor() {
    this.defaultSettings = {
      enabled: true,
      format24: false,
      focusMode: false,
      lockScreen: false,
      position: { x: 20, y: 20 }
    };
    
    this.init();
  }

  init() {
    this.setupInstallListener();
    this.setupMessageListener();
    this.setupTabListener();
    this.initializeSettings();
  }

  async initializeSettings() {
    try {
      const result = await chrome.storage.sync.get(['clockSettings']);
      if (!result.clockSettings) {
        // Initialize with default settings on first install
        await chrome.storage.sync.set({ clockSettings: this.defaultSettings });
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }
  }

  setupInstallListener() {
    chrome.runtime.onInstalled.addListener(async (details) => {
      if (details.reason === 'install') {
        console.log('Floating Clock Extension installed');
        
        // Initialize default settings
        await chrome.storage.sync.set({ clockSettings: this.defaultSettings });
        
        // Open welcome page or show notification
        this.showWelcomeNotification();
      } else if (details.reason === 'update') {
        console.log('Floating Clock Extension updated');
        // Handle updates if needed
      }
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep the message channel open for async response
    });
  }

  setupTabListener() {
    // Listen for tab updates to ensure content script is injected
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      // Only inject when page is completely loaded
      if (changeInfo.status === 'complete' && tab.url) {
        try {
          // Check if content script is already injected
          const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              return typeof window.floatingClock !== 'undefined';
            }
          });

          // If content script is not injected, inject it
          if (!results || !results[0] || !results[0].result) {
            await this.injectContentScript(tabId);
          }
        } catch (error) {
          console.error('Failed to check/inject content script:', error);
        }
      }
    });

    // Handle new tab creation
    chrome.tabs.onCreated.addListener(async (tab) => {
      // Wait a bit for the tab to load
      setTimeout(async () => {
        try {
          if (tab.id && tab.url && tab.url.startsWith('http')) {
            await this.injectContentScript(tab.id);
          }
        } catch (error) {
          console.error('Failed to inject content script in new tab:', error);
        }
      }, 1000);
    });
  }

  async injectContentScript(tabId) {
    try {
      // Inject the content script
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });

      // Inject the CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getSettings':
          const settings = await chrome.storage.sync.get(['clockSettings']);
          sendResponse({ success: true, settings: settings.clockSettings || this.defaultSettings });
          break;

        case 'saveSettings':
          await chrome.storage.sync.set({ clockSettings: request.settings });
          sendResponse({ success: true });
          break;

        case 'resetSettings':
          await chrome.storage.sync.set({ clockSettings: this.defaultSettings });
          sendResponse({ success: true, settings: this.defaultSettings });
          break;

        case 'injectToAllTabs':
          await this.injectToAllTabs();
          sendResponse({ success: true });
          break;

        case 'toggleInAllTabs':
          await this.toggleInAllTabs(request.enabled);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async injectToAllTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      
      for (const tab of tabs) {
        if (tab.url && (tab.url.startsWith('http') || tab.url.startsWith('file'))) {
          try {
            await this.injectContentScript(tab.id);
          } catch (error) {
            console.error(`Failed to inject into tab ${tab.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to inject into all tabs:', error);
    }
  }

  async toggleInAllTabs(enabled) {
    try {
      const tabs = await chrome.tabs.query({});
      
      for (const tab of tabs) {
        if (tab.url && (tab.url.startsWith('http') || tab.url.startsWith('file'))) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'toggle',
              enabled: enabled
            });
          } catch (error) {
            console.error(`Failed to toggle in tab ${tab.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle in all tabs:', error);
    }
  }

  showWelcomeNotification() {
    // Create a notification for Chrome/Edge
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Floating Clock Extension',
        message: 'Extension installed successfully! Click the extension icon to customize your clock.'
      });
    }
  }

  // Handle extension startup
  async onStartup() {
    console.log('Floating Clock Extension started');
    
    // Ensure content scripts are injected into existing tabs
    setTimeout(async () => {
      await this.injectToAllTabs();
    }, 1000);
  }
}

// Initialize the background service
const backgroundService = new BackgroundService();

// Listen for browser startup
chrome.runtime.onStartup.addListener(() => {
  backgroundService.onStartup();
});

// Handle extension icon click (alternative to popup)
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Get current settings
    const result = await chrome.storage.sync.get(['clockSettings']);
    const settings = result.clockSettings || backgroundService.defaultSettings;
    
    // Toggle the enabled state
    const newEnabled = !settings.enabled;
    
    // Update settings
    const updatedSettings = { ...settings, enabled: newEnabled };
    await chrome.storage.sync.set({ clockSettings: updatedSettings });
    
    // Notify content script
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'toggle',
          enabled: newEnabled
        });
      } catch (error) {
        console.error('Failed to notify content script:', error);
      }
    }
    
    // Show brief notification
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Floating Clock',
        message: newEnabled ? 'Clock enabled' : 'Clock disabled'
      });
    }
  } catch (error) {
    console.error('Failed to toggle clock:', error);
  }
});
