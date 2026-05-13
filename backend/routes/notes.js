const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

// GET /api/notes — get all notes for user
router.get('/', protect, async (req, res) => {
  try {
    const { subject, search } = req.query;
    let query = { user: req.user._id };
    if (subject) query.subject = subject;
    if (search) query.$text = { $search: search };

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .select('-originalText');

    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notes/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const { title, subject, isFavorite, tags } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, subject, isFavorite, tags },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
