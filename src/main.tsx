import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

(window as unknown as { __ZK_MOUNTED__?: boolean }).__ZK_MOUNTED__ = true;

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
