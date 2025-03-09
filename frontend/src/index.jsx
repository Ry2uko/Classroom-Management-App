import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter  } from 'react-router';
import App from './App';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

/* TODO (later) */
// TODO: Unfinished APIs in views.py
// TODO: File Uploading in /c/create (https://youtu.be/_RSaI2CxlXU?si=4HXs8NccInjjPB8b)