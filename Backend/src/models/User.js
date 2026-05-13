const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: 'Student at Turtle-G' },
  profilePicUrl: { type: String, default: '' },
  birthday: { type: String, default: '' },
  age: { type: Number, default: 0 },
  location: { type: String, default: '' },
  crownCount: { type: Number, default: 0 },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questions: [{ type: String }],
  notifications: [
    {
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingFollowRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Date },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
