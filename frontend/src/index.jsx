import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter  } from 'react-router';
import { LoginProvider  } from './contexts/LoginContext';
import { ClassroomProvider } from './contexts/ClassroomContext';
import App from './App';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <LoginProvider>
    <ClassroomProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClassroomProvider>
  </LoginProvider>
);
