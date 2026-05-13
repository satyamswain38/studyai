const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String
  }],
  score: {
    type: Number,
    default: null
  },
  totalQuestions: Number,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
