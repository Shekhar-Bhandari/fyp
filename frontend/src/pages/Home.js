// src/pages/Home.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await PostServices.getAllPosts();
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginTop: 2 }}>
        <Typography variant="h4">MyApp Logo</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate("/create-post")}>
          Create Post
        </Button>
      </Grid>

      <Grid container direction="column" sx={{ marginTop: 2 }}>
        {posts.map((post) => (
          <Card key={post._id} sx={{ marginBottom: 2 }}>
            {post.image && <CardMedia component="img" height="200" image={post.image} alt={post.title} />}
            <CardContent>
              <Typography variant="h6">{post.title}</Typography>
              <Typography variant="body1">{post.description}</Typography>
              <Typography variant="subtitle2">
                By: {post.user ? post.user.name : "Unknown"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
