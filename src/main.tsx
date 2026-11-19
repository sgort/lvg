// The entry: the one global stylesheet, and the router under the configured base path. The
// stand-in MijnOverheid frame goes around the content unless the build sets VITE_FRAME=off.
import './styles/global.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { kaderRoute } from './frame/kaderRoute';
import { routes } from './routes';

const metKader = import.meta.env.VITE_FRAME === 'off' ? routes : [kaderRoute(routes)];
const router = createBrowserRouter(metKader, {
  basename: import.meta.env.VITE_BASE_PATH ?? '/',
});

const root = document.getElementById('root');
if (!root) throw new Error('The page has no #root element');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
