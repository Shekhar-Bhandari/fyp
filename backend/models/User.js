const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  headline: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: ''
  },
  experiences: [{
    title: String,
    company: String,
    location: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String
  }],
  skills: [String],
  profileImage: {
    type: String,
    default: ''
  },
  // Add post tracking fields
  postCount: {
    type: Number,
    default: 0
  },
  lastPostReset: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user can create more posts
userSchema.methods.canCreatePost = function() {
  const now = new Date();
  const lastReset = new Date(this.lastPostReset);
  
  // Check if it's a new week (reset post count)
  if (now - lastReset > 7 * 24 * 60 * 60 * 1000) {
    this.postCount = 0;
    this.lastPostReset = now;
    return true;
  }
  
  // Check if user has reached the weekly limit
  return this.postCount < 5;
};

// Method to increment post count
userSchema.methods.incrementPostCount = function() {
  this.postCount += 1;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);