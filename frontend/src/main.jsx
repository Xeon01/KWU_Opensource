import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DemoProvider } from './contexts/DemoContext.jsx';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DemoProvider>
        <App />
      </DemoProvider>
    </BrowserRouter>
  </StrictMode>,
);
