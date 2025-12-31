const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [
    {
      text: {
        type: String,
        required: true
      },
      votes: {
        type: Number,
        default: 0
      }
    }
  ],
  pollId: {
    type: String,
    unique: true,
    required: true
  },
  votedIPs: [{
    type: String
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    default: null  // null means no expiry
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Optional: Auto-remove expired polls after some time (MongoDB TTL index)
pollSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Poll', pollSchema);