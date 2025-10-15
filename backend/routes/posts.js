const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// ---------------- CREATE POST ----------------
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, image, specialization } = req.body;

    if (!title || !description || !specialization) {
      return res.status(400).json({ message: 'Title, description, and specialization are required' });
    }

    const post = await Post.create({
      user: req.user._id,
      title: title.trim(),
      description: description.trim(),
      image: image || '',
      specialization
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

// ---------------- GET ALL POSTS ----------------
router.get('/', async (req, res) => {
  try {
    const { specialization } = req.query; // optional filter
    let query = {};
    if (specialization) query.specialization = specialization;

    const posts = await Post.find(query)
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});
// ----------
router.get('/my-posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate('user', 'name profileImage')
      .populate('likes.user', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 }); // newest first

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

// ---------------- UPDATE POST ----------------
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, image, specialization } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    post.title = title || post.title;
    post.description = description || post.description;
    post.image = image || post.image;
    post.specialization = specialization || post.specialization;

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
      .populate('likes.user', 'name email');

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// ---------------- ADD COMMENT ----------------
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage');

    res.status(201).json(populatedPost.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
