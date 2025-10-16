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

    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  // Filter posts when selectedSpec or posts change
  useEffect(() => {
    if (selectedSpec === "all") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.specialization === selectedSpec));
    }
  }, [selectedSpec, posts]);

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
    setPosts([]);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  // Like/unlike
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

  const getSpecLabel = (specValue) => {
    const spec = SPECIALIZATIONS.find(s => s.value === specValue);
    return spec ? `${spec.icon} ${spec.label}` : specValue;
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}>
      {/* Navigation Bar */}
      <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: cardBgColor }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
            Connectiva
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

      {/* Specialization Filter Tabs */}
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

      {/* Main Content */}
      <Container sx={{ mt: 3, pb: 4 }}>
        {/* Header Actions */}
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

        {/* Posts Section */}
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
              const likedByUser = post.likes.some(
                (like) => (like.user?._id || like.user) === currentUser?._id
              );
              
              const postUser = post.user;
              const postUserId = postUser?._id;
              const postUserName = postUser?.name || "Unknown";

              return (
                <Card key={post._id} sx={{ mb: 2, backgroundColor: cardBgColor }}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    
                    {/* User Header */}
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

                      {/* Specialization Badge */}
                      {post.specialization && (
                        <Chip 
                          label={getSpecLabel(post.specialization)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>

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

                  {/* Image */}
                  {post.image && (
                    <CardMedia 
                      component="img" 
                      height="200" 
                      image={post.image} 
                      alt={post.title}
                      sx={{ borderTop: `1px solid ${darkMode ? '#333' : '#eee'}` }}
                    />
                  )}
                  
                  {/* Actions */}
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