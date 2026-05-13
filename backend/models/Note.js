const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title too long']
  },
  originalText: {
    type: String,
    required: true,
    maxlength: [50000, 'Notes too long']
  },
  summary: {
    type: String,
    default: null
  },
  subject: {
    type: String,
    trim: true,
    default: 'General'
  },
  tags: [String],
  isFavorite: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
