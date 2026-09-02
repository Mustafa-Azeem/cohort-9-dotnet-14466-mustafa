import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootContainer = document.getElementById('root');
if (rootContainer) {
  createRoot(rootContainer).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
