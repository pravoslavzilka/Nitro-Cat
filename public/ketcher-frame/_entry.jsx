
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';
import 'ketcher-react/dist/index.css';

const structServiceProvider = new StandaloneStructServiceProvider();

function App() {
  return React.createElement(Editor, {
    staticResourcesUrl: '/ketcher/',
    structServiceProvider,
    onInit: (ketcher) => {
      window._ketcher = ketcher;
      window.parent.postMessage({ type: 'ketcher-ready' }, '*');
    },
  });
}

createRoot(document.getElementById('root')).render(React.createElement(App));

// Listen for commands from the parent frame
window.addEventListener('message', async (e) => {
  if (!window._ketcher) return;
  if (e.data?.type === 'get-smiles') {
    try {
      const smiles = await window._ketcher.getSmiles();
      window.parent.postMessage({ type: 'smiles-result', smiles }, '*');
    } catch (err) {
      window.parent.postMessage({ type: 'smiles-result', smiles: '', error: String(err) }, '*');
    }
  }
  if (e.data?.type === 'set-smiles' && e.data.smiles) {
    try {
      await window._ketcher.setMolecule(e.data.smiles);
    } catch {}
  }
});
