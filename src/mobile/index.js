// Bypass Hermes read-only Event properties bug
if (global.Event) {
  try {
    Object.defineProperty(global.Event, 'NONE', { value: 0, writable: true, configurable: true });
    Object.defineProperty(global.Event, 'CAPTURING_PHASE', { value: 1, writable: true, configurable: true });
    Object.defineProperty(global.Event, 'AT_TARGET', { value: 2, writable: true, configurable: true });
    Object.defineProperty(global.Event, 'BUBBLING_PHASE', { value: 3, writable: true, configurable: true });
  } catch (e) {}
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
