import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostServices from '../Services/PostServices';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await PostServices.createPost({ title, description, image });
      toast.success('Post created!');
      navigate('/'); // go back to home page
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating post');
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>Create Post</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Description"
          fullWidth
          required
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <TextField
          label="Image URL"
          fullWidth
          value={image}
          onChange={(e) => setImage(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">Post</Button>
      </form>
    </Container>
  );
};

export default CreatePost;
