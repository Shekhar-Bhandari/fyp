const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User'); // Import User model for post quota checks
const { protect } = require('../middleware/auth');

// Initialize upload and cloudinary variables
let upload, cloudinary;

// Attempt to import Cloudinary/Multer setup
try {
  const cloudinaryModule = require('../config/cloudinary');
  upload = cloudinaryModule.upload;
  cloudinary = cloudinaryModule.cloudinary;
  // console.log('✓ Cloudinary module loaded successfully'); // Keeping this log out of the route file
} catch (error) {
  // CRITICAL: Log this error if it occurs to diagnose import/config failure
  console.error('✗ CRITICAL: Failed to load Cloudinary/Multer module in posts.js:', error.message); 
}

// ---------------- CREATE POST WITH FILE UPLOAD ----------------
router.post('/', protect, (req, res, next) => {
  // Check if upload middleware exists
  if (upload) {
    // Use multer's error handler to explicitly catch sync errors
    upload.single('mediaFile')(req, res, (error) => {
        if (error) {
            console.error("Multer/Cloudinary Upload Error:", error.message);
            // Pass the error to the main Express error handling middleware
            return next(error); 
        }
        next(); // Proceed to the async controller function
    }); 
  } else {
    // If upload is missing (due to failed import), we still proceed without file handling
    console.warn('Warning: Post creation proceeding without file upload middleware (upload is undefined).');
    next(); 
  }
}, async (req, res) => {
  try {
    console.log('=== POST CREATE REQUEST START ===');
    
    // 1. Fetch full User object for quota check
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Authenticated user not found.' });
    }
    
    // 2. Check and enforce post limit
    if (!user.canCreatePost()) {
        await user.save();
        return res.status(403).json({ message: 'You have reached the weekly post limit (5 posts).' });
    }
    
    const { title, description, specialization } = req.body;

    if (!title || !description || !specialization) {
      return res.status(400).json({ message: 'Title, description, and specialization are required' });
    }

    // Prepare media object
    const mediaData = {
      url: '', type: 'none', publicId: ''
    };

    // Handle file upload result
    if (req.file) {
      mediaData.url = req.file.path;
      mediaData.publicId = req.file.filename;
      mediaData.type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    // Create the post
    const post = await Post.create({
      user: req.user._id,
      title: title.trim(),
      description: description.trim(),
      media: mediaData,
      image: mediaData.url, // For backward compatibility
      specialization,
      isArchived: false
    });

    // 3. Increment count
    await user.incrementPostCount();

    const populatedPost = await Post.findById(post._id).populate('user', 'name profileImage');

    console.log('Post created successfully:', populatedPost._id);
    console.log('=== POST CREATE REQUEST END ===');
    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('=== ERROR CREATING POST (Async Block) ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation failed: A required field for the post is missing or invalid.' });
    }
    
    // Pass the original error message to the frontend, which is helpful for debugging
    res.status(500).json({ message: error.message || 'Server Error during post creation.' });
  }
});

// ---------------- GET ALL POSTS (HOME FEED - WITH DECAY SYSTEM) ----------------
router.get('/', async (req, res) => {
  try {
    const { specialization } = req.query; 
    
    let query = { isArchived: false }; 
    
    if (specialization) {
      query.specialization = specialization;
    }

    const posts = await Post.find(query) 
      .populate('user', 'name profileImage') 
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name profileImage'); 
    
    const postsWithScore = posts.map(post => {
      const now = new Date();
      const ageInHours = (now - post.createdAt) / (1000 * 60 * 60) + 0.1; 
      const likes = post.likes.length;
      const comments = post.comments.length;
      const rankScore = (likes + (comments * 2)) / ageInHours; 
      
      return { 
        ...post.toObject(), 
        rankScore: rankScore
      };
    });

    postsWithScore.sort((a, b) => b.rankScore - a.rankScore);

    const finalPosts = postsWithScore.map(p => {
      const { rankScore, ...rest } = p;
      return rest;
    });

    res.json(finalPosts);

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// ---------------- GET MY POSTS ----------------
router.get('/my-posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

// ---------------- UPDATE POST ----------------
router.put('/:id', protect, (req, res, next) => {
  if (upload) {
    upload.single('mediaFile')(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  try {
    const { title, description, specialization, removeMedia } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    // Delete old media if new file uploaded or removeMedia flag is set
    if ((req.file || removeMedia === 'true') && post.media?.publicId && cloudinary) {
      try {
        await cloudinary.uploader.destroy(post.media.publicId, {
          resource_type: post.media.type === 'video' ? 'video' : 'image'
        });
      } catch (err) {
        console.error('Error deleting old media:', err);
      }
    }

    // Update fields
    post.title = title || post.title;
    post.description = description || post.description;
    post.specialization = specialization || post.specialization;

    // Handle new media upload
    if (req.file) {
      post.media = {
        url: req.file.path,
        publicId: req.file.filename,
        type: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
      };
      post.image = req.file.path;
    } else if (removeMedia === 'true') {
      post.media = { url: '', type: 'none', publicId: '' };
      post.image = '';
    }

    const updatedPost = await post.save();
    const populated = await Post.findById(updatedPost._id).populate('user', 'name profileImage');

    res.json({ message: 'Post updated successfully', post: populated });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------- DELETE POST ----------------
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete media from Cloudinary if exists
    if (post.media?.publicId && cloudinary) {
      try {
        await cloudinary.uploader.destroy(post.media.publicId, {
          resource_type: post.media.type === 'video' ? 'video' : 'image'
        });
      } catch (err) {
        console.error('Error deleting media:', err);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully', deletedPostId: req.params.id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------- LIKE / UNLIKE POST ----------------
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id.toString();
    const hasLiked = post.likes.some(like => like.user.toString() === userId);

    if (hasLiked) {
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name profileImage'); 

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------- ADD COMMENT ----------------
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body; 
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user._id, 
      text: text.trim()   
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name profileImage'); 

    res.status(201).json(populatedPost); 

  } catch (error) {
    console.error('Error adding comment:', error.message); 
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed: Comment user or text field is missing/invalid.' });
    }

    res.status(500).json({ message: 'Failed to add comment: ' + error.message });
  }
});

module.exports = router;