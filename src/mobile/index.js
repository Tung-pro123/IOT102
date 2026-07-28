// Intercept Object.defineProperty to prevent Event.NONE read-only crash in React Native 0.74+
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(obj, prop, descriptor) {
  if (prop === 'NONE' || prop === 'CAPTURING_PHASE' || prop === 'AT_TARGET' || prop === 'BUBBLING_PHASE') {
    if (descriptor) {
      descriptor.configurable = true;
      if ('value' in descriptor) {
        descriptor.writable = true;
      }
    }
  }
  return originalDefineProperty(obj, prop, descriptor);
};

const originalFreeze = Object.freeze;
Object.freeze = function(obj) {
  if (obj && (obj.NONE !== undefined || obj.CAPTURING_PHASE !== undefined)) {
    // Không đóng băng các object có chứa NONE (như Event) để tránh lỗi read-only
    return obj;
  }
  return originalFreeze(obj);
};

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
