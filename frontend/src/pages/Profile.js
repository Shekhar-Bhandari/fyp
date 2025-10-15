import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  Switch,
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
  CircularProgress, // Added for loading state
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Leaderboard as LeaderboardIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Favorite as FavoriteIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Delete as DeleteIcon, // Added for post actions
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DarkModeToggle, { useDarkMode } from "../components/DarkModeToggle";
import PostServices from "../Services/PostServices"; // <--- NEW IMPORT

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeNav, setActiveNav] = useState("profile");
  const darkMode = useDarkMode();
  const [openSettings, setOpenSettings] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  
  // --- NEW STATE FOR POSTS ---
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  // ---------------------------

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    university: "",
    major: "",
    year: "",
    github: "",
    linkedin: "",
  });
  const navigate = useNavigate();

  // Dark mode colors
  const bgColor = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBgColor = darkMode ? "#2d2d2d" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#000000";
  const secondaryTextColor = darkMode ? "#b0b0b0" : "#666666";

  // Update currentUser on mount
  const updateUser = () => {
    const user = JSON.parse(localStorage.getItem("todoapp"));
    setCurrentUser(user);
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        university: user.university || "",
        major: user.major || "",
        year: user.year || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
      });
    }
  };

  // --- NEW: Fetch user's posts ---
  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      // The API call to get posts for the logged-in user
      const response = await PostServices.getMyPosts();
      setUserPosts(response.data);
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
        fetchUserPosts(); // Fetch posts on mount if logged in
    }

    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

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
    // If navItem is 'my-posts', we just change the activeNav state, staying on the /profile route
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    localStorage.setItem("darkMode", newMode.toString());
    window.dispatchEvent(new Event('darkModeChange'));
    toast.success(`${newMode ? "Dark" : "Light"} mode enabled`);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setOpenEditProfile(true);
  };

  const handleSaveProfile = () => {
    // Update user in localStorage
    const updatedUser = {
      ...currentUser,
      ...editForm,
    };
    localStorage.setItem("todoapp", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setOpenEditProfile(false);
    toast.success("Profile updated successfully");
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // Placeholder for a full post deletion handler
  const handleDeletePost = (postId) => {
    toast(`Simulating deletion of post ${postId}...`, { icon: '⏳' });
    // In a real app, you would call PostServices.deletePost(postId) here
    // and then call fetchUserPosts() again to refresh the list.
  };

  if (!currentUser) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: bgColor }}>
        <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: cardBgColor }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "primary.main" }}>
              MyApp
            </Typography>
            <DarkModeToggle />
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h5" sx={{ mb: 3, color: textColor }}>
            Please log in to view your profile
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/auth")}
          >
            Go to Login
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: bgColor, transition: "background-color 0.3s" }}>
      {/* Navigation Bar (omitted for brevity, assume it's unchanged) */}
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

          {/* User Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ color: textColor }}>
              {currentUser?.name}
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
        
        {/* --- CONDITIONAL CONTENT: PROFILE INFO TAB --- */}
        {activeNav === "profile" && (
          <>
            {/* Profile Header Card */}
            <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: "2.5rem",
                      backgroundColor: "primary.main",
                    }}
                  >
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                      {currentUser?.name}
                    </Typography>
                    {currentUser?.bio && (
                      <Typography variant="body1" sx={{ color: secondaryTextColor, mb: 2 }}>
                        {currentUser.bio}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: secondaryTextColor, mb: 2 }}>
                      {currentUser?.email}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditProfile}
                      size="small"
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Education & Contact Info Card */}
            <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Profile Information
                </Typography>
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

            {/* Interests Card */}
            {currentUser?.interests && currentUser.interests.length > 0 && (
              <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <FavoriteIcon sx={{ color: "error.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>Interests</Typography>
                  </Box>
                  <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {currentUser.interests.map((interest, index) => (
                      <Chip key={index} label={interest} color="primary" variant="outlined" sx={{ color: textColor }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Skills Card */}
            {currentUser?.skills && currentUser.skills.length > 0 && (
              <Card sx={{ mb: 3, backgroundColor: cardBgColor, color: textColor }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CodeIcon sx={{ color: "success.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>Skills</Typography>
                  </Box>
                  <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {currentUser.skills.map((skill, index) => (
                      <Chip key={index} label={skill} color="success" variant="outlined" sx={{ color: textColor }} />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            )}

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
                              <a 
                                href={`https://github.com/${currentUser.github}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: darkMode ? "#58a6ff" : "#0969da", textDecoration: "none" }}
                              >
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
                              <a 
                                href={`https://linkedin.com/in/${currentUser.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: darkMode ? "#58a6ff" : "#0969da", textDecoration: "none" }}
                              >
                                {currentUser.linkedin}
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

        {/* --- CONDITIONAL CONTENT: MY POSTS TAB --- */}
        {activeNav === "my-posts" && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, color: textColor, fontWeight: "bold" }}>
              My Published Posts
            </Typography>

            {loadingPosts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : userPosts.length === 0 ? (
              <Card sx={{ backgroundColor: cardBgColor, p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: secondaryTextColor }}>
                  You haven't created any posts yet.
                </Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                    Create Your First Post
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {userPosts.map((post) => (
                  <Grid item xs={12} key={post._id}>
                    <Card sx={{ backgroundColor: cardBgColor, p: 2, border: '1px solid', borderColor: darkMode ? '#333' : '#eee' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ color: 'primary.main', mb: 0.5 }}>{post.title}</Typography>
                            <Chip 
                                label={post.specialization} 
                                size="small" 
                                color="secondary" 
                                variant="outlined"
                                sx={{ mb: 1 }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" color="primary" onClick={() => toast.success(`Edit ${post.title}`)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeletePost(post._id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ color: secondaryTextColor }}>
                        {post.description.length > 200 ? `${post.description.substring(0, 200)}...` : post.description}
                      </Typography>
                      <Divider sx={{ my: 1, borderColor: darkMode ? "#444" : "#e0e0e0" }} />
                      <Typography variant="caption" sx={{ color: secondaryTextColor }}>
                        Likes: {post.likes.length} | Created: {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Settings Card (Always visible) */}
        <Card sx={{ backgroundColor: cardBgColor, color: textColor, mt: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Settings</Typography>
              <IconButton onClick={() => setOpenSettings(true)} sx={{ color: textColor }}>
                <SettingsIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />

            {/* Dark Mode Toggle */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {darkMode ? <DarkModeIcon sx={{ color: textColor }} /> : <LightModeIcon sx={{ color: textColor }} />}
                <Typography variant="body1">{darkMode ? "Dark Mode" : "Light Mode"}</Typography>
              </Box>
              <Switch checked={darkMode} onChange={handleDarkModeToggle} color="primary" />
            </Box>

            <Divider sx={{ mb: 2, borderColor: darkMode ? "#444" : "#e0e0e0" }} />

            {/* Sign Out Button */}
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              fullWidth
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </Container>
      
      {/* Edit Profile Dialog and Settings Dialog (omitted for brevity, assume unchanged) */}
      {/* ... Edit Profile Dialog ... */}
      <Dialog 
        open={openEditProfile} 
        onClose={() => setOpenEditProfile(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: cardBgColor,
            color: textColor
          }
        }}
      >
        <DialogTitle sx={{ color: textColor }}>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField fullWidth label="Name" name="name" value={editForm.name} onChange={handleInputChange} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="Bio" name="bio" value={editForm.bio} onChange={handleInputChange} multiline rows={3} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="Email" name="email" type="email" value={editForm.email} onChange={handleInputChange} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="Phone" name="phone" value={editForm.phone} onChange={handleInputChange} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="University" name="university" value={editForm.university} onChange={handleInputChange} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="Major" name="major" value={editForm.major} onChange={handleInputChange} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="Year of Study" name="year" value={editForm.year} onChange={handleInputChange} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="GitHub Username" name="github" value={editForm.github} onChange={handleInputChange} sx={{ mb: 2, '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
            <TextField fullWidth label="LinkedIn Username" name="linkedin" value={editForm.linkedin} onChange={handleInputChange} sx={{ '& .MuiInputLabel-root': { color: secondaryTextColor }, '& .MuiOutlinedInput-root': { color: textColor, '& fieldset': { borderColor: darkMode ? "#555" : "#ccc" }, '&:hover fieldset': { borderColor: darkMode ? "#777" : "#999" } } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditProfile(false)}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* ... Settings Dialog ... */}
      <Dialog 
        open={openSettings} 
        onClose={() => setOpenSettings(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: cardBgColor,
            color: textColor
          }
        }}
      >
        <DialogTitle sx={{ color: textColor }}>Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {darkMode ? <DarkModeIcon sx={{ color: textColor }} /> : <LightModeIcon sx={{ color: textColor }} />}
                <Typography variant="body1">{darkMode ? "Dark Mode" : "Light Mode"}</Typography>
              </Box>
              <Switch checked={darkMode} onChange={handleDarkModeToggle} color="primary" />
            </Box>
            
            <Typography variant="body2" sx={{ color: secondaryTextColor }}>
              More settings options can be added here.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;