// CRITICAL TEST - This should ALWAYS log if JS is executing
window.addEventListener('DOMContentLoaded', () => {
  console.log('=== DOMContentLoaded - JavaScript IS executing ===');
  alert('JavaScript is working! Check console.');
});

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('=== GLOBAL ERROR ===', event.error);
  alert('Error: ' + (event.error?.message || event.message));
  debugger;
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===', event.reason);
  alert('Unhandled Promise Rejection: ' + String(event.reason));
  debugger;
});

console.log('=== main.tsx - Script loaded ===');

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('main.tsx - Starting app initialization');

// Initialize features (register built-in features)
try {
  console.log('main.tsx - About to import features');
  import('@/lib/features/built-in').then(() => {
    console.log('main.tsx - Features imported');
  }).catch(err => {
    console.error('main.tsx - Feature import error:', err);
  });
} catch (error) {
  console.error('main.tsx - Feature import failed:', error);
}

console.log('main.tsx - About to render App');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('main.tsx - Root element not found!');
    throw new Error('Root element not found');
  }
  
  // Wrap App in error boundary
  const AppWithErrorBoundary = () => {
    try {
      return <App />;
    } catch (error) {
      console.error('App render error:', error);
      debugger;
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>App Render Error</h1>
          <pre>{String(error)}</pre>
        </div>
      );
    }
  };
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppWithErrorBoundary />
    </React.StrictMode>
  );
  
  console.log('main.tsx - App rendered successfully');
} catch (error) {
  console.error('main.tsx - Render error:', error);
  debugger;
  document.body.innerHTML = `<div style="padding: 20px; color: red;">
    <h1>Error Rendering App</h1>
    <pre>${String(error)}</pre>
    <p>Check console for details</p>
  </div>`;
}

