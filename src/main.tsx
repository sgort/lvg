// The entry: the one global stylesheet, and the router under the configured base path.
import './styles/global.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from './routes';

const router = createBrowserRouter(routes, { basename: import.meta.env.VITE_BASE_PATH ?? '/' });

const root = document.getElementById('root');
if (!root) throw new Error('The page has no #root element');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
