import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PromptPage from './pages/PromptPage';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PromptPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;