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
  TextField,
  MenuItem,
  Collapse,
  Avatar, 
  Chip, // Added Chip for displaying specialization consistently
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import DarkModeToggle, { useDarkMode } from "../components/DarkModeToggle";

// ⭐️ COPIED FROM HOME COMPONENT - These are the values used for filtering and saving to posts.
const SPECIALIZATIONS = [
  { value: 'all', label: 'All Projects', icon: '🌟' },
  { value: 'web-dev', label: 'Web Dev', icon: '🌐' },
  { value: 'mobile-dev', label: 'Mobile Dev', icon: '📱' },
  { value: 'ai-ml', label: 'AI/ML', icon: '🤖' },
  { value: 'data-science', label: 'Data Science', icon: '📊' },
  { value: 'cloud-computing', label: 'Cloud', icon: '☁️' },
  { value: 'devops', label: 'DevOps', icon: '⚙️' },
  { value: 'cybersecurity', label: 'Security', icon: '🔒' },
  { value: 'blockchain', label: 'Blockchain', icon: '⛓️' },
  { value: 'game-dev', label: 'Game Dev', icon: '🎮' },
  { value: 'iot', label: 'IoT', icon: '🔌' },
  { value: 'ui-ux', label: 'UI/UX', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '💡' },
];

// Utility function to get the specialization label (copied from Home)
const getSpecLabel = (specValue) => {
    const spec = SPECIALIZATIONS.find(s => s.value === specValue);
    // Returns "🌐 Web Dev" or "web-dev" if not found
    return spec ? `${spec.icon} ${spec.label}` : specValue; 
};

// Utility function to get just the label part (e.g., "Web Dev")
const getSpecName = (specValue) => {
    const spec = SPECIALIZATIONS.find(s => s.value === specValue);
    return spec ? spec.label : specValue;
};


const Leaderboard = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("leaderboard");
  // Default filter is 'all'
  const [specializationFilter, setSpecializationFilter] = useState("all"); 
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
    // Pass blank string for 'all' on initial load
    fetchTopPosts(specializationFilter === 'all' ? '' : specializationFilter);
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  const fetchTopPosts = async (specialization = "") => {
    try {
      setLoading(true);
      // Assuming PostServices.getAllPosts accepts the short code (e.g., 'web-dev') or an empty string for all.
      const res = await PostServices.getAllPosts(specialization);

      // Leaderboard sorting: Sort by raw likes.length
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
      const res = await PostServices.addComment(postId, text);
      const updatedPost = res.data; 

      setPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        );
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

  // Profile View
  const handleViewProfile = (userId) => {
    if (userId) {
      if (userId === currentUser?._id) {
        navigate("/profile");
      } else {
        navigate(`/profile-view/${userId}`);
      }
    } else {
      toast.error("User information is unavailable.");
    }
  };

  const handleSpecializationChange = (event) => {
    const value = event.target.value;
    setSpecializationFilter(value);
    
    // Pass the specialization short code or an empty string for the API call
    const apiFilter = value === 'all' ? '' : value;
    fetchTopPosts(apiFilter);
  };

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}
    >
      {/* Navigation Bar */}
      <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: cardBgColor }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
            Connectiva
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
            🏆 Top 10 Leaderboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: secondaryTextColor, mt: 0.5 }}>
            {specializationFilter === 'all' 
                ? 'Showing top 10 most liked posts across all specializations.'
                : `Showing top 10 most liked posts in ${getSpecName(specializationFilter)}`}
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
            {SPECIALIZATIONS.map((spec) => (
                <MenuItem key={spec.value} value={spec.value}>
                    {spec.icon} {spec.label}
                </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Centering Box for fixed-width/square posts */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%',
          }}
        >
          {/* Use Grid container to hold the posts, but limit its width */}
          <Grid 
            container 
            direction="column" 
            sx={{ 
              maxWidth: { xs: '100%', sm: 450, md: 500, lg: 550 }, // Fixed max width for 'square' appearance
              width: '100%' 
            }}
          >
            {loading ? (
              <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
                Loading leaderboard...
              </Typography>
            ) : posts.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
                No highly-ranked posts available yet in this category.
              </Typography>
            ) : (
              posts.map((post, index) => {
                const likedByUser = post.likes.some(
                  (like) => (like.user?._id || like.user) === currentUser?._id
                );
                const isExpanded = expandedPostId === post._id; 
                
                const postUser = post.user;
                const postUserId = postUser?._id;
                const postUserName = postUser?.name || "Unknown";

                const mediaUrl = post.media?.url || post.image || '';
                const hasMedia = mediaUrl; 

                return (
                  <Card key={post._id} sx={{ mb: 2, position: "relative", backgroundColor: cardBgColor, color: textColor }}>
                    
                    {/* Rank Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "#f0f0f0",
                        color: index < 3 ? '#000' : '#333',
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
                    
                    {/* CardMedia with objectFit: 'cover' */}
                    {hasMedia && (
                      <CardMedia 
                        component="img" 
                        height="300" 
                        image={mediaUrl} 
                        alt={post.title} 
                        sx={{
                          objectFit: 'cover', 
                          width: '100%',
                        }}
                      />
                    )}

                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: textColor }}>{post.title}</Typography>
                            {/* ⭐️ FIX APPLIED: Use getSpecName for display, which converts the short code (e.g., 'web-dev') */}
                            {post.specialization && (
                                <Chip 
                                    label={getSpecName(post.specialization)}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </Box>

                      <Typography variant="body1" sx={{ my: 1, color: textColor }}>{post.description}</Typography>
                      
                      {/* Post Owner */}
                      <Box 
                          onClick={() => handleViewProfile(postUserId)}
                          sx={{ cursor: postUser ? 'pointer' : 'default', mb: 1 }}
                      >
                          <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                  color: secondaryTextColor,
                                  '&:hover': postUser && { textDecoration: 'underline', color: 'primary.main' }
                              }}
                          >
                              By: {postUserName}
                          </Typography>
                      </Box>

                      {/* Like and Comment Buttons */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
                        <Button
                          onClick={() => handleLike(post._id)}
                          color={likedByUser ? "primary" : "default"}
                          startIcon={<ThumbUpIcon />}
                          disabled={!currentUser?.token}
                          variant={likedByUser ? "contained" : "outlined"}
                          size="small"
                        >
                          {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                        </Button>

                        <Button
                          onClick={() => handleToggleComments(post._id)}
                          color="secondary"
                          startIcon={<ChatBubbleIcon />}
                          variant={isExpanded ? "contained" : "outlined"}
                          size="small"
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
                              inputProps={{ style: { color: textColor } }} 
                              InputLabelProps={{ style: { color: secondaryTextColor } }} 
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
                          // Display the last 5 comments (newest first)
                          post.comments.slice().reverse().slice(0, 5).map((comment, i) => ( 
                            <Box key={comment._id || i} sx={{ mb: 1, p: 1, display: 'flex', alignItems: 'center', backgroundColor: cardBgColor, borderRadius: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                                  {comment.user?.name ? comment.user.name[0] : 'A'}
                              </Avatar>
                              <Box>
                                  <Typography variant="body2" sx={{ fontWeight: "bold", color: textColor, display: 'inline' }}>
                                      {comment.user?.name || "Anonymous"}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ ml: 1, color: secondaryTextColor, display: 'inline' }}>
                                      {comment.text}
                                  </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ color: secondaryTextColor, textAlign: 'center' }}>
                            No comments yet. Be the first!
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </Card>
                );
              })
            )}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Leaderboard;