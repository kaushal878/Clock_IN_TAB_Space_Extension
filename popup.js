class PopupController {
  constructor() {
    this.settings = {
      enabled: true,
      format24: false,
      focusMode: false,
      lockScreen: false,
      position: { x: 20, y: 20 }
    };
    
    this.elements = {};
    this.init();
  }

  async init() {
    this.cacheElements();
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  cacheElements() {
    this.elements = {
      toggleClock: document.getElementById('toggle-clock'),
      toggleFormat: document.getElementById('toggle-format'),
      toggleFocus: document.getElementById('toggle-focus'),
      toggleLockScreen: document.getElementById('toggle-lockscreen'),
      resetSettings: document.getElementById('reset-settings')
    };
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['clockSettings']);
      if (result.clockSettings) {
        this.settings = { ...this.settings, ...result.clockSettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ clockSettings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  setupEventListeners() {
    // Toggle switches
    this.elements.toggleClock.addEventListener('change', (e) => {
      this.handleToggle('enabled', e.target.checked);
    });

    this.elements.toggleFormat.addEventListener('change', (e) => {
      this.handleToggle('format24', e.target.checked);
    });

    this.elements.toggleFocus.addEventListener('change', (e) => {
      this.handleToggle('focusMode', e.target.checked);
    });

    this.elements.toggleLockScreen.addEventListener('change', (e) => {
      this.handleToggle('lockScreen', e.target.checked);
    });

    // Reset button
    this.elements.resetSettings.addEventListener('click', () => {
      this.resetSettings();
    });

    // Close popup when settings are changed
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.close();
      }
    });
  }

  async handleToggle(setting, value) {
    this.settings[setting] = value;
    
    // Handle mutually exclusive modes
    if (setting === 'lockScreen' && value) {
      this.settings.focusMode = false;
    } else if (setting === 'focusMode' && value) {
      this.settings.lockScreen = false;
    }

    await this.saveSettings();
    await this.notifyContentScript(setting, value);
    this.updateUI();
    this.showSuccessAnimation();
  }

  async notifyContentScript(action, value) {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.id) {
        // Send message to content script
        let message;
        switch (action) {
          case 'enabled':
            message = { action: 'toggle', enabled: value };
            break;
          case 'format24':
            message = { action: 'setFormat', format24: value };
            break;
          case 'focusMode':
            message = { action: 'setFocusMode', enabled: value };
            break;
          case 'lockScreen':
            message = { action: 'setLockScreen', enabled: value };
            break;
          default:
            return;
        }

        await chrome.tabs.sendMessage(tab.id, message);
      }
    } catch (error) {
      console.error('Failed to notify content script:', error);
    }
  }

  updateUI() {
    // Update toggle states
    this.elements.toggleClock.checked = this.settings.enabled;
    this.elements.toggleFormat.checked = this.settings.format24;
    this.elements.toggleFocus.checked = this.settings.focusMode;
    this.elements.toggleLockScreen.checked = this.settings.lockScreen;

    // Update UI states based on settings
    const settingItems = document.querySelectorAll('.setting-item');
    settingItems.forEach(item => {
      if (this.settings.enabled) {
        item.style.opacity = '1';
        item.style.pointerEvents = 'auto';
      } else {
        // Only disable non-enabled toggle
        const toggleInput = item.querySelector('input:not(#toggle-clock)');
        if (toggleInput) {
          item.style.opacity = '0.5';
          item.style.pointerEvents = 'none';
        }
      }
    });
  }

  showSuccessAnimation() {
    const settingItems = document.querySelectorAll('.setting-item');
    settingItems.forEach(item => {
      item.classList.add('success-animation');
      setTimeout(() => {
        item.classList.remove('success-animation');
      }, 600);
    });
  }

  async resetSettings() {
    const confirmed = confirm('Are you sure you want to reset all settings to default?');
    if (!confirmed) return;

    // Reset to defaults
    this.settings = {
      enabled: true,
      format24: false,
      focusMode: false,
      lockScreen: false,
      position: { x: 20, y: 20 }
    };

    await this.saveSettings();
    await this.notifyContentScript('enabled', this.settings.enabled);
    await this.notifyContentScript('format24', this.settings.format24);
    await this.notifyContentScript('focusMode', this.settings.focusMode);
    await this.notifyContentScript('lockScreen', this.settings.lockScreen);
    
    this.updateUI();
    this.showSuccessAnimation();

    // Show confirmation
    this.showNotification('Settings reset to default');
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(76, 175, 80, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 1000;
      animation: slideDown 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add slide down animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 2 seconds
    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => {
        notification.remove();
        style.remove();
      }, 300);
    }, 2000);
  }
}

// Initialize popup controller
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
