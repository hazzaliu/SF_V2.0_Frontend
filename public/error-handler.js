// Global error handler for browser extension and async listener errors
if (typeof window !== 'undefined') {
  // Suppress browser extension errors that don't affect application functionality
  window.addEventListener('error', function(event) {
    if (event.error && event.error.message) {
      const message = event.error.message;
      
      // Check for specific browser extension errors
      if (message.includes('listener indicated an asynchronous response') ||
          message.includes('message channel closed') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://')) {
        console.warn('Suppressing browser extension error:', message);
        event.preventDefault();
        return false;
      }
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message) {
      const message = event.reason.message;
      
      // Suppress browser extension promise rejections
      if (message.includes('listener indicated an asynchronous response') ||
          message.includes('message channel closed') ||
          message.includes('Extension context invalidated') ||
          message.includes('chrome-extension://')) {
        console.warn('Suppressing browser extension promise rejection:', message);
        event.preventDefault();
        return false;
      }
    }
  });

  // Additional Chrome extension specific error handling
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    try {
      // Suppress chrome.runtime errors that don't affect the app
      const originalRuntimeSendMessage = chrome.runtime.sendMessage;
      if (originalRuntimeSendMessage) {
        chrome.runtime.sendMessage = function(...args) {
          try {
            return originalRuntimeSendMessage.apply(this, args);
          } catch (error) {
            console.warn('Suppressed chrome.runtime.sendMessage error:', error.message);
            return Promise.reject(error);
          }
        };
      }
    } catch (e) {
      // Ignore if chrome.runtime is not available
    }
  }
} 