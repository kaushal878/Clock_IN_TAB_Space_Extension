// Debug script to test extension loading
console.log('Floating Clock Extension: Debug script loaded');

// Test chrome APIs availability
if (typeof chrome !== 'undefined') {
  console.log('Chrome API available');
  
  if (chrome.storage) {
    console.log('Chrome storage API available');
  } else {
    console.error('Chrome storage API not available');
  }
  
  if (chrome.runtime) {
    console.log('Chrome runtime API available');
  } else {
    console.error('Chrome runtime API not available');
  }
} else {
  console.error('Chrome API not available');
}

// Test DOM manipulation
if (document.body) {
  console.log('Document body available');
  
  // Create a test element
  const testDiv = document.createElement('div');
  testDiv.id = 'clock-test';
  testDiv.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: red;
    color: white;
    padding: 10px;
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;
  testDiv.textContent = 'Clock Extension Test - If you see this, the extension is working!';
  
  document.body.appendChild(testDiv);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (testDiv.parentNode) {
      testDiv.parentNode.removeChild(testDiv);
    }
  }, 5000);
  
  console.log('Test element created');
} else {
  console.error('Document body not available');
}

console.log('Floating Clock Extension: Debug script completed');
