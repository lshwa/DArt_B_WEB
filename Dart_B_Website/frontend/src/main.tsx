import React from 'react';
import ReactDOM from 'react-dom/client';
import '../globals.css';
import App from '../App';

const rootEl = document.getElementById('root')!;
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


