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
  Chip, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import CloseIcon from '@mui/icons-material/Close'; 
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import DarkModeToggle, { useDarkMode } from "../components/DarkModeToggle";

// ⭐️ CONSTANTS
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

// ⭐️ UTILITY FUNCTIONS

const getSpecName = (specValue) => {
    const spec = SPECIALIZATIONS.find(s => s.value === specValue);
    return spec ? spec.label : specValue;
};


/**
 * ⭐️ UPDATED: Calculates the score for Leaderboard (purely based on Likes).
 */
const calculateDecayScore = (post) => {
    // For the Leaderboard, the score is simply the raw number of likes.
    return post.likes?.length || 0;
};


const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000); 
  if (interval >= 1) {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  interval = Math.floor(seconds / 2592000); 
  if (interval >= 1) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  interval = Math.floor(seconds / 86400); 
  if (interval >= 1) {
    if (interval === 1) return 'yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); 
  }

  interval = Math.floor(seconds / 3600); 
  if (interval >= 1) {
    return interval + (interval === 1 ? ' hour ago' : ' hours ago');
  }

  interval = Math.floor(seconds / 60); 
  if (interval >= 1) {
    return interval + (interval === 1 ? ' minute ago' : ' minutes ago');
  }

  if (seconds < 5) return 'just now';
  return Math.floor(seconds) + ' seconds ago';
};


/**
 * Converts URLs in text into clickable anchor tags for display.
 */
const renderDescriptionWithLinks = (text, darkMode) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    const linkColor = darkMode ? '#90caf9' : '#1976d2'; 

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            return (
                <a 
                    key={index} 
                    href={part} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: linkColor, textDecoration: 'underline', cursor: 'pointer' }}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};


// ⭐️ POST DETAIL DIALOG COMPONENT

const PostDetailDialog = ({ open, handleClose, post, darkMode }) => {
    if (!post) return null;

    const dialogBgColor = darkMode ? "#2d2d2d" : "#ffffff";
    const textColor = darkMode ? "#ffffff" : "#000000";
    const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";

    const mediaUrl = post.media?.url || post.image || '';
    const isVideo = post.media?.type === 'video';
    
    const postRank = post.rank !== undefined ? post.rank : 'N/A';
    // decayScore is now just Likes
    const likeScore = post.decayScore?.toFixed(0) || 'N/A';


    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { bgcolor: dialogBgColor, color: textColor, borderRadius: 2 } }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    {post.title}
                </Typography>
                <IconButton onClick={handleClose} sx={{ color: secondaryTextColor }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {mediaUrl && (
                    <Box sx={{ width: '100%', height: isVideo ? 'auto' : 400, bgcolor: 'black' }}>
                        {isVideo ? (
                            <video 
                                src={mediaUrl} 
                                controls 
                                autoPlay 
                                loop
                                style={{ width: '100%', maxHeight: 600, objectFit: 'contain' }}
                            />
                        ) : (
                            <CardMedia 
                                component="img" 
                                image={mediaUrl} 
                                alt={post.title} 
                                sx={{ 
                                    height: 400, 
                                    objectFit: 'contain', 
                                    width: '100%' 
                                }}
                            />
                        )}
                    </Box>
                )}
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}>
                                {post.user?.name ? post.user.name[0] : 'U'}
                            </Avatar>
                            <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 'bold' }}>
                                {post.user?.name || "Unknown User"}
                            </Typography>
                        </Box>
                        <Chip 
                            label={getSpecName(post.specialization)}
                            size="small"
                            color="secondary"
                        />
                    </Box>

                    <Typography 
                        variant="body1" 
                        sx={{ color: textColor, whiteSpace: 'pre-wrap', mb: 2 }}
                    >
                        {renderDescriptionWithLinks(post.description, darkMode)}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, color: secondaryTextColor, fontSize: '0.9rem' }}>
                        <span>
                            <ThumbUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {post.likes.length} Likes
                        </span>
                        <span>
                            <ChatBubbleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {post.comments.length} Comments
                        </span>
                        <Tooltip title={`Total Likes: ${likeScore}`}>
                            <Chip 
                                label={`Rank: #${postRank + 1} | Likes: ${likeScore}`}
                                color="primary"
                                size="small"
                                sx={{ ml: 'auto', fontWeight: 'bold' }}
                            />
                        </Tooltip>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

// -------------------------------------------------------------
// LEADERBOARD COMPONENT
// -------------------------------------------------------------

const Leaderboard = () => {
  const [topPosts, setTopPosts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("leaderboard");
  const [specializationFilter, setSpecializationFilter] = useState("all"); 
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState({}); 
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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
    
    fetchTopPosts(specializationFilter === 'all' ? '' : specializationFilter);
    
    const intervalId = setInterval(() => {
        fetchTopPosts(specializationFilter === 'all' ? '' : specializationFilter);
    }, 60000);

    window.addEventListener("storage", updateUser);
    return () => {
        window.removeEventListener("storage", updateUser);
        clearInterval(intervalId);
    }
  }, [specializationFilter]); 

  const fetchTopPosts = async (specialization = "") => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts(specialization); 

      let postsWithScores = res.data.map(post => ({
        ...post,
        // Score is now just the number of likes
        decayScore: calculateDecayScore(post)
      }));

      // Sort by the calculated score (total likes)
      const sortedPosts = postsWithScores.sort((a, b) => b.decayScore - a.decayScore);

      const top10 = sortedPosts.slice(0, 10).map((post, index) => ({
          ...post,
          rank: index // Store the rank for dialog and card display
      }));
      
      setTopPosts(top10);
      
    } catch (error) {
      console.error("Error fetching top posts:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (post) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
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

      // Manually update the post in state for immediate responsiveness
      setTopPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === updatedPost._id ? { ...updatedPost, decayScore: calculateDecayScore(updatedPost), rank: post.rank } : post
        );
        // Recalculate rank after the like/unlike to maintain correct order
        const reRanked = updated.sort((a, b) => b.decayScore - a.decayScore).map((post, index) => ({...post, rank: index}));
        
        return reRanked;
      });
      
      // Also update the selected post in the dialog if it's open
      if (selectedPost && selectedPost._id === updatedPost._id) {
          setSelectedPost(prev => ({ 
              ...prev, 
              ...updatedPost, 
              decayScore: calculateDecayScore(updatedPost) 
          }));
      }


      const likedByUser = updatedPost.likes.some(
        (like) => (like.user?._id || like.user) === currentUser?._id
      );
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

      setTopPosts((prevPosts) => {
        const updated = prevPosts.map((post) =>
          post._id === updatedPost._id ? { ...updatedPost, decayScore: calculateDecayScore(updatedPost), rank: post.rank } : post
        );
        // Recalculate rank after comment to maintain correct order
        const reRanked = updated.sort((a, b) => b.decayScore - a.decayScore).map((post, index) => ({...post, rank: index}));
        
        return reRanked;
      });
      
      // Also update the selected post in the dialog if it's open
      if (selectedPost && selectedPost._id === updatedPost._id) {
          setSelectedPost(prev => ({ 
              ...prev, 
              ...updatedPost, 
              decayScore: calculateDecayScore(updatedPost) 
          }));
      }

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
            <Button startIcon={<HomeIcon />} onClick={() => handleNavClick("home")} variant={activeNav === "home" ? "text" : "text"} color="primary">Home</Button>
            <Button startIcon={<LeaderboardIcon />} onClick={() => handleNavClick("leaderboard")} variant={activeNav === "leaderboard" ? "contained" : "text"} color="primary">Leaderboard</Button>
            <Button startIcon={<PersonIcon />} onClick={() => handleNavClick("profile")} variant={activeNav === "profile" ? "text" : "text"} color="primary">Profile</Button>
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
            👑 All-Time Popularity Leaderboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: secondaryTextColor, mt: 0.5 }}>
            Ranks posts based purely on the **Total Number of Likes**.
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

        {/* Post Grid */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%',
          }}
        >
          <Grid 
            container 
            direction="column" 
            sx={{ 
              maxWidth: { xs: '100%', sm: 450, md: 500, lg: 550 },
              width: '100%' 
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress color="primary" />
              </Box>
            ) : topPosts.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
                No active projects to display on the leaderboard yet in this category.
              </Typography>
            ) : (
              topPosts.map((post, index) => {
                const likedByUser = post.likes.some(
                  (like) => (like.user?._id || like.user) === currentUser?._id
                );
                const isExpanded = expandedPostId === post._id; 
                
                const postUser = post.user;
                const postUserId = postUser?._id;
                const postUserName = postUser?.name || "Unknown";
                const timeAgo = formatTimeAgo(post.createdAt);
                
                const totalLikes = post.decayScore?.toFixed(0) || '0'; // decayScore is now just Likes
                
                const mediaUrl = post.media?.url || post.image || '';
                const hasMedia = mediaUrl; 

                return (
                  <Card key={post._id} sx={{ mb: 2, position: "relative", backgroundColor: cardBgColor, color: textColor }}>
                    
                    {/* Rank Badge / Score Chip */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        zIndex: 10,
                      }}
                    >
                        <Tooltip title={`Total Likes: ${totalLikes}`} arrow>
                          <Chip
                            label={`#${index + 1}`}
                            size="medium"
                            sx={{
                              backgroundColor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : 'primary.main',
                              color: index < 3 ? '#000' : '#fff',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          />
                        </Tooltip>
                    </Box>
                    
                    {/* CardMedia - Clickable to open dialog */}
                    {hasMedia && (
                      <CardMedia 
                        component="img" 
                        height="300" 
                        image={mediaUrl} 
                        alt={post.title} 
                        onClick={() => handleOpenDialog(post)}
                        sx={{
                          objectFit: 'cover', 
                          width: '100%',
                          cursor: 'pointer' 
                        }}
                      />
                    )}

                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            {/* Title - Clickable to open dialog */}
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: "bold", 
                                    color: textColor,
                                    cursor: 'pointer', 
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                                onClick={() => handleOpenDialog(post)}
                            >
                                {post.title}
                            </Typography>
                            {post.specialization && (
                                <Chip 
                                    label={getSpecName(post.specialization)}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </Box>

                      <Typography variant="body1" sx={{ my: 1, color: secondaryTextColor }} noWrap>{post.description}</Typography>
                      
                      {/* Post Owner and Time Ago */}
                      <Box 
                          onClick={() => handleViewProfile(postUserId)}
                          sx={{ cursor: postUser ? 'pointer' : 'default', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                          <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                  color: secondaryTextColor,
                                  fontWeight: 'bold',
                                  '&:hover': postUser && { textDecoration: 'underline', color: 'primary.main' }
                              }}
                          >
                              By: {postUserName}
                          </Typography>
                          {timeAgo && (
                            <Typography variant="caption" sx={{ color: secondaryTextColor, fontStyle: 'italic' }}>
                              &bull; {timeAgo} 
                            </Typography>
                          )}
                      </Box>

                      {/* Interaction Stats and Buttons */}
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
                          Likes: {totalLikes}
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
      
      {/* POST DETAIL DIALOG INSTANCE */}
      <PostDetailDialog 
        open={isDialogOpen}
        handleClose={handleCloseDialog}
        post={selectedPost}
        darkMode={darkMode}
      />
    </Box>
  );
};

export default Leaderboard;