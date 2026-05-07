import { createElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { LandingPage } from './components/LandingPage';
import { FanLayout } from './components/FanLayout';
import { FanHome } from './components/FanHome';
import { StampRally } from './components/StampRally';
import { FanSettings } from './components/FanSettings';
import { OshiDashboard } from './components/OshiDashboard';

export const router = createBrowserRouter([
  { path: '/', Component: LandingPage },
  {
    path: '/fan',
    Component: FanLayout,
    children: [
      { index: true, Component: FanHome },
      { path: 'stamp', Component: StampRally },
      { path: 'settings', Component: FanSettings },
    ],
  },
  { path: '/oshi', Component: OshiDashboard },
  { path: '*', element: createElement(Navigate, { to: '/', replace: true }) },
], {
  basename: import.meta.env.BASE_URL.replace(/\/$/, ''),
});
