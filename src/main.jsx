import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { AudioProvider } from './context/AudioContext.jsx';

import { DyslexiaProvider } from './context/DyslexiaContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider>
      <ProfileProvider>
        <DyslexiaProvider>
          <App />
        </DyslexiaProvider>
      </ProfileProvider>
    </AudioProvider>
  </React.StrictMode>
);
