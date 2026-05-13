const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');

// GET /api/planner/chats — get chat history
router.get('/chats', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title updatedAt messages')
      .limit(20);
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/planner/chats/:id
router.delete('/chats/:id', protect, async (req, res) => {
  try {
    await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Chat deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
