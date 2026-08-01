import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Convert legacy hash routes (#/student/..., #/x/.../enter) to path routes for Vercel.
(() => {
  const { hash, pathname, search } = window.location;
  if (hash.startsWith('#/') && (pathname === '/' || pathname === '')) {
    window.history.replaceState(null, '', `${hash.slice(1)}${search}`);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
