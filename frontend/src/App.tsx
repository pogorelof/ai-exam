import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ClassDetail from './pages/ClassDetail';
import TestPage from './pages/TestPage';
import CreateQuestion from './pages/CreateQuestion';
import { PublicRoute } from './components/PublicRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/class/:id" element={<ClassDetail />} />
        <Route path="/class/:id/create-question" element={<CreateQuestion />} />
        <Route path="/test/:id" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
