// src/pages/Home.js
import React from "react";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate("/create-post"); // Redirect to create post page (you can create this later)
  };

  return (
    <div>
      {/* Top AppBar */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo */}
          <Typography variant="h6" component="div">
            MyLogo
          </Typography>

          {/* Create Post Button */}
          <Button color="inherit" onClick={handleCreatePost}>
            Create Post
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Box>
          <Typography variant="h5" align="center">
            Welcome to the Homepage
          </Typography>

          {/* Posts will go here */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="body1" align="center" color="textSecondary">
              No posts yet. Click "Create Post" to add a new post.
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
