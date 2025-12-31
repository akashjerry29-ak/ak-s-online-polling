require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const Poll = require('./models/Poll');
const User = require('./models/User');
const Feedback = require('./models/Feedback'); // ← Added for testimonials

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' }
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

io.on('connection', socket => {
  socket.on('joinPoll', pollId => socket.join(pollId));
  console.log('User connected');
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    user = new User({ email, password: hash });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// Create Poll - Supports expiry
app.post('/api/polls', auth, async (req, res) => {
  const { question, options, expiresAt } = req.body;
  if (!question || !options || options.length < 2) {
    return res.status(400).json({ msg: 'Question and at least 2 options required' });
  }

  const pollId = uuid();
  const poll = new Poll({
    question,
    options: options.map(text => ({ text })),
    pollId,
    creator: req.userId,
    votedIPs: [],
    expiresAt: expiresAt ? new Date(expiresAt) : null
  });

  try {
    await poll.save();
    res.json({
      pollId,
      votingUrl: `http://localhost:5173/poll/${pollId}`,
      resultsUrl: `http://localhost:5173/results/${pollId}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error creating poll' });
  }
});

// Get Poll Details (Public)
app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollId: req.params.id });
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    res.json({
      question: poll.question,
      options: poll.options.map(o => o.text)
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Results - With Expiry Info
app.get('/api/polls/results/:id', async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollId: req.params.id });
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    const expired = poll.expiresAt && new Date() > poll.expiresAt;

    res.json({
      question: poll.question,
      options: poll.options.map(o => ({ text: o.text, votes: o.votes })),
      expired,
      expiresAt: poll.expiresAt
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Vote - Blocks Expired Polls
app.post('/api/polls/vote/:id', async (req, res) => {
  const { optionIndex } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    const poll = await Poll.findOne({ pollId: req.params.id });
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ msg: 'Poll has expired' });
    }

    if (poll.votedIPs.includes(ip)) {
      return res.status(400).json({ msg: 'You have already voted' });
    }

    if (poll.votedIPs.length >= 100) {
      return res.status(400).json({ msg: 'Maximum voters reached' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ msg: 'Invalid option' });
    }

    poll.options[optionIndex].votes += 1;
    poll.votedIPs.push(ip);
    await poll.save();

    const expired = poll.expiresAt && new Date() > poll.expiresAt;

    io.to(poll.pollId).emit('updateResults', {
      question: poll.question,
      options: poll.options.map(o => ({ text: o.text, votes: o.votes })),
      expired,
      expiresAt: poll.expiresAt
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// My Polls
app.get('/api/my-polls', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.userId }).sort({ createdAt: -1 });
    res.json(polls.map(p => ({
      pollId: p.pollId,
      question: p.question,
      createdAt: p.createdAt,
      votingUrl: `http://localhost:5173/poll/${p.pollId}`,
      resultsUrl: `http://localhost:5173/results/${p.pollId}`
    })));
  } catch (err) {
    res.status(500).json({ msg: 'Error' });
  }
});

// === FEEDBACK ROUTES (This fixes your 404 error!) ===
app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(12);
    res.json(feedbacks);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ msg: 'Error fetching feedback' });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { name, message, rating } = req.body;

  if (!name || !message || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ msg: 'Name, message, and rating (1-5) required' });
  }

  try {
    const feedback = new Feedback({
      name: name.trim(),
      message: message.trim(),
      rating: Number(rating)
    });

    await feedback.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ msg: 'Error saving feedback' });
  }
});
// === END FEEDBACK ROUTES ===

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});