const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Note = require('../models/Note');
const Chat = require('../models/Chat');
const User = require('../models/User');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  }
});

const checkCredits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.canUseAI()) {
      return res.status(429).json({ error: 'Daily AI limit reached.', upgradeRequired: user.plan === 'free' });
    }
    user.aiCreditsUsed += 1;
    await user.save();
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post('/summarize', protect, checkCredits, async (req, res) => {
  try {
    const { text, title, subject } = req.body;
    if (!text || text.trim().length < 20) return res.status(400).json({ error: 'Please provide at least 20 characters.' });
    const result = await model.generateContent(`Summarize these notes into clear exam-focused bullet points. Use ✅ for key concepts, 💡 for definitions, ⚠️ for common mistakes:\n\n${text}`);
    const summary = result.response.text();
    const note = await Note.create({ user: req.user._id, title: title || 'Untitled Note', originalText: text, summary, subject: subject || 'General' });
    res.json({ summary, noteId: note._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/summarize-pdf', protect, checkCredits, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded.' });
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text.substring(0, 8000);
    const result = await model.generateContent(`Summarize this document into exam-focused bullet points:\n\n${text}`);
    const summary = result.response.text();
    const note = await Note.create({ user: req.user._id, title: req.file.originalname.replace('.pdf', ''), originalText: text, summary, subject: req.body.subject || 'General' });
    res.json({ summary, noteId: note._id, extractedLength: text.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/chat', protect, checkCredits, async (req, res) => {
  try {
    const { message, chatId, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'You are a friendly expert student tutor. Explain concepts clearly with examples.' }] },
        { role: 'model', parts: [{ text: 'Sure! I am your AI study buddy. Ask me anything!' }] },
        ...history.slice(-8).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
      ]
    });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();
    let savedChat;
    if (chatId) {
      savedChat = await Chat.findOneAndUpdate({ _id: chatId, user: req.user._id }, { $push: { messages: [{ role: 'user', content: message }, { role: 'assistant', content: reply }] } }, { new: true });
    } else {
      savedChat = await Chat.create({ user: req.user._id, title: message.substring(0, 50), messages: [{ role: 'user', content: message }, { role: 'assistant', content: reply }] });
    }
    res.json({ reply, chatId: savedChat._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/generate-quiz', protect, checkCredits, async (req, res) => {
  try {
    const { topic, count = 5 } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: 'Topic is required.' });
    const result = await model.generateContent(`Generate ${Math.min(parseInt(count), 10)} MCQ questions on: "${topic}". Return ONLY valid JSON array, no markdown:\n[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"A","explanation":"..."}]`);
    let raw = result.response.text().trim().replace(/\`\`\`json|\`\`\`/g, '').trim();
    const questions = JSON.parse(raw);
    res.json({ questions, topic });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/study-plan', protect, checkCredits, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description?.trim()) return res.status(400).json({ error: 'Please describe your situation.' });
    const result = await model.generateContent(`Create a day-by-day study plan for: ${description}\nFormat: Day 1 (Mon): Subject - Topic - X hrs\nPrioritize weak subjects.`);
    res.json({ plan: result.response.text() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;