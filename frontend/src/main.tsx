import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
import Formatador from './Formatador/Formatador.tsx';
import Message from './Message/Message.tsx';
import Agile from './Agile/Agile.tsx';
import './Globals.css'
import App from './App.tsx'
import Extrator from './Extrator/Extrator.tsx';
import ExtratorXML from './ExtratorXml/ExtratorXml.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/message" element={<Message />} />
        <Route path="/formatador" element={<Formatador />} />
        <Route path="/agile" element={<Agile />} />
        <Route path="/extrator" element={<Extrator />} />        
        <Route path="/extratorxml" element={<ExtratorXML />} />        
      </Routes>
    </BrowserRouter>

  </StrictMode>,
)
