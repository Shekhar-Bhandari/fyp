const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// -------------------- CREATE POST --------------------
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, image } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ message: 'Title too long (max 200 characters)' });
    }

    const post = await Post.create({
      user: req.user._id,
      title: title.trim(),
      description: description.trim(),
      image: image || ''
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'name profileImage');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// -------------------- UPDATE POST --------------------
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    if (title && title.length > 200) {
      return res.status(400).json({ message: 'Title too long (max 200 characters)' });
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title.trim();
    if (description !== undefined) updatedData.description = description.trim();
    if (image !== undefined) updatedData.image = image;

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updatedData, { new: true })
      .populate('user', 'name profileImage');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// -------------------- DELETE POST --------------------
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully', deletedPostId: req.params.id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
