// src/pages/CreatePost.js
import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";

const specializations = [
  "Machine Learning",
  "Web Development",
  "Mobile App Development",
  "Cloud Computing",
  "DevOps",
  "AI",
];

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [specialization, setSpecialization] = useState(""); // NEW
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    if (!token) navigate("/auth");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!specialization) {
      toast.error("Please select a specialization");
      return;
    }

    try {
      await PostServices.createPost({ title, description, image, specialization });
      toast.success("Post created!");
      navigate("/home");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating post");
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create Post
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          fullWidth
          required
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Image URL"
          fullWidth
          value={image}
          onChange={(e) => setImage(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Specialization dropdown */}
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="specialization-label">Specialization</InputLabel>
          <Select
            labelId="specialization-label"
            value={specialization}
            label="Specialization"
            onChange={(e) => setSpecialization(e.target.value)}
          >
            {specializations.map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary">
          Post
        </Button>
      </form>
    </Container>
  );
};

export default CreatePost;
