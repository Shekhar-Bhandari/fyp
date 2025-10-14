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
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";

const Leaderboard = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Update currentUser on mount
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

  // Fetch all posts, sort by likes, and get top 10
  const fetchTopPosts = async () => {
    try {
      setLoading(true);
      const res = await PostServices.getAllPosts();
      
      // Sort posts by number of likes (descending) and get top 10
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("todoapp");
    setCurrentUser(null);
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

  return (
    <Container>
      {/* Header */}
      <Grid 
        container 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mt: 2, mb: 3 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/home")}
          >
            Back to Home
          </Button>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            🏆 Leaderboard - Top 10 Posts
          </Typography>
        </Box>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {currentUser ? (
            <>
              <Typography variant="subtitle1" component="span">
                Hello, {currentUser?.name}!
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
          )}
        </div>
      </Grid>

      {/* Posts Section */}
      <Grid container direction="column">
        {loading ? (
          <Typography variant="body1" sx={{ mt: 4, textAlign: "center" }}>
            Loading leaderboard...
          </Typography>
        ) : posts.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 4, textAlign: "center" }}>
            No posts available yet.
          </Typography>
        ) : (
          posts.map((post, index) => {
            // Check if current user has liked this post
            const likedByUser = post.likes.some(
              (like) => (like.user?._id || like.user) === currentUser?._id
            );

            return (
              <Card key={post._id} sx={{ mb: 2 }}>
                {/* Rank Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor:
                      index === 0
                        ? "#FFD700"
                        : index === 1
                        ? "#C0C0C0"
                        : index === 2
                        ? "#CD7F32"
                        : "#f0f0f0",
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

                {post.image && (
                  <CardMedia 
                    component="img" 
                    height="200" 
                    image={post.image} 
                    alt={post.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body1" sx={{ my: 1 }}>
                    {post.description}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    By: {post.user ? post.user.name : "Unknown"}
                  </Typography>

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
                    
                    {/* Show ranking info */}
                    <Typography
                      variant="body2"
                      sx={{
                        ml: 2,
                        p: 1,
                        backgroundColor: "#f0f0f0",
                        borderRadius: 1,
                        fontWeight: "bold",
                      }}
                    >
                      Rank: #{index + 1}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Grid>
    </Container>
  );
};

export default Leaderboard;