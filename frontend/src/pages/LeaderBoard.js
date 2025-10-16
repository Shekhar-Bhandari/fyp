import React, { useEffect, useState } from "react";
import {
  Container,
  Button,
  Card,
  CardContent,
  CardMedia, // 👈 FIX: CardMedia is now correctly imported
  Typography,
  Grid,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  MenuItem,
  Collapse, // For expandable comment section
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble"; // Comment icon
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import DarkModeToggle, { useDarkMode } from "../components/DarkModeToggle";

const Leaderboard = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("leaderboard");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState({}); 

  const darkMode = useDarkMode();
  const navigate = useNavigate();

  // Dark mode colors
  const bgColor = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBgColor = darkMode ? "#2d2d2d" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";
  const commentBgColor = darkMode ? "#3a3a3a" : "#f0f0f0";

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

  const fetchTopPosts = async (specialization = "") => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts(specialization);

      // Leaderboard sorting: Sort by raw likes.length, as is traditional for a leaderboard
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
        // Re-sort to maintain leaderboard ranking after a like/unlike
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

  const handleAddComment = async (postId) => {
    const text = newCommentText[postId]?.trim();
    if (!text) {
      toast.error("Comment cannot be empty.");
      return;
    }
    if (!currentUser?.token) {
      toast.error("You must be logged in to comment.");
      navigate("/auth");
      return;
    }

    try {
      // API call to add comment
      const res = await PostServices.addComment(postId, text);
      const updatedPost = res.data; // Backend should return the fully updated/populated post

      // Update the local state with the new post data
      setPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        );
        // Re-sort the leaderboard to reflect the new comment's potential influence
        return updated.sort((a, b) => b.likes.length - a.likes.length); 
      });

      setNewCommentText(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");

    } catch (error) {
      console.error("Comment error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };
  
  const handleToggleComments = (postId) => {
    setExpandedPostId(prevId => (prevId === postId ? null : postId));
  };

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    if (navItem === "home") navigate("/home");
    else if (navItem === "leaderboard") navigate("/leaderboard");
    else if (navItem === "profile") navigate("/profile");
  };

  const handleSpecializationChange = (event) => {
    const value = event.target.value;
    setSpecializationFilter(value);
    fetchTopPosts(value);
  };

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}
    >
      {/* Navigation Bar (omitted for brevity, assume it's correct) */}
      <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: cardBgColor }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
            MyApp
          </Typography>
          <DarkModeToggle />
          <Box sx={{ display: "flex", gap: 1, mr: 2, ml: 2 }}>
            <Button startIcon={<HomeIcon />} onClick={() => handleNavClick("home")} variant={activeNav === "home" ? "contained" : "text"} color="primary">Home</Button>
            <Button startIcon={<LeaderboardIcon />} onClick={() => handleNavClick("leaderboard")} variant={activeNav === "leaderboard" ? "contained" : "text"} color="primary">Leaderboard</Button>
            <Button startIcon={<PersonIcon />} onClick={() => handleNavClick("profile")} variant={activeNav === "profile" ? "contained" : "text"} color="primary">Profile</Button>
          </Box>
          {currentUser ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: textColor }}>Hello, {currentUser?.name}!</Typography>
              <IconButton color="error" onClick={handleLogout} size="small" title="Logout"><LogoutIcon /></IconButton>
            </Box>
          ) : (
            <Button variant="outlined" color="primary" size="small" onClick={() => navigate("/auth")}>Login</Button>
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

        {/* Filter by Specialization */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <TextField
            select
            label="Filter by Specialization"
            value={specializationFilter}
            onChange={handleSpecializationChange}
            sx={{ width: 300 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Machine Learning">Machine Learning</MenuItem>
            <MenuItem value="Web Development">Web Development</MenuItem>
            <MenuItem value="Data Science">Data Science</MenuItem>
            <MenuItem value="AI">AI</MenuItem>
          </TextField>
        </Box>

        <Grid container direction="column">
          {loading ? (
            <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
              Loading leaderboard...
            </Typography>
          ) : posts.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
              No posts available yet.
            </Typography>
          ) : (
            posts.map((post, index) => {
              const likedByUser = post.likes.some(
                (like) => (like.user?._id || like.user) === currentUser?._id
              );
              const isExpanded = expandedPostId === post._id; 

              return (
                <Card key={post._id} sx={{ mb: 2, position: "relative", backgroundColor: cardBgColor, color: textColor }}>
                  
                  {/* Rank Badge (omitted for brevity, assume it's correct) */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#f0f0f0",
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
                  
                  {post.image && <CardMedia component="img" height="200" image={post.image} alt={post.title} />}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: textColor }}>{post.title}</Typography>
                    <Typography variant="body1" sx={{ my: 1, color: textColor }}>{post.description}</Typography>
                    <Typography variant="subtitle2" sx={{ color: secondaryTextColor }}>By: {post.user ? post.user.name : "Unknown"}</Typography>
                    <Typography variant="caption" sx={{ color: secondaryTextColor }}>Specialization: {post.specialization}</Typography>

                    {/* Like and Comment Buttons */}
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

                      <Button
                        onClick={() => handleToggleComments(post._id)}
                        color="secondary"
                        startIcon={<ChatBubbleIcon />}
                        variant={isExpanded ? "contained" : "outlined"}
                      >
                        {post.comments.length} Comment{post.comments.length !== 1 ? "s" : ""}
                      </Button>
                      
                      <Typography
                        variant="body2"
                        sx={{ ml: 2, p: 1, backgroundColor: commentBgColor, borderRadius: 1, fontWeight: "bold", color: textColor, }}
                      >
                        Rank: #{index + 1}
                      </Typography>
                    </Box>
                  </CardContent>

                  {/* COLLAPSIBLE COMMENT SECTION */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, borderTop: `1px solid ${secondaryTextColor}50`, backgroundColor: commentBgColor }}>
                      
                      {/* Comment Input */}
                      {currentUser?.token && (
                        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Add a comment..."
                            value={newCommentText[post._id] || ""}
                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                            sx={{ '& input': { color: textColor }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: secondaryTextColor }, '&:hover fieldset': { borderColor: secondaryTextColor }, '&.Mui-focused fieldset': { borderColor: 'primary.main' }, }, }}
                          />
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => handleAddComment(post._id)}
                          >
                            Post
                          </Button>
                        </Box>
                      )}

                      {/* Display Comments */}
                      {post.comments.length > 0 ? (
                        // Display the last 5 comments
                        post.comments.slice(-5).map((comment, i) => ( 
                          <Box key={i} sx={{ mb: 1, p: 1, backgroundColor: cardBgColor, borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: textColor }}>
                              {comment.user?.name || "Anonymous"}:
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1, color: secondaryTextColor }}>
                              {comment.text}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ textAlign: "center", color: secondaryTextColor }}>
                          No comments yet. Be the first!
                        </Typography>
                      )}
                      
                      {post.comments.length > 5 && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: 'primary.main', cursor: 'pointer' }}>
                              View all {post.comments.length} comments
                          </Typography>
                      )}
                    </Box>
                  </Collapse>
                  {/* END COLLAPSIBLE COMMENT SECTION */}

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