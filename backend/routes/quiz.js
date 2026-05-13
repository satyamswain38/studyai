const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

// POST /api/quiz — save a quiz
router.post('/', protect, async (req, res) => {
  try {
    const { topic, questions } = req.body;
    const quiz = await Quiz.create({
      user: req.user._id,
      topic,
      questions,
      totalQuestions: questions.length
    });
    res.status(201).json({ quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/:id/submit — submit score
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { score } = req.body;
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { score, completedAt: new Date() },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quiz — get all quizzes for user
router.get('/', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('topic score totalQuestions completedAt createdAt');
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
