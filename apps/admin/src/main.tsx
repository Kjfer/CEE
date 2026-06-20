import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { mockLogin } from '@/mocks/auth';
import { router } from '@/router';
import './index.css';

// Fase 5: sin backend real todavía, se simula la sesión admin al levantar la app.
mockLogin();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
