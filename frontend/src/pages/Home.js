// Add these imports at the top
import React, { useEffect, useState } from "react";
import {
  Container, Button, Card, CardContent, CardMedia, Typography, Grid,
  AppBar, Toolbar, Box, IconButton, Avatar, Select, MenuItem
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import DarkModeToggle, { useDarkMode } from "../components/DarkModeToggle";

const specializations = [
  "All",
  "Machine Learning",
  "Web Development",
  "Mobile App Development",
  "Cloud Computing",
  "DevOps",
  "AI"
];

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [selectedField, setSelectedField] = useState("All"); // NEW
  const darkMode = useDarkMode();
  const navigate = useNavigate();

  const bgColor = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBgColor = darkMode ? "#2d2d2d" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";

  const updateUser = () => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
  };

  useEffect(() => {
    updateUser();
    fetchPosts();

    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts();
      setPosts(res.data);
    } catch (error) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    setPosts([]);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleLike = async (postId) => {
    if (!currentUser?.token) {
      toast.error("Login to like posts");
      navigate("/auth");
      return;
    }
    try {
      const res = await PostServices.likePost(postId);
      const updatedPost = res.data;
      setPosts((prev) =>
        prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
      const likedByUser = updatedPost.likes.some(
        (like) => (like.user?._id || like.user) === currentUser?._id
      );
      toast.success(likedByUser ? "Post liked!" : "Post unliked!");
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    navigate(navItem === "home" ? "/home" : `/${navItem}`);
  };

  const filteredPosts = posts.filter(post =>
    selectedField === "All" || post.specialization === selectedField
  );

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor }}>
      <AppBar position="static" color="default" sx={{ backgroundColor: cardBgColor }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
            Connectiva
          </Typography>
          <DarkModeToggle />
          <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
            <Button startIcon={<HomeIcon />} onClick={() => handleNavClick("home")} variant={activeNav === "home" ? "contained" : "text"}>Home</Button>
            <Button startIcon={<LeaderboardIcon />} onClick={() => handleNavClick("leaderboard")} variant={activeNav === "leaderboard" ? "contained" : "text"}>Leaderboard</Button>
            <Button startIcon={<PersonIcon />} onClick={() => handleNavClick("profile")} variant={activeNav === "profile" ? "contained" : "text"}>Profile</Button>
          </Box>
          {currentUser ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: textColor }}>Hello, {currentUser.name}</Typography>
              <IconButton color="error" onClick={handleLogout}><LogoutIcon /></IconButton>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => navigate("/auth")}>Login</Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3 }}>
        {/* Specialization Filter */}
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          {specializations.map((field) => (
            <Button
              key={field}
              variant={selectedField === field ? "contained" : "outlined"}
              onClick={() => setSelectedField(field)}
            >
              {field}
            </Button>
          ))}
        </Box>

        <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
          <Button variant="contained" color="primary" onClick={() => navigate("/create-post")}>Create Post</Button>
        </Grid>

        <Grid container direction="column">
          {loading ? (
            <Typography sx={{ mt: 4, textAlign: "center", color: textColor }}>Loading posts...</Typography>
          ) : filteredPosts.length === 0 ? (
            <Typography sx={{ mt: 4, textAlign: "center", color: textColor }}>No posts in this field.</Typography>
          ) : (
            filteredPosts.map(post => {
              const likedByUser = post.likes.some((like) => (like.user?._id || like.user) === currentUser?._id);
              return (
                <Card key={post._id} sx={{ mb: 2, backgroundColor: cardBgColor }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ mr: 1.5, bgcolor: "primary.main" }}>{post.user?.name?.charAt(0).toUpperCase()}</Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>{post.user?.name || "Unknown"}</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>{post.title}</Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>{post.description}</Typography>
                    {post.image && <CardMedia component="img" height="200" image={post.image} alt={post.title} />}
                    <Button onClick={() => handleLike(post._id)} color={likedByUser ? "primary" : "default"} startIcon={<ThumbUpIcon />} variant={likedByUser ? "contained" : "outlined"}>
                      {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
