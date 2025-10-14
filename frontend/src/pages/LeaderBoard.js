import React, { useEffect, useState } from "react";
import {
  Container,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  AppBar,
  Toolbar,
  IconButton,
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

const Leaderboard = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("leaderboard");
  const darkMode = useDarkMode(); // ✅ added
  const navigate = useNavigate();

  // ✅ Dark mode colors
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
    fetchTopPosts();

    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  const fetchTopPosts = async () => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts();

      const topPosts = res.data
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 10);

      setPosts(topPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleLike = async (postId) => {
    if (!currentUser?.token) {
      toast.error("You must be logged in to like a post");
      navigate("/auth");
      return;
    }

    try {
      const res = await PostServices.likePost(postId);
      const updatedPost = res.data;

      setPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        );
        return updated.sort((a, b) => b.likes.length - a.likes.length);
      });

      const likedByUser = updatedPost.likes.some((like) => {
        const likeUserId = like.user?._id || like.user;
        return likeUserId === currentUser?._id;
      });
      toast.success(likedByUser ? "Post liked!" : "Post unliked!");
    } catch (error) {
      console.error("Like error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to like/unlike post");
    }
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    if (navItem === "home") {
      navigate("/home");
    } else if (navItem === "leaderboard") {
      navigate("/leaderboard");
    } else if (navItem === "profile") {
      navigate("/profile");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}>
      {/* Navigation Bar */}
      <AppBar
        position="static"
        color="default"
        elevation={1}
        sx={{ backgroundColor: cardBgColor }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}
          >
            MyApp
          </Typography>

          {/* ✅ Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", gap: 1, mr: 2, ml: 2 }}>
            <Button
              startIcon={<HomeIcon />}
              onClick={() => handleNavClick("home")}
              variant={activeNav === "home" ? "contained" : "text"}
              color="primary"
            >
              Home
            </Button>
            <Button
              startIcon={<LeaderboardIcon />}
              onClick={() => handleNavClick("leaderboard")}
              variant={activeNav === "leaderboard" ? "contained" : "text"}
              color="primary"
            >
              Leaderboard
            </Button>
            <Button
              startIcon={<PersonIcon />}
              onClick={() => handleNavClick("profile")}
              variant={activeNav === "profile" ? "contained" : "text"}
              color="primary"
            >
              Profile
            </Button>
          </Box>

          {/* User Info & Actions */}
          {currentUser ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: textColor }}>
                Hello, {currentUser?.name}!
              </Typography>
              <IconButton
                color="error"
                onClick={handleLogout}
                size="small"
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ mt: 3 }}>
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: textColor }}>
            🏆 Leaderboard - Top 10 Posts
          </Typography>
        </Box>

        <Grid container direction="column">
          {loading ? (
            <Typography
              variant="body1"
              sx={{ mt: 4, textAlign: "center", color: textColor }}
            >
              Loading leaderboard...
            </Typography>
          ) : posts.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ mt: 4, textAlign: "center", color: textColor }}
            >
              No posts available yet.
            </Typography>
          ) : (
            posts.map((post, index) => {
              const likedByUser = post.likes.some(
                (like) => (like.user?._id || like.user) === currentUser?._id
              );

              return (
                <Card
                  key={post._id}
                  sx={{
                    mb: 2,
                    position: "relative",
                    backgroundColor: cardBgColor,
                    color: textColor,
                  }}
                >
                  {/* Rank Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor:
                        index === 0
                          ? "#FFD700"
                          : index === 1
                          ? "#C0C0C0"
                          : index === 2
                          ? "#CD7F32"
                          : "#f0f0f0",
                      borderRadius: "50%",
                      width: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      zIndex: 10,
                    }}
                  >
                    #{index + 1}
                  </Box>

                  {post.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={post.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: textColor }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body1" sx={{ my: 1, color: textColor }}>
                      {post.description}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: secondaryTextColor }}>
                      By: {post.user ? post.user.name : "Unknown"}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                      <Button
                        onClick={() => handleLike(post._id)}
                        color={likedByUser ? "primary" : "default"}
                        startIcon={<ThumbUpIcon />}
                        disabled={!currentUser?.token}
                        variant={likedByUser ? "contained" : "outlined"}
                      >
                        {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                      </Button>

                      <Typography
                        variant="body2"
                        sx={{
                          ml: 2,
                          p: 1,
                          backgroundColor: darkMode ? "#3a3a3a" : "#f0f0f0",
                          borderRadius: 1,
                          fontWeight: "bold",
                          color: textColor,
                        }}
                      >
                        Rank: #{index + 1}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Leaderboard;
