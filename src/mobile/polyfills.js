throw new Error('POLYFILL IS RUNNING SUCCESSFULLY');

// Polyfill for DOMException in React Native
if (typeof global.DOMException === 'undefined') {
  var DOMException = function(message, name) {
    this.message = message || '';
    this.name = name || 'DOMException';
    this.stack = (new Error()).stack;
  };
  DOMException.prototype = Object.create(Error.prototype);
  DOMException.prototype.constructor = DOMException;

  global.DOMException = DOMException;
  globalThis.DOMException = DOMException;
  console.log('✅ DOMException polyfill applied');
}
