import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import AddBook from './pages/AddBook';
import BookList from './pages/BookList';
import EditBook from './pages/EditBook';

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap pages in Layout to show navbar/sidebar on all */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add" element={<AddBook />} />
          <Route path="list" element={<BookList />} />
          <Route path="edit-book/:id" element={<EditBook />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
