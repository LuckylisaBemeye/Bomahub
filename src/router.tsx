// src/router.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';

const AppRouter = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tenants" element={<Tenants />} />
    </Routes>
  </Router>
);

export default AppRouter;