const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  seen: { type: Boolean, default: false },
  seenAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ from: 1, to: 1, createdAt: 1 });
MessageSchema.index({ to: 1, seen: 1 });

module.exports = mongoose.model('Message', MessageSchema);
