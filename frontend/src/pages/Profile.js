import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  Divider,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Leaderboard as LeaderboardIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Favorite as FavoriteIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon,
  ChatBubble as ChatBubbleIcon,
  // Visibility as VisibilityIcon, // REMOVED
  Close as CloseIcon,
  PersonOutline as PersonOutlineIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DarkModeToggle, { useDarkMode } from "../components/DarkModeToggle";
import PostServices from "../Services/PostServices";

// =================================================================================
// --- Utility Functions ---
const calculateHotnessScore = (post) => (post.likes?.length || 0) * 0.75; // Adjusted score calculation
const isPostLikedByUser = (post, userId) => {
    return post?.likes?.some(like => String(like.user?._id || like.user) === String(userId));
};
const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
};
const getSpecChipLabel = (specValue) => specValue || 'General';

// =================================================================================
// --- PostCard Component ---

const PostCard = React.memo(({ post, currentUser, onOpenDialog, onLike, onDeletePost, darkMode }) => {
    const theme = useTheme();
    const likedByUser = isPostLikedByUser(post, currentUser?._id);
    const cardBgColor = darkMode ? theme.palette.grey[800] : theme.palette.background.paper;
    const textColor = darkMode ? theme.palette.common.white : theme.palette.common.black;
    const secondaryTextColor = darkMode ? theme.palette.grey[400] : theme.palette.grey[700];

    return (
        <Card 
            sx={{ 
                mb: 3, 
                backgroundColor: cardBgColor, 
                color: textColor, 
                boxShadow: 3, 
                transition: '0.3s',
                '&:hover': { boxShadow: 8, transform: 'translateY(-2px)' } 
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    {/* Title and Specs */}
                    <Box onClick={() => onOpenDialog(post)} sx={{ cursor: 'pointer', flexGrow: 1 }}>
                        <Typography 
                            variant="h6" 
                            sx={{ fontWeight: 'bold', '&:hover': { color: theme.palette.primary.light } }}
                        >
                            {post.title}
                        </Typography>
                        <Chip
                            label={getSpecChipLabel(post.specialization)}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 0.5, color: secondaryTextColor }}
                        />
                    </Box>

                    {/* Actions Menu (Delete) */}
                    <IconButton 
                        onClick={() => onDeletePost(post._id)}
                        color="error"
                        size="small"
                        title="Delete Post"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>

                {/* Post Summary */}
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: secondaryTextColor, 
                        mt: 1, 
                        mb: 2, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box',
                        WebkitLineClamp: '2',
                        WebkitBoxOrient: 'vertical',
                        cursor: 'pointer' 
                    }}
                    onClick={() => onOpenDialog(post)}
                >
                    {post.description}
                </Typography>
                
                {/* Media Thumbnail (if exists) */}
                {post.media?.url && (
                    <CardMedia
                        component="img"
                        image={post.media.url}
                        alt="Post Media"
                        sx={{ maxHeight: 150, objectFit: 'cover', borderRadius: 1, mb: 2, cursor: 'pointer' }}
                        onClick={() => onOpenDialog(post)}
                    />
                )}

                <Divider sx={{ mb: 1.5, borderColor: darkMode ? theme.palette.grey[700] : theme.palette.grey[300] }} />

                {/* Stats and Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip
                            icon={<ThumbUpIcon fontSize="small" />}
                            label={post.likes.length}
                            size="small"
                            variant="outlined"
                            sx={{ color: secondaryTextColor }}
                        />
                        <Chip
                            icon={<ChatBubbleIcon fontSize="small" />}
                            label={post.comments.length}
                            size="small"
                            variant="outlined"
                            sx={{ color: secondaryTextColor }}
                        />
                        {/* REMOVED: VIEW COUNT CHIP */}
                    </Box>

                    {/* Like Button */}
                    <Button
                        onClick={() => onLike(post._id)}
                        startIcon={<ThumbUpIcon />}
                        variant={likedByUser ? "contained" : "outlined"}
                        color="primary"
                        size="small"
                    >
                        {likedByUser ? "Liked" : "Like"}
                    </Button>
                </Box>

                <Typography variant="caption" sx={{ color: secondaryTextColor, mt: 1, display: 'block' }}>
                    Posted: {formatRelativeTime(post.createdAt)}
                </Typography>

            </CardContent>
        </Card>
    );
});


// =================================================================================
// --- FullPostDialog Component ---

const FullPostDialog = React.memo(({ open, post, onClose, user, onLike, onAddComment, onNavigateProfile, newCommentText, setNewCommentText, darkMode }) => {
    const theme = useTheme();
    if (!post) return null;

    const likedByUser = isPostLikedByUser(post, user?._id);
    const mediaUrl = post.media?.url || post.image || '';

    const dialogBgColor = darkMode ? theme.palette.grey[900] : theme.palette.background.paper;
    const dialogTextColor = darkMode ? theme.palette.common.white : theme.palette.common.black;
    const secondaryTextColor = darkMode ? theme.palette.grey[400] : theme.palette.grey[700];

    const handleCommentChange = (e) => {
        setNewCommentText(prev => ({ ...prev, [post._id]: e.target.value }));
    };

    const handlePostComment = () => {
        onAddComment(post._id);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { backgroundColor: dialogBgColor, color: dialogTextColor, borderRadius: 2 } }}
        >
            <DialogTitle sx={{ borderBottom: `1px solid ${darkMode ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {post.title}
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: dialogTextColor }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0, '& .MuiDialogContent-dividers': { border: 'none' } }}>
                <Grid container>
                    {/* Left Column: Post Content */}
                    <Grid item xs={12} sm={8} sx={{ p: 3 }}>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                label={getSpecChipLabel(post.specialization)} 
                                size="small" 
                                color="primary" 
                                variant="outlined" 
                                sx={{ color: dialogTextColor }}
                            />
                            <Typography variant="caption" sx={{ color: secondaryTextColor }}>
                                • Posted {formatRelativeTime(post.createdAt)}
                            </Typography>
                        </Box>

                        {mediaUrl && (
                            <CardMedia
                                component="img"
                                image={mediaUrl}
                                alt={post.title}
                                sx={{ maxHeight: 400, objectFit: 'contain', borderRadius: 1, mb: 3 }}
                            />
                        )}

                        <Typography variant="body1" sx={{ color: dialogTextColor, whiteSpace: 'pre-wrap', mb: 3 }}>
                            {post.description}
                        </Typography>

                        <Divider sx={{ mb: 2, borderColor: darkMode ? theme.palette.grey[700] : theme.palette.grey[300] }} />

                        {/* Actions and Stats */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                onClick={() => onLike(post._id)}
                                startIcon={<ThumbUpIcon />}
                                variant={likedByUser ? "contained" : "outlined"}
                                color="primary"
                            >
                                {post.likes.length} Like{post.likes.length !== 1 ? "s" : ""}
                            </Button>
                            {/* REMOVED: VIEW COUNT CHIP */}
                            <Chip 
                                icon={<ChatBubbleIcon fontSize="small" />}
                                label={`${post.comments.length} Comments`}
                                size="small" 
                                variant="outlined"
                                sx={{ color: secondaryTextColor }}
                            />
                        </Box>
                    </Grid>

                    {/* Right Column: Comments */}
                    <Grid item xs={12} sm={4} sx={{ 
                        p: 2, 
                        borderLeft: `1px solid ${darkMode ? theme.palette.grey[700] : theme.palette.grey[300]}`,
                        height: '70vh', 
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Typography variant="h6" sx={{ color: dialogTextColor, fontWeight: 'bold', mb: 2 }}>
                            Comments ({post.comments.length})
                        </Typography>

                        <List sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                            {post.comments.length === 0 ? (
                                <Typography variant="body2" sx={{ color: secondaryTextColor, textAlign: 'center', mt: 2 }}>
                                    Be the first to comment!
                                </Typography>
                            ) : (
                                post.comments.map((comment) => (
                                    <ListItem 
                                        key={comment._id} 
                                        alignItems="flex-start" 
                                        sx={{ borderBottom: `1px dotted ${secondaryTextColor}40`, py: 1 }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Avatar 
                                                onClick={() => onNavigateProfile(comment.user?._id)} 
                                                sx={{ width: 28, height: 28, cursor: 'pointer', bgcolor: theme.palette.primary.main }}
                                            >
                                                {comment.user?.name?.charAt(0).toUpperCase() || <PersonOutlineIcon fontSize="small" />}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        color: dialogTextColor, 
                                                        cursor: 'pointer',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                    onClick={() => onNavigateProfile(comment.user?._id)}
                                                >
                                                    {comment.user?.name || 'Anonymous User'}
                                                </Typography>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        sx={{ color: dialogTextColor, display: 'block' }}
                                                    >
                                                        {comment.text}
                                                    </Typography>
                                                    <Typography component="span" variant="caption" color={secondaryTextColor}>
                                                        {formatRelativeTime(comment.createdAt)}
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>

                        {/* Comment Input */}
                        {user?.token && (
                            <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${darkMode ? theme.palette.grey[700] : theme.palette.grey[300]}` }}>
                                <TextField
                                    fullWidth
                                    label="Write a comment..."
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    value={newCommentText[post._id] || ''}
                                    onChange={handleCommentChange}
                                    sx={{ mb: 1, 
                                        '& .MuiInputLabel-root': { color: secondaryTextColor },
                                        '& .MuiOutlinedInput-root': { color: dialogTextColor, '& fieldset': { borderColor: secondaryTextColor } } 
                                    }}
                                />
                                <Button
                                    onClick={handlePostComment}
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={!newCommentText[post._id]?.trim()}
                                >
                                    Post Comment
                                </Button>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
});


// =================================================================================
// --- Profile Component ---

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeNav, setActiveNav] = useState("profile");
  const darkMode = useDarkMode();
  const [openEditProfile, setOpenEditProfile] = useState(false);
  
  // --- STATE FOR POSTS AND DIALOG ---
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newCommentText, setNewCommentText] = useState({});
  // -------------------------------------------

  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", bio: "", university: "", major: "", 
    year: "", github: "", linkedin: "",
  });
  const navigate = useNavigate();
  const theme = useTheme();

  // Dark mode colors
  const bgColor = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBgColor = darkMode ? "#2d2d2d" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";

  // --- Utility function to update a post in the local state ---
  const updatePostInState = useCallback((updatedPost) => {
    const postWithScore = { 
        ...updatedPost, 
        hotnessScore: calculateHotnessScore(updatedPost) 
    };

    setUserPosts((prevPosts) => {
        const updated = prevPosts.map((post) => 
            post._id === updatedPost._id ? postWithScore : post
        );
        return updated;
    });

    if (selectedPost && selectedPost._id === updatedPost._id) {
        setSelectedPost(postWithScore);
    }
  }, [selectedPost]);

  // Update currentUser on mount
  const updateUser = () => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
    if (user) {
      setEditForm({
        name: user.name || "", email: user.email || "", phone: user.phone || "",
        bio: user.bio || "", university: user.university || "", major: user.major || "",
        year: user.year || "", github: user.github || "", linkedin: user.linkedin || "",
      });
    }
  };

  // --- Fetch user's posts (only my posts) ---
  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await PostServices.getMyPosts();
      const fetchedPosts = response.data.map(post => ({
          ...post,
          likes: post.likes || [],
          comments: post.comments || [],
          // Removed views: post.views || 0,
          hotnessScore: calculateHotnessScore(post)
      }));
      setUserPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Could not load your posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    updateUser();
    if (JSON.parse(localStorage.getItem("todoapp"))) {
        fetchUserPosts();
    }
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  // Navigation handlers
  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    if (navItem === "home") navigate("/home");
    else if (navItem === "leaderboard") navigate("/leaderboard");
    else if (navItem === "profile") navigate("/profile");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  // Profile Edit Handlers (omitted for brevity)
  const handleEditProfile = () => setOpenEditProfile(true);
  const handleSaveProfile = () => {
      const updatedUser = { ...currentUser, ...editForm };
      localStorage.setItem("todoapp", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setOpenEditProfile(false);
      toast.success("Profile updated successfully");
  };
  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  
  // --- Post Interaction Handlers ---
  const handleLike = async (postId) => {
      if (!currentUser?.token) {
          toast.error("You must be logged in to like a post");
          return;
      }
      try {
          const res = await PostServices.likePost(postId);
          updatePostInState(res.data);
          const likedByUser = isPostLikedByUser(res.data, currentUser._id);
          toast.success(likedByUser ? "Post liked! 👍" : "Post unliked! 👎");
      } catch (error) {
          toast.error(error.response?.data?.message || "Failed to like/unlike post");
      }
  };

  const handleAddComment = async (postId) => {
      const text = newCommentText[postId]?.trim();
      if (!text) {
          toast.error("Comment cannot be empty.");
          return;
      }
      try {
          const res = await PostServices.addComment(postId, text);
          updatePostInState(res.data);
          setNewCommentText(prev => ({ ...prev, [postId]: "" }));
          toast.success("Comment added! 💬");
      } catch (error) {
          toast.error(error.response?.data?.message || "Failed to add comment.");
      }
  };

  // UPDATED: Removed all view tracking logic
  const handleOpenPostDialog = (post) => {
      setSelectedPost(post);
      setPostDialogOpen(true);
      // Removed PostServices.incrementViews(post._id) call
  };

  const handleClosePostDialog = () => {
      setPostDialogOpen(false);
      setSelectedPost(null);
  };
  
  const handleViewProfile = (userId) => {
    setPostDialogOpen(false); 
    if (userId) {
      if (userId === currentUser?._id) navigate("/profile");
      else navigate(`/profile-view/${userId}`);
    } else {
      toast.error("User information is unavailable.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
        await PostServices.deletePost(postId);
        setUserPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        toast.success("Post deleted successfully! 👋");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete post.");
    }
  };
  // -----------------------------------------

  if (!currentUser) {
    return <Container sx={{ pt: 10, textAlign: 'center' }}><Typography variant="h5">Please log in to view your profile.</Typography></Container>;
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}>
      {/* Navigation Bar */}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: textColor }}>{currentUser?.name}</Typography>
            <IconButton color="error" onClick={handleLogout} size="small" title="Logout"><LogoutIcon /></IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        
        {/* --- PROFILE TABS --- */}
        <Box sx={{ borderBottom: 1, borderColor: darkMode ? "#444" : "#e0e0e0", mb: 3 }}>
          <Button
            onClick={() => setActiveNav("profile")}
            variant={activeNav === "profile" ? "contained" : "text"}
            color="primary"
            sx={{ mr: 1 }}
          >
            Profile Info
          </Button>
          <Button
            onClick={() => setActiveNav("my-posts")}
            variant={activeNav === "my-posts" ? "contained" : "text"}
            color="primary"
          >
            My Posts ({userPosts.length})
          </Button>
        </Box>
        
        {/* --- CONDITIONAL CONTENT: MY POSTS TAB --- */}
        {activeNav === "my-posts" && (
            <Box>
                <Typography variant="h5" sx={{ color: textColor, fontWeight: 'bold', mb: 3 }}>
                    My Contributions
                </Typography>
                {loadingPosts ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : userPosts.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center', backgroundColor: cardBgColor }}>
                        <Typography variant="h6" sx={{ color: secondaryTextColor }}>
                            You haven't posted anything yet!
                        </Typography>
                        <Typography variant="body1" sx={{ color: secondaryTextColor, mt: 1 }}>
                            Create a new post to see it appear here.
                        </Typography>
                    </Card>
                ) : (
                    <Box>
                        {userPosts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                currentUser={currentUser}
                                onOpenDialog={handleOpenPostDialog}
                                onLike={handleLike}
                                onDeletePost={handleDeletePost}
                                darkMode={darkMode}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        )}
        
        {/* --- CONDITIONAL CONTENT: PROFILE INFO TAB --- */}
        {activeNav === "profile" && (
          <>
            {/* Profile Header Card */}
            <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Avatar sx={{ width: 100, height: 100, fontSize: "2.5rem", backgroundColor: "primary.main", }}>
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>{currentUser?.name}</Typography>
                    {currentUser?.bio && (<Typography variant="body1" sx={{ color: secondaryTextColor, mb: 2 }}>{currentUser.bio}</Typography>)}
                    <Typography variant="body2" sx={{ color: secondaryTextColor, mb: 2 }}>{currentUser?.email}</Typography>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditProfile} size="small">
                      Edit Profile
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Education & Contact Info Card */}
            <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Profile Information</Typography>
                <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <EmailIcon sx={{ color: secondaryTextColor }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: secondaryTextColor }}>Email</Typography>
                        <Typography variant="body1" sx={{ color: textColor }}>{currentUser?.email || "Not provided"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <PhoneIcon sx={{ color: secondaryTextColor }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: secondaryTextColor }}>Phone</Typography>
                        <Typography variant="body1" sx={{ color: textColor }}>{currentUser?.phone || "Not provided"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {currentUser?.university && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <SchoolIcon sx={{ color: secondaryTextColor }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: secondaryTextColor }}>University</Typography>
                          <Typography variant="body1" sx={{ color: textColor }}>{currentUser.university}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  {currentUser?.major && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <WorkIcon sx={{ color: secondaryTextColor }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: secondaryTextColor }}>Major</Typography>
                          <Typography variant="body1" sx={{ color: textColor }}>{currentUser.major}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  {currentUser?.year && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <CalendarIcon sx={{ color: secondaryTextColor }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: secondaryTextColor }}>Year of Study</Typography>
                          <Typography variant="body1" sx={{ color: textColor }}>{currentUser.year}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Social Links Card */}
            {(currentUser?.github || currentUser?.linkedin) && (
              <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>Social Links</Typography>
                  <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />
                  <Grid container spacing={2}>
                    {currentUser?.github && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <GitHubIcon sx={{ color: secondaryTextColor }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: secondaryTextColor }}>GitHub</Typography>
                            <Typography variant="body1" sx={{ color: textColor }}>
                              <a href={`https://github.com/${currentUser.github}`} target="_blank" rel="noopener noreferrer" style={{ color: darkMode ? theme.palette.info.light : theme.palette.info.dark, textDecoration: "none" }}>
                                @{currentUser.github}
                              </a>
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    {currentUser?.linkedin && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LinkedInIcon sx={{ color: secondaryTextColor }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: secondaryTextColor }}>LinkedIn</Typography>
                            <Typography variant="body1" sx={{ color: textColor }}>
                              <a href={`https://linkedin.com/in/${currentUser.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: darkMode ? theme.palette.info.light : theme.palette.info.dark, textDecoration: "none" }}>
                                /{currentUser.linkedin}
                              </a>
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
      
      {/* Edit Profile Dialog */}
      <Dialog open={openEditProfile} onClose={() => setOpenEditProfile(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
            <TextField autoFocus margin="dense" name="name" label="Name" type="text" fullWidth variant="outlined" value={editForm.name} onChange={handleInputChange} sx={{ mb: 2 }}/>
            <TextField margin="dense" name="email" label="Email Address" type="email" fullWidth variant="outlined" value={editForm.email} onChange={handleInputChange} sx={{ mb: 2 }}/>
            <TextField margin="dense" name="bio" label="Bio" type="text" fullWidth multiline rows={3} variant="outlined" value={editForm.bio} onChange={handleInputChange} sx={{ mb: 2 }}/>
            <TextField margin="dense" name="university" label="University" type="text" fullWidth variant="outlined" value={editForm.university} onChange={handleInputChange} sx={{ mb: 2 }}/>
            <TextField margin="dense" name="major" label="Major" type="text" fullWidth variant="outlined" value={editForm.major} onChange={handleInputChange} sx={{ mb: 2 }}/>
            <TextField margin="dense" name="github" label="GitHub Username" type="text" fullWidth variant="outlined" value={editForm.github} onChange={handleInputChange} sx={{ mb: 2 }}/>
            <TextField margin="dense" name="linkedin" label="LinkedIn Profile URL (suffix)" type="text" fullWidth variant="outlined" value={editForm.linkedin} onChange={handleInputChange} sx={{ mb: 2 }}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProfile(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Full Post Dialog */}
      <FullPostDialog
        open={postDialogOpen}
        post={selectedPost}
        onClose={handleClosePostDialog}
        user={currentUser}
        onLike={handleLike}
        onAddComment={handleAddComment}
        onNavigateProfile={handleViewProfile}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        darkMode={darkMode}
      />
    </Box>
  );
};

export default Profile;