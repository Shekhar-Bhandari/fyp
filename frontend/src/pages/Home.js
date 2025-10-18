import React, { useEffect, useState, useCallback } from "react";
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
  DialogTitle,
  TextField,
  Collapse,
  Tooltip,
} from "@mui/material";
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

// Utility function to get the specialization label
const getSpecLabel = (specValue) => {
  const spec = SPECIALIZATIONS.find(s => s.value === specValue);
  return spec ? `${spec.icon} ${spec.label}` : specValue;
};

// Utility function to format a date string into a relative time phrase 
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
    
    const formatter = new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });

    return formatter.format(date);
};


/**
 * Renders text, detecting and making URLs clickable.
 */
const renderClickableText = (text, textColor) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;
    
    text.replace(urlRegex, (match, url, offset) => {
        if (offset > lastIndex) {
            parts.push(<span key={`text-${lastIndex}`} style={{ color: textColor }}>{text.substring(lastIndex, offset)}</span>);
        }
        
        parts.push(
            <a 
                key={`link-${offset}`} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1976D2', textDecoration: 'underline', wordBreak: 'break-all' }} 
                onClick={(e) => e.stopPropagation()} 
            >
                {url}
            </a>
        );
        
        lastIndex = offset + match.length;
    });

    if (lastIndex < text.length) {
        parts.push(<span key={`text-${lastIndex}`} style={{ color: textColor }}>{text.substring(lastIndex)}</span>);
    }

    return parts;
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
  
  // No need for a global comment text state in Home if it's only used in the dialog
  // const [newCommentText, setNewCommentText] = useState({}); // REMOVED

  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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

  /**
   * Universal post update function to keep the state synchronized.
   */
  const updatePostInState = (updatedPost) => {
    setPosts((prevPosts) =>
        prevPosts.map((post) => 
            post._id === updatedPost._id ? updatedPost : post
        )
    );
    // If the dialog is open and viewing this post, update the dialog content
    if (selectedPost && selectedPost._id === updatedPost._id) {
        setSelectedPost(updatedPost);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser?.token) {
      toast.error("You must be logged in to like a post");
      navigate("/auth");
      return;
    }

    try {
      const res = await PostServices.likePost(postId);
      updatePostInState(res.data); // Use the universal update function
      
      const likedByUser = isPostLikedByUser(res.data, currentUser._id);
      toast.success(likedByUser ? "Post liked! 👍" : "Post unliked! 👎");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to like/unlike post");
    }
  };

  /**
   * UPDATED: Accepts the comment text directly from the dialog.
   * @param {string} postId 
   * @param {string} text The comment text from the local dialog state
   * @returns {boolean} Success status
   */
  const handleAddComment = useCallback(async (postId, text) => {
    const trimmedText = text?.trim();
    if (!trimmedText) {
      toast.error("Comment cannot be empty.");
      return false;
    }
    if (!currentUser?.token) {
      toast.error("You must be logged in to comment.");
      navigate("/auth");
      return false;
    }

    try {
      const res = await PostServices.addComment(postId, trimmedText);
      updatePostInState(res.data); // Use the universal update function

      toast.success("Comment added! 💬");
      return true; // Indicate success

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment.");
      return false; // Indicate failure
    }
  }, [currentUser, updatePostInState, navigate]);


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
    if (navItem === "home") navigate("/home");
    else if (navItem === "leaderboard") navigate("/leaderboard");
    else if (navItem === "profile") navigate("/profile");
  };

  const handleViewProfile = (userId) => {
    // Close the dialog first if it's open, then navigate
    setPostDialogOpen(false); 
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

  // NEW HANDLERS for Full-Screen Post View
  const handleOpenPostDialog = (post) => {
    setSelectedPost(post);
    setPostDialogOpen(true);
  };

  const handleClosePostDialog = () => {
    setPostDialogOpen(false);
    setSelectedPost(null);
  };
  
  const handleVideoClick = (mediaUrl) => {
    setSelectedVideo(mediaUrl);
    setVideoDialogOpen(true);
  };

  const handleCloseVideo = () => {
    setVideoDialogOpen(false);
    setSelectedVideo(null);
  };
  
  // ====================================================================
  // ⭐️ FullPostDialog Component (Updated for local state)
  // ====================================================================

  const FullPostDialog = ({ open, post, onClose, user, onLike, onAddComment, onNavigateProfile }) => {
    // ⭐️ NEW: Local state for comment input
    const [dialogCommentText, setDialogCommentText] = useState(""); 

    // Clear local state when the dialog is opened for a new post
    useEffect(() => {
        if (open && post?._id) {
            setDialogCommentText("");
        }
    }, [open, post?._id]);

    // Local handler to call parent function and clear local state on success
    const handleLocalAddComment = async () => {
        // Pass the local text state to the parent's handler
        const success = await onAddComment(post._id, dialogCommentText); 
        
        // Only clear the local input if the comment was successfully posted
        if (success) {
            setDialogCommentText("");
        }
    }


    if (!post) return null;

    const likedByUser = isPostLikedByUser(post, user?._id);
    const postUser = post.user;
    const postUserId = postUser?._id;
    const postUserName = postUser?.name || "Unknown";
    const relativeTime = formatRelativeTime(post.createdAt);
    
    const mediaUrl = post.media?.url || post.image || '';
    const mediaType = post.media?.type || (post.image ? 'image' : 'none');
    const hasMedia = mediaUrl && mediaType !== 'none';
    
    const isOwner = postUserId === user?._id;

    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: cardBgColor,
            color: textColor,
            maxHeight: '90vh', // Keep a little margin
            overflowY: 'hidden', // Dialog handles its own scrolling
          }
        }}
      >
        <DialogTitle sx={{ p: 1, borderBottom: `1px solid ${secondaryTextColor}50` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: textColor }}>
                    {post.title}
                </Typography>
                {post.specialization && (
                    <Chip 
                        label={getSpecLabel(post.specialization).split(' ').slice(1).join(' ')} 
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1 }}
                    />
                )}
            </Box>
            <IconButton onClick={onClose} sx={{ color: textColor }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, maxHeight: 'calc(90vh - 65px)' }}>
            
            {/* LEFT SIDE: Media and Full Description */}
            <Box sx={{ 
                flex: { xs: '1 1 100%', sm: '2 1 60%' }, 
                p: 2, 
                overflowY: 'auto', // Scroll for content
                maxHeight: { xs: '40vh', sm: '100%' }
            }}>
                {/* User Info and Time */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2, 
                    cursor: postUser ? 'pointer' : 'default' 
                }}
                onClick={() => onNavigateProfile(postUserId)}
                >
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        {postUserName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 'bold', lineHeight: 1.2 }}>
                            {postUserName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: secondaryTextColor, lineHeight: 1 }}>
                            Posted: {relativeTime}
                        </Typography>
                    </Box>
                </Box>
                
                {/* Media Display (Full Size) */}
                {hasMedia && (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        {mediaType === 'video' ? (
                            <>
                                <CardMedia 
                                    component="video"
                                    src={mediaUrl}
                                    controls
                                    autoPlay={false}
                                    sx={{ 
                                        objectFit: 'contain', 
                                        width: '100%', 
                                        maxHeight: '400px', 
                                        bgcolor: 'black'
                                    }}
                                />
                            </>
                        ) : (
                            <CardMedia 
                                component="img" 
                                image={mediaUrl} 
                                alt={post.title}
                                sx={{ objectFit: 'contain', width: '100%', maxHeight: '400px' }}
                            />
                        )}
                    </Box>
                )}
                
                {/* Full Description (with clickable links) */}
                <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap', color: textColor }}>
                    {renderClickableText(post.description, textColor)}
                </Typography>
            </Box>
            
            {/* RIGHT SIDE: Comments and Interactions */}
            <Box sx={{ 
                flex: { xs: '1 1 100%', sm: '1 1 40%' }, 
                p: 2, 
                borderLeft: { sm: `1px solid ${secondaryTextColor}50` },
                borderTop: { xs: `1px solid ${secondaryTextColor}50`, sm: 'none' },
                display: 'flex', 
                flexDirection: 'column',
                maxHeight: { xs: 'calc(90vh - 65px - 40vh)', sm: '100%' } // Adjust height for mobile/desktop
            }}>
                <Typography variant="h6" sx={{ color: textColor, mb: 1, fontWeight: 'bold' }}>
                    Interactions
                </Typography>
                
                {/* Interaction Buttons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Button
                        onClick={() => onLike(post._id)}
                        color={likedByUser ? "primary" : "default"}
                        startIcon={<ThumbUpIcon fontSize="small" />} 
                        disabled={!user?.token}
                        variant={likedByUser ? "contained" : "outlined"}
                        size="small" 
                    >
                        {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                    </Button>
                    <Chip 
                        label={`${post.comments.length} Comments`} 
                        icon={<ChatBubbleIcon fontSize="small" />} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                    />
                </Box>

                {/* Comment Input */}
                {user?.token && (
                    <Box sx={{ mb: 2, display: "flex", gap: 1, flexShrink: 0 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Add a comment..."
                            // ⭐️ NOW USING LOCAL STATE
                            value={dialogCommentText}
                            onChange={(e) => setDialogCommentText(e.target.value)}
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
                            // ⭐️ NOW USING LOCAL HANDLER
                            onClick={handleLocalAddComment}
                            size="small"
                        >
                            Post
                        </Button>
                    </Box>
                )}

                {/* Display Comments (Scrollable Section) */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {post.comments.length > 0 ? (
                        post.comments.slice().reverse().map((comment, i) => ( 
                            <Box key={comment._id || i} sx={{ mb: 1, p: 1, backgroundColor: commentBgColor, borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Avatar sx={{ width: 20, height: 20, mr: 1, bgcolor: 'primary.light', fontSize: '0.7rem' }}>
                                        {comment.user?.name ? comment.user.name[0] : 'A'}
                                    </Avatar>
                                    <Typography variant="caption" sx={{ fontWeight: "bold", color: textColor }}>
                                        {comment.user?.name || "Anonymous"}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ ml: 0.5, color: secondaryTextColor, whiteSpace: 'pre-wrap' }}>
                                    {comment.text}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" sx={{ color: secondaryTextColor, textAlign: 'center', mt: 2 }}>
                            No comments yet. Start the conversation!
                        </Typography>
                    )}
                </Box>
            </Box>
        </DialogContent>
      </Dialog>
    );
  };
  // ====================================================================


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
              variant={activeNav === "leaderboard" ? "text" : "text"}
              color="primary"
            >
              Leaderboard
            </Button>
            <Button
              startIcon={<PersonIcon />}
              onClick={() => handleNavClick("profile")}
              variant={activeNav === "profile" ? "text" : "text"}
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
              const postUser = post.user;
              const postUserName = postUser?.name || "Unknown";
              const mediaUrl = post.media?.url || post.image || '';
              const hasMedia = mediaUrl; 
              const relativeTime = formatRelativeTime(post.createdAt);
              
              
              return (
                <Grid item key={post._id} xs={12} sm={6} md={4}> 
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      backgroundColor: cardBgColor,
                      cursor: 'pointer', // Indicate clickability
                      '&:hover': {
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => handleOpenPostDialog(post)} // Click opens the dialog
                  >
                    
                    {/* SHORT VIEW: Media and Title */}
                    {hasMedia && (
                        <CardMedia 
                            component="img" 
                            height="140" 
                            image={mediaUrl} 
                            alt={post.title}
                            sx={{ objectFit: 'cover' }}
                        />
                    )}
                    
                    <CardContent sx={{ pb: '16px !important', flexGrow: 1 }}>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'primary.main', 
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {postUserName} &bull; {relativeTime}
                        </Typography>
                        {post.specialization && (
                          <Chip 
                            label={getSpecLabel(post.specialization).split(' ').slice(1).join(' ')} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Typography 
                        variant="subtitle1" 
                        sx={{ fontWeight: "bold", color: textColor, mt: 0.5, mb: 0.5, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          display: '-webkit-box',
                          WebkitLineClamp: 1, 
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {post.title}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1.5, color: secondaryTextColor, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2, // Only show 2 lines of description
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {post.description}
                      </Typography>
                      
                    </CardContent>

                    {/* SHORT VIEW: Likes and Comments count only */}
                    <Box sx={{ p: 2, borderTop: `1px solid ${secondaryTextColor}20`, display: "flex", alignItems: "center", gap: 2, mt: 'auto' }}>
                        <Chip 
                            icon={<ThumbUpIcon fontSize="small" />} 
                            label={post.likes.length} 
                            size="small" 
                            variant="outlined"
                        />
                        <Chip 
                            icon={<ChatBubbleIcon fontSize="small" />} 
                            label={post.comments.length} 
                            size="small" 
                            variant="outlined"
                        />
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </Container>
      
      {/* ⭐️ Full Post View Dialog */}
      <FullPostDialog 
        open={postDialogOpen}
        post={selectedPost}
        onClose={handleClosePostDialog}
        user={currentUser}
        onLike={handleLike}
        onAddComment={handleAddComment} // Passed the updated handler
        onNavigateProfile={handleViewProfile}
      />

      {/* Video Dialog (Kept separate) */}
      <Dialog
        open={videoDialogOpen}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', }
        }}
      >
        <IconButton
          onClick={handleCloseVideo}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          {selectedVideo && (
            <video
              src={selectedVideo}
              controls
              autoPlay
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', display: 'block' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home;