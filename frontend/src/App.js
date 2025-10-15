import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Pages Components
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Leaderboard from "./pages/LeaderBoard";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile1"; // 👈 NEW: Dynamic profile component

// Components/Context
import { DarkModeProvider } from "./components/DarkModeToggle"; 
import ProfileSetup from "./pages/ProfileSetup";

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          {/* Authentication */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Main App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          
          {/* Profile Routes */}
          {/* 1. Route for the Current User (static) */}
          <Route path="/profile" element={<Profile />} />
          
          {/* 2. Route for Other Users (dynamic with ID) */}
        {/* <Route path="/profile/:userId" element={<PublicProfile />} />  */}  
          <Route path="/profile-setup" element={<ProfileSetup/>} />

        </Routes>
        <Toaster />
      </Router>
    </DarkModeProvider>
  );
}

export default App;