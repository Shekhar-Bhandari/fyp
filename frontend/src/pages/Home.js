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
  Avatar,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  TextField,
  Collapse,
} from "@mui/material";
// ⭐️ FIX: Corrected icon imports
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble"; 
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import DarkModeToggle, { useDarkMode } from "../components/DarkModeToggle";

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

/**
 * Utility function to format a date string into a relative time phrase 
 * (e.g., "5m ago", "3h ago", "Sep 23").
 * @param {string} dateString - The ISO 8601 creation date string (e.g., post.createdAt).
 * @returns {string} The relative time phrase.
 */
const formatRelativeTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const MINUTE = 60;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const YEAR = 365 * DAY;

    if (seconds < MINUTE) return `${seconds}s ago`;
    if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)}m ago`;
    if (seconds < DAY) return `${Math.floor(seconds / HOUR)}h ago`;
    if (seconds < WEEK) return `${Math.floor(seconds / DAY)}d ago`;
    if (seconds < MONTH) return `${Math.floor(seconds / WEEK)}w ago`;
    
    // For anything older than a month, show the month and day, or month and year
    const formatter = new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });

    return formatter.format(date);
};

// Utility function to get the specialization label (already present)
const getSpecLabel = (specValue) => {
  const spec = SPECIALIZATIONS.find(s => s.value === specValue);
  return spec ? `${spec.icon} ${spec.label}` : specValue;
};


const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null); 
  const [newCommentText, setNewCommentText] = useState({}); 

  const darkMode = useDarkMode();
  const navigate = useNavigate();

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
    fetchPosts();
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  useEffect(() => {
    if (selectedSpec === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.specialization === selectedSpec));
    }
  }, [selectedSpec, posts]);

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

  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    setPosts([]);
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
      
      setPosts((prevPosts) =>
        prevPosts.map((post) => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
      
      const likedByUser = isPostLikedByUser(updatedPost, currentUser._id);
      toast.success(likedByUser ? "Post liked! 👍" : "Post unliked! 👎");
      
    } catch (error) {
      console.error("=== Like Error (Frontend) ===");
      console.error("Full error:", error);
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

      setPosts((prevPosts) => 
        prevPosts.map((post) => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );

      setNewCommentText(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added! 💬");

    } catch (error) {
      console.error("Comment error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleToggleComments = (postId) => {
    setExpandedPostId(prevId => (prevId === postId ? null : postId));
  };

  const isPostLikedByUser = (post, userId) => {
    if (!post || !post.likes || !userId) return false;
    
    return post.likes.some((like) => {
      if (!like || !like.user) return false;
      
      const likeUserId = typeof like.user === 'object' ? like.user._id : like.user;
      
      return String(likeUserId) === String(userId);
    });
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

  const handleVideoClick = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setVideoDialogOpen(true);
  };

  const handleCloseVideo = () => {
    setVideoDialogOpen(false);
    setSelectedVideo(null);
  };


  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}>
      {/* --- AppBar (Navigation) --- */}
      <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: cardBgColor }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
            Connectiva
          </Typography>

          <DarkModeToggle />

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

      {/* --- Specialization Tabs --- */}
      <Box sx={{ 
        backgroundColor: cardBgColor, 
        borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { 
          backgroundColor: darkMode ? '#555' : '#ccc',
          borderRadius: 3
        }
      }}>
        <Container>
          <Tabs
            value={selectedSpec}
            onChange={(e, newValue) => setSelectedSpec(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { 
                color: secondaryTextColor,
                minHeight: 56,
                textTransform: 'none',
                fontSize: '0.95rem',
              },
              '& .Mui-selected': { 
                color: 'primary.main',
                fontWeight: 'bold'
              },
            }}
          >
            {SPECIALIZATIONS.map((spec) => (
              <Tab
                key={spec.value}
                value={spec.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{spec.icon}</span>
                    <span>{spec.label}</span>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Container>
      </Box>

      {/* --- Main Content and Post List --- */}
      <Container sx={{ mt: 3, pb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: textColor }}>
            {selectedSpec === 'all' ? '🌟 All Projects' : getSpecLabel(selectedSpec)}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/create-post")}
          >
            Create Post
          </Button>
        </Grid>

        {/* ⭐️ GRID CONTAINER: The spacing={3} adds space between posts */}
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
                Loading posts...
              </Typography>
            </Grid>
          ) : filteredPosts.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Typography variant="h6" sx={{ color: textColor, mb: 2 }}>
                  {selectedSpec === 'all' 
                    ? 'No posts available yet. Be the first to create one!' 
                    : `No projects in ${getSpecLabel(selectedSpec)} yet.`}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate("/create-post")}
                >
                  Create First Post
                </Button>
              </Box>
            </Grid>
          ) : (
            filteredPosts.map((post) => {
              const likedByUser = isPostLikedByUser(post, currentUser?._id);
              
              const postUser = post.user;
              const postUserId = postUser?._id;
              const postUserName = postUser?.name || "Unknown";

              const mediaUrl = post.media?.url || post.image || '';
              const mediaType = post.media?.type || (post.image ? 'image' : 'none');
              const hasMedia = mediaUrl && mediaType !== 'none';
              const isExpanded = expandedPostId === post._id; 
              
              // ⭐️ NEW: Get the relative time string
              const relativeTime = formatRelativeTime(post.createdAt);

              return (
                <Grid item key={post._id} xs={12} sm={6} md={4}> 
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: cardBgColor }}>
                    <CardContent sx={{ pb: '16px !important' }}>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 1, 
                        }}
                      >
                        <Box
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                          }}
                        >
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1, 
                            bgcolor: 'primary.main',
                            cursor: postUser ? 'pointer' : 'default',
                          }}
                          onClick={() => handleViewProfile(postUserId)}
                          >
                            {postUserName.charAt(0).toUpperCase()}
                          </Avatar>

                          <Box>
                            <Typography
                              variant="body2" 
                              sx={{
                                color: postUser ? "primary.main" : textColor, 
                                fontWeight: 'bold',
                                lineHeight: 1.2,
                                cursor: postUser ? 'pointer' : 'default',
                                "&:hover": postUser ? { textDecoration: "underline" } : {}
                              }}
                              onClick={() => handleViewProfile(postUserId)}
                            >
                              {postUserName}
                            </Typography>
                            {/* ⭐️ NEW: Display the relative time here */}
                            {relativeTime && (
                                <Typography 
                                    variant="caption" 
                                    sx={{ color: secondaryTextColor, lineHeight: 1 }}
                                >
                                    {relativeTime}
                                </Typography>
                            )}
                          </Box>
                        </Box>

                        {post.specialization && (
                          <Chip 
                            // Using split(' ')[1] to get only the label part from "🌐 Web Dev"
                            label={getSpecLabel(post.specialization).split(' ').slice(1).join(' ')} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Typography 
                        variant="subtitle1" 
                        sx={{ fontWeight: "bold", color: textColor, mt: 1, mb: 0.5 }}
                      >
                        {post.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5, color: textColor, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {post.description}
                      </Typography>
                    </CardContent>

                    {/* Media Section (Image/Video) */}
                    {hasMedia && (
                      <Box sx={{ position: 'relative', flexGrow: 1 }}>
                        {mediaType === 'video' ? (
                          <>
                            <CardMedia 
                              component="video"
                              height="180px" 
                              src={mediaUrl}
                              sx={{ 
                                borderTop: `1px solid ${darkMode ? '#333' : '#eee'}`,
                                objectFit: 'cover', 
                                cursor: 'pointer'
                              }}
                              onClick={() => handleVideoClick(mediaUrl)}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                pointerEvents: 'none'
                              }}
                            >
                              <PlayCircleOutlineIcon 
                                sx={{ 
                                  fontSize: 60, 
                                  color: 'white',
                                  opacity: 0.9,
                                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
                                }} 
                              />
                            </Box>
                          </>
                        ) : (
                          <CardMedia 
                            component="img" 
                            height="180px" 
                            image={mediaUrl} 
                            alt={post.title}
                            sx={{ 
                              borderTop: `1px solid ${darkMode ? '#333' : '#eee'}`,
                              objectFit: 'cover' 
                            }}
                          />
                        )}
                      </Box>
                    )}
                    
                    {/* Interaction Buttons and Comments */}
                    <CardContent sx={{ pt: 1, mt: 'auto' }}> 
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Button
                          onClick={() => handleLike(post._id)}
                          color={likedByUser ? "primary" : "default"}
                          startIcon={<ThumbUpIcon fontSize="small" />} 
                          disabled={!currentUser?.token}
                          variant={likedByUser ? "contained" : "outlined"}
                          size="small" 
                        >
                          {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                        </Button>
                        
                        <Button
                          onClick={() => handleToggleComments(post._id)}
                          color="secondary"
                          startIcon={<ChatBubbleIcon fontSize="small" />} 
                          variant={isExpanded ? "contained" : "outlined"}
                          size="small" 
                        >
                          {post.comments.length} Comment{post.comments.length !== 1 ? "s" : ""}
                        </Button>
                      </Box>

                      {/* COLLAPSIBLE COMMENT SECTION */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 1.5, borderTop: `1px solid ${secondaryTextColor}50`, backgroundColor: commentBgColor, borderRadius: 1, mt: 1 }}>
                          
                          {/* Comment Input */}
                          {currentUser?.token && (
                            <Box sx={{ mb: 1, display: "flex", gap: 0.5 }}>
                              <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Add a comment..."
                                value={newCommentText[post._id] || ""}
                                onChange={(e) => setNewCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                sx={{ 
                                  '& input': { color: textColor, padding: '8px 10px' }, 
                                  '& .MuiOutlinedInput-root': { 
                                    '& fieldset': { borderColor: secondaryTextColor }, 
                                    '&:hover fieldset': { borderColor: secondaryTextColor }, 
                                    '&.Mui-focused fieldset': { borderColor: 'primary.main' }, 
                                  }, 
                                }}
                              />
                              <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => handleAddComment(post._id)}
                                size="small"
                              >
                                Post
                              </Button>
                            </Box>
                          )}

                          {/* Display Comments (Show up to the latest 5) */}
                          {post.comments.length > 0 ? (
                            post.comments.slice().reverse().slice(0, 5).map((comment, i) => ( 
                              <Box key={comment._id || i} sx={{ mb: 0.5, p: 0.5, backgroundColor: cardBgColor, borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: "bold", color: textColor, display: 'block' }}>
                                  {comment.user?.name || "Anonymous"}:
                                </Typography>
                                <Typography variant="caption" sx={{ ml: 0.5, color: secondaryTextColor, display: 'block' }}>
                                  {comment.text}
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="caption" sx={{ color: secondaryTextColor, textAlign: 'center', display: 'block' }}>
                              No comments yet. Be the first!
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </Container>

      {/* Video Dialog (Unchanged) */}
      <Dialog
        open={videoDialogOpen}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          }
        }}
      >
        <IconButton
          onClick={handleCloseVideo}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1,
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          {selectedVideo && (
            <video
              src={selectedVideo}
              controls
              autoPlay
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                display: 'block'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home;