const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const { v4: uuid } = require('uuid');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { question, options } = req.body;
  if (!question || options.length < 2 || options.some(o => !o.trim())) {
    return res.status(400).json({ msg: 'Min 2 options required' });
  }

  const pollOptions = options.map(text => ({ text, votes: 0 }));
  const pollId = uuid();

  const poll = new Poll({ question, options: pollOptions, admin: req.user.id, pollId, votedIPs: [] });
  await poll.save();

  res.json({ pollId, votingUrl: `http://localhost:5173/poll/${pollId}`, resultsUrl: `http://localhost:5173/results/${pollId}` });
});

router.get('/:id', async (req, res) => {
  const poll = await Poll.findOne({ pollId: req.params.id });
  if (!poll) return res.status(404).json({ msg: 'Poll not found' });

  res.json({
    question: poll.question,
    options: poll.options.map(o => o.text),
  });
});

router.get('/results/:id', async (req, res) => {
  const poll = await Poll.findOne({ pollId: req.params.id });
  if (!poll) return res.status(404).json({ msg: 'Poll not found' });

  res.json({
    question: poll.question,
    options: poll.options.map(o => ({ text: o.text, votes: o.votes })),
  });
});

router.post('/vote/:id', async (req, res) => {
  const { optionIndex } = req.body;
  const ip = req.ip;

  const poll = await Poll.findOne({ pollId: req.params.id });
  if (!poll) return res.status(404).json({ msg: 'Poll not found' });
  if (poll.votedIPs.includes(ip)) return res.status(400).json({ msg: 'Already voted' });
  if (poll.votedIPs.length >= 100) return res.status(400).json({ msg: 'Max 100 voters' });
  if (optionIndex < 0 || optionIndex >= poll.options.length) return res.status(400).json({ msg: 'Invalid option' });

  poll.options[optionIndex].votes += 1;
  poll.votedIPs.push(ip);
  await poll.save();

  const results = {
    question: poll.question,
    options: poll.options.map(o => ({ text: o.text, votes: o.votes })),
  };

  req.io.to(poll.pollId).emit('updateResults', results);

  res.json({ msg: 'Voted' });
});

module.exports = router;