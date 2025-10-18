// src/pages/CreatePost.js

import React, { useState, useEffect } from "react";
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Box,
  Card,
  CardMedia,
  IconButton,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PostServices from "../Services/PostServices";
import toast from "react-hot-toast";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const SPECIALIZATIONS = [
  // ... (Your SPECIALIZATIONS array)
  { value: 'web-dev', label: 'Web Development' },
  { value: 'mobile-dev', label: 'Mobile App Development' },
  { value: 'ai-ml', label: 'AI/ML' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'cloud-computing', label: 'Cloud Computing' },
  { value: 'devops', label: 'DevOps' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'game-dev', label: 'Game Development' },
  { value: 'iot', label: 'IoT' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'other', label: 'Other' },
];

// ⭐️ MATCH THIS LIMIT to the Mongoose Schema's maxlength
const MAX_TITLE_LENGTH = 200; 


const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("todoapp"))?.token;
    if (!token) {
        toast.error("Please log in to create a post.");
        navigate("/auth");
    }
  }, [navigate]);

  // ... (handleFileChange and handleRemoveMedia functions remain the same)

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error("Only image and video files are allowed");
      return;
    }

    setMediaFile(file);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !specialization) {
      toast.error("Title, description, and specialization are required.");
      return;
    }
    
    // ⭐️ FRONTEND VALIDATION: Check the title length before submitting
    if (title.trim().length > MAX_TITLE_LENGTH) {
      toast.error(`Title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('specialization', specialization);
      
      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }

      await PostServices.createPost(formData);
      toast.success("Post created successfully! 🎉");
      navigate("/home");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error creating post.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Create Post
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Title"
          fullWidth
          required
          value={title}
          // ⭐️ Limit input length in the DOM
          inputProps={{ maxLength: MAX_TITLE_LENGTH }} 
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
          
          // ⭐️ Display error state if limit is exceeded
          error={title.length > MAX_TITLE_LENGTH} 
          
          // ⭐️ Provide helpful character counter text
          helperText={`${title.length}/${MAX_TITLE_LENGTH} characters`}
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

        {/* ... (Rest of the specialization and file upload controls remain the same) ... */}
        <FormControl fullWidth required sx={{ mb: 2 }}>
          <InputLabel id="specialization-label">Specialization</InputLabel>
          <Select
            labelId="specialization-label"
            value={specialization}
            label="Specialization"
            onChange={(e) => setSpecialization(e.target.value)}
          >
            {SPECIALIZATIONS.map((spec) => (
              <MenuItem key={spec.value} value={spec.value}>
                {spec.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* File Upload Section */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
          >
            Upload Image or Video
            <input
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </Button>
          
          {mediaPreview && (
            <Card sx={{ mt: 2, position: 'relative' }}>
              {mediaType === 'image' ? (
                <CardMedia
                  component="img"
                  height="250"
                  image={mediaPreview}
                  alt="Preview"
                  sx={{ objectFit: 'contain', bgcolor: 'background.default' }}
                />
              ) : (
                <Box sx={{ position: 'relative' }}>
                  <video
                    src={mediaPreview}
                    controls
                    style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                  />
                </Box>
              )}
              <IconButton
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
                onClick={handleRemoveMedia}
              >
                <DeleteIcon sx={{ color: 'white' }} />
              </IconButton>
            </Card>
          )}
        </Box>


        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          fullWidth
          disabled={uploading || title.length > MAX_TITLE_LENGTH}
          startIcon={uploading && <CircularProgress size={20} color="inherit" />}
        >
          {uploading ? 'Creating Post...' : 'Create Post'}
        </Button>
      </form>
    </Container>
  );
};

export default CreatePost;