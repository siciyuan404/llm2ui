/**
 * Application Entry Point
 * 
 * Sets up React Router for navigation between main app and showcase pages.
 * 
 * @module main
 * @see Requirements 6.1, 6.2
 */

console.log('[main.tsx] Starting application...');

import { StrictMode, Component, type ReactNode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

console.log('[main.tsx] React imports loaded');

import './index.css'

console.log('[main.tsx] CSS loaded');

// Initialize component registry with shadcn components
import { initializeDefaultRegistry } from '@/lib';
initializeDefaultRegistry();
console.log('[main.tsx] Component registry initialized');

// Error Boundary for catching render errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: 'red' }}>应用加载错误</h1>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}>
            清除缓存并刷新
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading fallback
const LoadingFallback = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <p>Loading application...</p>
  </div>
);

// Lazy load components to better identify loading issues
const App = lazy(() => {
  console.log('[main.tsx] Loading App component...');
  return import('./App.tsx');
});

const ComponentShowcase = lazy(() => {
  console.log('[main.tsx] Loading ComponentShowcase...');
  return import('./components/showcase').then(m => ({ default: m.ComponentShowcase }));
});

// Configure Monaco Editor (lazy, after basic imports)
import('@/lib/utils/monaco-config').catch(err => {
  console.warn('Monaco config failed to load:', err);
});

console.log('[main.tsx] Setting up root element...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<div style="padding:20px;color:red;">Root element not found!</div>';
} else {
  console.log('[main.tsx] Rendering React app...');
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              {/* Showcase routes - supports /showcase, /showcase/tokens, /showcase/components, /showcase/examples, /showcase/themes */}
              <Route path="/showcase" element={<ComponentShowcase className="h-screen" />} />
              <Route path="/showcase/tokens" element={<ComponentShowcase className="h-screen" initialModule="tokens" />} />
              <Route path="/showcase/tokens/*" element={<ComponentShowcase className="h-screen" initialModule="tokens" />} />
              <Route path="/showcase/components" element={<ComponentShowcase className="h-screen" initialModule="components" />} />
              <Route path="/showcase/components/*" element={<ComponentShowcase className="h-screen" initialModule="components" />} />
              <Route path="/showcase/examples" element={<ComponentShowcase className="h-screen" initialModule="examples" />} />
              <Route path="/showcase/examples/*" element={<ComponentShowcase className="h-screen" initialModule="examples" />} />
              <Route path="/showcase/themes" element={<ComponentShowcase className="h-screen" initialModule="themes" />} />
              <Route path="/showcase/themes/*" element={<ComponentShowcase className="h-screen" initialModule="themes" />} />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </ErrorBoundary>
    </StrictMode>,
  );
  console.log('[main.tsx] React render called');
}
