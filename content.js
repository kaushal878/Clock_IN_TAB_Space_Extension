class FloatingClock {
  constructor() {
    this.clockElement = null;
    this.focusOverlay = null;
    this.lockScreenOverlay = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.settings = {
      enabled: true,
      format24: false,
      focusMode: false,
      lockScreen: false,
      position: { x: 20, y: 20 }
    };
    this.updateInterval = null;
    this.fullscreenObserver = null;
    
    this.init();
  }

  async init() {
    await this.loadSettings();
    if (this.settings.enabled) {
      this.createClock();
      this.startClock();
      this.setupFullscreenDetection();
    }
    this.setupMessageListener();
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

  createClock() {
    // Remove existing clock if any
    if (this.clockElement) {
      this.clockElement.remove();
    }

    this.clockElement = document.createElement('div');
    this.clockElement.className = 'floating-clock-overlay';
    this.clockElement.id = 'floating-clock';
    
    // Apply saved position
    this.clockElement.style.right = this.settings.position.x + 'px';
    this.clockElement.style.bottom = this.settings.position.y + 'px';

    // Apply mode classes
    if (this.settings.focusMode) {
      this.clockElement.classList.add('focus-mode');
    }
    if (this.settings.lockScreen) {
      this.clockElement.classList.add('lock-screen');
    }

    this.updateTime();
    this.setupDragAndDrop();
    
    document.body.appendChild(this.clockElement);
  }

  updateTime() {
    if (!this.clockElement) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    let timeString;
    if (this.settings.format24) {
      timeString = `${hours.toString().padStart(2, '0')}:${minutes}:${seconds}`;
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
    }

    const dateString = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });

    this.clockElement.innerHTML = `
      <span class="time-display">${timeString}</span>
      <span class="date-display">${dateString}</span>
    `;
  }

  startClock() {
    this.updateTime();
    this.updateInterval = setInterval(() => this.updateTime(), 1000);
  }

  stopClock() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  setupDragAndDrop() {
    let startX, startY, initialX, initialY;

    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Only left click
      
      this.isDragging = true;
      this.clockElement.classList.add('dragging');
      
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = this.clockElement.getBoundingClientRect();
      initialX = window.innerWidth - rect.right;
      initialY = window.innerHeight - rect.bottom;
      
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!this.isDragging) return;
      
      const deltaX = startX - e.clientX;
      const deltaY = startY - e.clientY;
      
      const newRight = Math.max(0, Math.min(window.innerWidth - 150, initialX + deltaX));
      const newBottom = Math.max(0, Math.min(window.innerHeight - 80, initialY + deltaY));
      
      this.clockElement.style.right = newRight + 'px';
      this.clockElement.style.bottom = newBottom + 'px';
      
      this.settings.position = { x: newRight, y: newBottom };
    };

    const handleMouseUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.clockElement.classList.remove('dragging');
        this.saveSettings();
      }
    };

    this.clockElement.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  createFocusOverlay() {
    if (this.focusOverlay) {
      this.focusOverlay.remove();
    }

    this.focusOverlay = document.createElement('div');
    this.focusOverlay.className = 'focus-overlay';
    this.focusOverlay.id = 'focus-overlay';
    
    if (this.settings.focusMode) {
      this.focusOverlay.classList.add('active');
    }
    
    document.body.appendChild(this.focusOverlay);
  }

  createLockScreenOverlay() {
    if (this.lockScreenOverlay) {
      this.lockScreenOverlay.remove();
    }

    this.lockScreenOverlay = document.createElement('div');
    this.lockScreenOverlay.className = 'lock-screen-overlay';
    this.lockScreenOverlay.id = 'lock-screen-overlay';
    
    if (this.settings.lockScreen) {
      this.lockScreenOverlay.classList.add('active');
    }
    
    document.body.appendChild(this.lockScreenOverlay);
  }

  toggleEnabled(enabled) {
    this.settings.enabled = enabled;
    
    if (enabled) {
      this.createClock();
      this.startClock();
      this.setupFullscreenDetection();
    } else {
      this.stopClock();
      if (this.clockElement) {
        this.clockElement.classList.add('hidden');
        setTimeout(() => {
          if (this.clockElement) {
            this.clockElement.remove();
            this.clockElement = null;
          }
        }, 300);
      }
      this.removeOverlays();
    }
    
    this.saveSettings();
  }

  toggleFormat(format24) {
    this.settings.format24 = format24;
    this.updateTime();
    this.saveSettings();
  }

  toggleFocusMode(enabled) {
    this.settings.focusMode = enabled;
    
    if (enabled) {
      if (!this.focusOverlay) {
        this.createFocusOverlay();
      } else {
        this.focusOverlay.classList.add('active');
      }
      if (this.clockElement) {
        this.clockElement.classList.add('focus-mode');
      }
    } else {
      if (this.focusOverlay) {
        this.focusOverlay.classList.remove('active');
      }
      if (this.clockElement) {
        this.clockElement.classList.remove('focus-mode');
      }
    }
    
    this.saveSettings();
  }

  toggleLockScreen(enabled) {
    this.settings.lockScreen = enabled;
    
    if (enabled) {
      this.toggleFocusMode(false); // Disable focus mode when lock screen is enabled
      if (!this.lockScreenOverlay) {
        this.createLockScreenOverlay();
      } else {
        this.lockScreenOverlay.classList.add('active');
      }
      if (this.clockElement) {
        this.clockElement.classList.add('lock-screen');
      }
    } else {
      if (this.lockScreenOverlay) {
        this.lockScreenOverlay.classList.remove('active');
      }
      if (this.clockElement) {
        this.clockElement.classList.remove('lock-screen');
      }
    }
    
    this.saveSettings();
  }

  removeOverlays() {
    if (this.focusOverlay) {
      this.focusOverlay.remove();
      this.focusOverlay = null;
    }
    if (this.lockScreenOverlay) {
      this.lockScreenOverlay.remove();
      this.lockScreenOverlay = null;
    }
  }

  setupFullscreenDetection() {
    // Check for fullscreen video elements
    this.fullscreenObserver = new MutationObserver(() => {
      const fullscreenElement = document.fullscreenElement || 
                                document.webkitFullscreenElement ||
                                document.mozFullScreenElement ||
                                document.msFullscreenElement;
      
      if (fullscreenElement && fullscreenElement.tagName === 'VIDEO') {
        if (this.clockElement) {
          this.clockElement.style.display = 'none';
        }
      } else {
        if (this.clockElement) {
          this.clockElement.style.display = 'block';
        }
      }
    });

    this.fullscreenObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
  }

  handleFullscreenChange() {
    const fullscreenElement = document.fullscreenElement || 
                              document.webkitFullscreenElement ||
                              document.mozFullScreenElement ||
                              document.msFullscreenElement;
    
    if (fullscreenElement) {
      if (this.clockElement) {
        this.clockElement.style.display = 'none';
      }
    } else {
      if (this.clockElement && this.settings.enabled) {
        this.clockElement.style.display = 'block';
      }
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'toggle':
          this.toggleEnabled(request.enabled);
          sendResponse({ success: true });
          break;
        case 'setFormat':
          this.toggleFormat(request.format24);
          sendResponse({ success: true });
          break;
        case 'setFocusMode':
          this.toggleFocusMode(request.enabled);
          sendResponse({ success: true });
          break;
        case 'setLockScreen':
          this.toggleLockScreen(request.enabled);
          sendResponse({ success: true });
          break;
        case 'getSettings':
          sendResponse({ settings: this.settings });
          break;
      }
    });
  }

  cleanup() {
    this.stopClock();
    if (this.clockElement) {
      this.clockElement.remove();
    }
    this.removeOverlays();
    if (this.fullscreenObserver) {
      this.fullscreenObserver.disconnect();
    }
  }
}

// Initialize the floating clock
let floatingClock;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    floatingClock = new FloatingClock();
  });
} else {
  floatingClock = new FloatingClock();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (floatingClock) {
    floatingClock.cleanup();
  }
});
