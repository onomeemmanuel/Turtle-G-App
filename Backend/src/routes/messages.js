const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { to, content } = req.body;
  if (!to || !content) {
    return res.status(400).json({ message: 'Message recipient and content are required' });
  }

  const sender = await User.findById(req.user.id).select('name following followers');
  const recipient = await User.findById(to).select('following followers');
  if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

  const canMessage = sender.following.includes(to) || sender.followers.includes(to);
  if (!canMessage) {
    return res.status(403).json({ message: 'You can only message users with a follower connection' });
  }

  const message = await Message.create({ from: req.user.id, to, content });
  recipient.notifications.push({
    message: `${sender.name} sent you a message`,
    read: false,
    createdAt: new Date()
  });
  await recipient.save();
  res.json(message);
});

router.get('/unread-count', auth, async (req, res) => {
  const count = await Message.countDocuments({ to: req.user.id, seen: false });
  res.json({ count });
});

router.get('/:userId', auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { from: req.user.id, to: req.params.userId },
      { from: req.params.userId, to: req.user.id }
    ]
  }).sort({ createdAt: 1 });

  const shouldMarkRead = req.query.markRead !== 'false';
  if (shouldMarkRead) {
    await Message.updateMany(
      { from: req.params.userId, to: req.user.id, seen: false },
      { seen: true, seenAt: new Date() }
    );
  }

  res.json(messages);
});

router.post('/mark-read/:userId', auth, async (req, res) => {
  await Message.updateMany(
    { from: req.params.userId, to: req.user.id, seen: false },
    { seen: true, seenAt: new Date() }
  );
  res.json({ message: 'Messages marked as read' });
});

module.exports = router;
