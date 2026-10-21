import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n.js';
import App from './App.jsx';

// Route localStorage to sessionStorage for multi-tab multi-account session isolation
try {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: window.sessionStorage,
      configurable: true,
      enumerable: true,
      writable: true
    });
  }
} catch (e) {
  try {
    Storage.prototype.getItem = function (key) {
      return sessionStorage.getItem(key);
    };
    Storage.prototype.setItem = function (key, val) {
      sessionStorage.setItem(key, val);
    };
    Storage.prototype.removeItem = function (key) {
      sessionStorage.removeItem(key);
    };
    Storage.prototype.clear = function () {
      sessionStorage.clear();
    };
  } catch (err) {
    console.error('Failed to apply tab session isolation wrapper:', err);
  }
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
