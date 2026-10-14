import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
  const html = renderToString(React.createElement(App));
  if (!html.includes('麻雀を学ぶ') || !html.includes('/tiles/Regular/Man1.svg')) {
    throw new Error('The home screen did not render the expected content.');
  }
  console.log('Home screen renders with the local tile assets.');
} finally {
  await vite.close();
}
