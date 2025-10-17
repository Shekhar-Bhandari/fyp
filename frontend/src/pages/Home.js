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
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
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

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
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
      console.log('Liking post:', postId);
      console.log('Current user:', currentUser._id);

      const res = await PostServices.likePost(postId);
      const updatedPost = res.data;
      
      console.log('Like successful, updated post:', updatedPost);

      // Update the posts state with the updated post
      setPosts((prevPosts) =>
        prevPosts.map((post) => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
      
      // Check if the user liked or unliked
      const likedByUser = isPostLikedByUser(updatedPost, currentUser._id);
      toast.success(likedByUser ? "Post liked!" : "Post unliked!");
      
    } catch (error) {
      console.error("=== Like Error (Frontend) ===");
      console.error("Full error:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      
      toast.error(error.response?.data?.message || "Failed to like/unlike post");
    }
  };

  // Helper function to check if post is liked by user
  const isPostLikedByUser = (post, userId) => {
    if (!post || !post.likes || !userId) return false;
    
    return post.likes.some((like) => {
      if (!like || !like.user) return false;
      
      // Handle both populated and unpopulated user references
      const likeUserId = typeof like.user === 'object' ? like.user._id : like.user;
      
      // Convert both to strings for reliable comparison
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

  const getSpecLabel = (specValue) => {
    const spec = SPECIALIZATIONS.find(s => s.value === specValue);
    return spec ? `${spec.icon} ${spec.label}` : specValue;
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}>
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

        <Grid container direction="column">
          {loading ? (
            <Typography variant="body1" sx={{ mt: 4, textAlign: "center", color: textColor }}>
              Loading posts...
            </Typography>
          ) : filteredPosts.length === 0 ? (
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
          ) : (
            filteredPosts.map((post) => {
              // Check if current user has liked this post
              const likedByUser = isPostLikedByUser(post, currentUser?._id);
              
              const postUser = post.user;
              const postUserId = postUser?._id;
              const postUserName = postUser?.name || "Unknown";

              const mediaUrl = post.media?.url || post.image || '';
              const mediaType = post.media?.type || (post.image ? 'image' : 'none');
              const hasMedia = mediaUrl && mediaType !== 'none';

              return (
                <Card key={post._id} sx={{ mb: 2, backgroundColor: cardBgColor }}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2, 
                      }}
                    >
                      <Box
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          cursor: postUser ? 'pointer' : 'default',
                        }}
                        onClick={() => handleViewProfile(postUserId)}
                      >
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 1.5,
                          bgcolor: 'primary.main',
                        }}>
                          {postUserName.charAt(0).toUpperCase()}
                        </Avatar>

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
                        </Box>
                      </Box>

                      {post.specialization && (
                        <Chip 
                          label={getSpecLabel(post.specialization)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>

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

                  {hasMedia && (
                    <Box sx={{ position: 'relative' }}>
                      {mediaType === 'video' ? (
                        <>
                          <CardMedia 
                            component="video"
                            height="200"
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
                                fontSize: 80,
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
                          height="200" 
                          image={mediaUrl} 
                          alt={post.title}
                          sx={{ borderTop: `1px solid ${darkMode ? '#333' : '#eee'}` }}
                        />
                      )}
                    </Box>
                  )}
                  
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

      {/* Video Dialog */}
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