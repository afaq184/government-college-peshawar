import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';

// Legacy QR / printed links use hash routes (#/student/...). Convert to path
// routes before the router module loads so createBrowserRouter sees the right URL.
async function bootstrap() {
  const { hash, pathname, search } = window.location;
  if (hash.startsWith('#/') && (pathname === '/' || pathname === '')) {
    window.history.replaceState(null, '', `${hash.slice(1)}${search}`);
  }

  const { default: App } = await import('./App.tsx');

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
