import React, { useEffect, useState } from "react";
import {
  Container,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Avatar, // 👈 Import Avatar for the user icon
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

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const darkMode = useDarkMode();
  const navigate = useNavigate();

  // Dark mode colors
  const bgColor = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBgColor = darkMode ? "#2d2d2d" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";

  // Update currentUser on mount and whenever localStorage changes
  const updateUser = () => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
  };

  useEffect(() => {
    updateUser();
    fetchPosts();

    // Listen to localStorage changes (from other tabs or after login)
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts();
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    setPosts([]); // Clear posts on logout
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  // Like/unlike - user can only like once per post
  const handleLike = async (postId) => {
    if (!currentUser?.token) {
      toast.error("You must be logged in to like a post");
      navigate("/auth");
      return;
    }

    try {
      const res = await PostServices.likePost(postId);
      const updatedPost = res.data;
      
      // Update the specific post in state
      setPosts((prevPosts) =>
        prevPosts.map((post) => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
      
      // Show feedback
      const likedByUser = updatedPost.likes.some(
        (like) => {
          const likeUserId = like.user?._id || like.user;
          return likeUserId === currentUser?._id;
        }
      );
      toast.success(likedByUser ? "Post liked!" : "Post unliked!");
    } catch (error) {
      console.error("Like error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to like/unlike post");
    }
  };

  // Navigation handlers
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

  /**
   * Navigate to a user's profile page.
   * FIX: This now navigates to a public profile route: /profile/:userId
   * Make sure you have this route set up in your React Router configuration!
   * @param {string | null} userId - The ID of the user to view.
   */
  const handleViewProfile = (userId) => {
    if (userId) {
      // If the user clicks on their own name, go to the generic profile
      if (userId === currentUser?._id) {
        navigate("/profile");
      } else {
        // Navigate to the public profile (e.g., /profile/65c82a3c7c8c363d6b7b2571)
        navigate(`/profile/${userId}`); 
        // You'll need to create a component to handle public profile views at this route.
      }
    } else {
      toast.error("User information is unavailable.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}>
      {/* Navigation Bar - (Unchanged) */}
      <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: cardBgColor }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
            MyApp
          </Typography>

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
      <Container sx={{ mt: 3, pb: 4 }}>
        {/* Header Actions */}
        <Grid 
          container 
          justifyContent="flex-end" 
          sx={{ mb: 3 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-post")}
          >
            Create Post
          </Button>
        </Grid>

        {/* Posts Section */}
        <Grid container direction="column">
          {loading ? (
            <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
              Loading posts...
            </Typography>
          ) : posts.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
              No posts available. Be the first to create one!
            </Typography>
          ) : (
            posts.map((post) => {
              // Check if current user has liked this post
              const likedByUser = post.likes.some(
                (like) => (like.user?._id || like.user) === currentUser?._id
              );
              
              const postUser = post.user;
              const postUserId = postUser?._id;
              const postUserName = postUser?.name || "Unknown";

              return (
                <Card key={post._id} sx={{ mb: 2, backgroundColor: cardBgColor }}>
                  <CardContent sx={{ pb: '16px !important' }}> {/* Ensures consistent padding */}
                    
                    {/* 👇 MODIFIED: User Icon & Name (Facebook-style header) */}
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2, 
                        cursor: postUser ? 'pointer' : 'default',
                      }}
                      onClick={() => handleViewProfile(postUserId)}
                    >
                      {/* User Avatar */}
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        mr: 1.5,
                        bgcolor: 'primary.main',
                      }}>
                        {postUserName.charAt(0).toUpperCase()}
                      </Avatar>

                      {/* User Name and Post Metadata (if any) */}
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: postUser ? "primary.main" : secondaryTextColor, 
                            fontWeight: 'bold',
                            lineHeight: 1.2,
                            "&:hover": postUser ? { textDecoration: "underline" } : {}
                          }}
                        >
                          {postUserName}
                        </Typography>
                        {/* Optional: Add a timestamp/date here if your post object includes it */}
                        {/* <Typography variant="caption" sx={{ color: secondaryTextColor }}>
                          {new Date(post.createdAt).toLocaleString()} 
                        </Typography> */}
                      </Box>
                    </Box>
                    {/* 👆 MODIFIED: User Icon & Name */}

                    {/* Title and Description */}
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: "bold", color: textColor, mt: 1, mb: 0.5 }}
                    >
                      {post.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5, color: textColor }}>
                      {post.description}
                    </Typography>
                  </CardContent>

                  {/* Image (moved below text for typical feed layout, or keep it above CardContent if you prefer) */}
                  {post.image && (
                    <CardMedia 
                      component="img" 
                      height="200" 
                      image={post.image} 
                      alt={post.title}
                      sx={{ borderTop: `1px solid ${darkMode ? '#333' : '#eee'}` }}
                    />
                  )}
                  
                  {/* Actions (Likes) */}
                  <CardContent sx={{ pt: 1 }}> 
                    <Button
                      onClick={() => handleLike(post._id)}
                      color={likedByUser ? "primary" : "default"}
                      startIcon={<ThumbUpIcon />}
                      disabled={!currentUser?.token}
                      variant={likedByUser ? "contained" : "outlined"}
                    >
                      {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                    </Button>
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

export default Home;