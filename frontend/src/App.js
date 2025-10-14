import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import { Toaster } from "react-hot-toast";
import Leaderboard from "./pages/LeaderBoard";
import Profile from "./pages/Profile";
import { DarkModeProvider } from "./components/DarkModeToggle"; // Import the provider

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Toaster />
      </Router>
    </DarkModeProvider>
  );
}

export default App;