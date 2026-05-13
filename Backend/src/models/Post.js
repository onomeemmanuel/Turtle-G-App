const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, default: '' },
  mediaUrls: [{ type: String }],
  type: { type: String, enum: ['post', 'reel', 'market', 'story'], default: 'post' },
  marketCategory: { type: String, default: 'General' },
  marketFeePaid: { type: Boolean, default: false },
  paymentReference: { type: String, default: '' },
  expiresAt: { type: Date },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now }
});

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ type: 1, expiresAt: 1 });

module.exports = mongoose.model('Post', PostSchema);
