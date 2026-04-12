import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
// main.jsx
import { clarity } from 'clarity-js';
import { StrictMode } from 'react';


clarity.start({
  projectId: 'wa64f9yvoq',
  upload: 'https://m.clarity.ms/collect',
  track: true,
  content: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(<App />);
