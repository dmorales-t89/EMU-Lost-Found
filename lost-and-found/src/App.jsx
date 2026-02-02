import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LostItemsPage from './pages/LostItemsPage';
import LostSubmitFormPage from './pages/LostSubmitFormPage';
import ItemDetailPage from './pages/ItemDetailPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lost-items" element={<LostItemsPage />} />
        <Route path="/lost-items/:id" element={<ItemDetailPage />} />
        <Route path="/lost-submit-form" element={<LostSubmitFormPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
