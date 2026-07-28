// Polyfill for DOMException in React Native (Hermes)
if (typeof global.DOMException === 'undefined') {
  class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'DOMException';
    }
  }
  
  global.DOMException = DOMException;
  globalThis.DOMException = DOMException;
  console.log('✅ DOMException polyfill applied');
}
