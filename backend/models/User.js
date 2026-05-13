const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  aiCreditsUsed: {
    type: Number,
    default: 0
  },
  aiCreditsResetAt: {
    type: Date,
    default: Date.now
  },
  streak: {
    type: Number,
    default: 0
  },
  lastStudiedAt: {
    type: Date
  },
  subjects: [{
    name: String,
    progress: { type: Number, default: 0 }
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check and reset daily AI credits
userSchema.methods.canUseAI = function() {
  const now = new Date();
  const resetTime = new Date(this.aiCreditsResetAt);
  const hoursSinceReset = (now - resetTime) / (1000 * 60 * 60);

  if (hoursSinceReset >= 24) {
    this.aiCreditsUsed = 0;
    this.aiCreditsResetAt = now;
  }

  const dailyLimit = this.plan === 'pro' ? 999 : 100;
  return this.aiCreditsUsed < dailyLimit;
};

module.exports = mongoose.model('User', userSchema);
