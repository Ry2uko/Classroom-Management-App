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

/* FOR REFERENCE:
  c - content
  u - user
  r - course
  l - classroom
*/

/* NEXT STEPS */
// TODO: / (admin)
// TODO: GCC (General Content Component)
  // TODO: GCC-Course
  // TODO: GCC-Content
  // TODO: GCC-Classroom
// TODO: /l/<id>
// TODO: /classrooms
// TODO: /r/<id>
// TODO: /courses
// TODO: /c/<id>
// TODO: /school

/* TODO (later) */
// TODO: Unfinished APIs in views.py
// TODO: File Uploading in /c/create (https://youtu.be/_RSaI2CxlXU?si=4HXs8NccInjjPB8b)
// TODO: / (super admin)