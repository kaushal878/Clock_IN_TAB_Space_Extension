# Floating Clock Overlay Extension

A production-ready Chromium browser extension that displays a persistent floating clock overlay with modern glassmorphism design.

## Features

### Core Features
- **Floating Clock Overlay**: Always-visible clock that works across all websites
- **Real-time Updates**: Clock updates every second with smooth animations
- **Draggable Position**: Click and drag to reposition the clock anywhere on screen
- **Toggle Control**: Easy ON/OFF switch in extension popup
- **Time Formats**: Switch between 12-hour and 24-hour formats
- **Persistent Settings**: All preferences saved using chrome.storage
- **Lightweight**: Minimal performance impact, no heavy libraries

### Advanced Features
- **Focus Mode**: Dark overlay behind clock for better concentration
- **Lock Screen Mode**: Enhanced dim background with larger clock display
- **Auto-hide**: Automatically hides when video is in fullscreen
- **Smooth Animations**: Fade in/out effects and hover states
- **Glassmorphism Design**: Modern frosted glass aesthetic

## Installation

### For Brave Browser

1. **Download the Extension Files**
   - Download or clone this repository to your local machine

2. **Open Brave Extensions Page**
   - Open Brave browser
   - Navigate to `brave://extensions/`
   - Or go to Menu → Extensions → Extensions

3. **Enable Developer Mode**
   - Toggle on "Developer mode" in the top-right corner

4. **Load the Extension**
   - Click on "Load unpacked"
   - Navigate to and select the `Clock_IN_TAB_Space` folder
   - Click "Select Folder"

5. **Verify Installation**
   - The Floating Clock icon should appear in your toolbar
   - The clock overlay should be visible on web pages

### For Chrome/Edge (Alternative)

The same steps work for Chrome and Edge browsers:
- Chrome: Navigate to `chrome://extensions/`
- Edge: Navigate to `edge://extensions/`

## Usage

### Basic Controls
1. **Toggle Clock**: Click the extension icon to open the popup menu
2. **Enable/Disable**: Use the "Enable Clock" toggle
3. **Time Format**: Switch between 12-hour and 24-hour formats
4. **Reposition**: Click and drag the clock to move it

### Advanced Features
1. **Focus Mode**: Enable to darken the background for better concentration
2. **Lock Screen**: Enable for a lock-screen style experience with enhanced visibility
3. **Reset Settings**: Use the "Reset Settings" button to restore defaults

### Keyboard Shortcuts
- **ESC**: Close the popup menu
- **Extension Icon Click**: Quick toggle without opening popup

## File Structure

```
Clock_IN_TAB_Space/
├── manifest.json          # Extension configuration
├── content.js             # Clock overlay logic
├── content.css            # Clock overlay styles
├── popup.html             # Settings popup interface
├── popup.js               # Popup functionality
├── popup.css              # Popup styling
├── background.js          # Service worker for storage and management
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Technical Details

### Compatibility
- **Manifest V3**: Uses the latest Chrome extension standards
- **Browser Support**: Brave, Chrome, Edge, and other Chromium-based browsers
- **Permissions**: Minimal permissions required (storage, activeTab, scripting)

### Architecture
- **Content Script**: Injects and manages the clock overlay
- **Background Service Worker**: Handles storage and cross-tab communication
- **Popup Interface**: User controls and settings management
- **CSS**: Modern glassmorphism design with smooth animations

### Performance
- **Lightweight**: ~50KB total size
- **Efficient Updates**: Updates only when necessary
- **Memory Friendly**: Cleans up resources properly
- **Non-intrusive**: Doesn't interfere with website functionality

## Troubleshooting

### Clock Not Visible
1. Check if the extension is enabled in `brave://extensions/`
2. Ensure "Enable Clock" is toggled on in the popup
3. Try refreshing the webpage

### Settings Not Saving
1. Check browser sync settings
2. Ensure storage permissions are granted
3. Try resetting settings and reconfiguring

### Performance Issues
1. Disable advanced features (Focus Mode, Lock Screen)
2. Check if other extensions are conflicting
3. Restart the browser

## Development

### Building from Source
1. Clone this repository
2. Modify files as needed
3. Load as unpacked extension in developer mode

### Customization
- **Colors**: Modify `content.css` and `popup.css` for theme changes
- **Position**: Adjust default position in `background.js`
- **Features**: Add new settings in `popup.js` and handle in `content.js`

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Support

For issues and feature requests, please check the troubleshooting section or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: May 2026  
**Compatible**: Brave, Chrome, Edge (Manifest V3)
