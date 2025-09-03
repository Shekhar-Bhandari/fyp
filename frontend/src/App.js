import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';

import { Toaster } from "react-hot-toast";
import Home from './pages/Home';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Container maxWidth="lg">
          <Navbar />
          <Routes>
            <Route path="/home" element={<Home />} />
            
            <Route path="/auth" element={<Auth />} />
            
          </Routes>
        </Container>
      </Router>
      <Toaster/>
    </Provider>
  );
}

export default App;