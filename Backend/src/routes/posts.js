const express = require('express');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

router.get('/feed', auth, async (req, res) => {
  const currentUser = await User.findById(req.user.id).select('following friends').lean();
  const following = (currentUser.following || []).map((id) => id.toString());
  const friends = (currentUser.friends || []).map((id) => id.toString());
  const visibleAuthors = Array.from(new Set([req.user.id, ...following, ...friends]));

  const posts = await Post.find({
    author: { $in: visibleAuthors },
    type: { $in: ['post', 'reel', 'market'] }
  })
    .sort({ createdAt: -1 })
    .populate('author', 'name profilePicUrl')
    .populate({ path: 'comments.author', select: 'name profilePicUrl' })
    .lean();
  res.json(posts);
});

router.get('/stories', auth, async (req, res) => {
  const currentUser = await User.findById(req.user.id).select('following').lean();
  const following = currentUser.following || [];
  const stories = await Post.find({
    author: { $in: [req.user.id, ...following] },
    type: 'story',
    expiresAt: { $gt: new Date() }
  })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatarUrl')
    .populate({ path: 'comments.author', select: 'name profilePicUrl' })
    .lean();
  res.json(stories);
});

router.get('/user', auth, async (req, res) => {
  const posts = await Post.find({ author: req.user.id })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatarUrl')
    .populate({ path: 'comments.author', select: 'name profilePicUrl' })
    .lean();
  res.json(posts);
});

router.patch('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

  const { caption, marketCategory } = req.body;
  if (caption != null) post.caption = caption;
  if (marketCategory != null) post.marketCategory = marketCategory;

  await post.save();
  res.json(post);
});

router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

  await post.deleteOne();
  res.json({ message: 'Post deleted' });
});

router.post('/', auth, async (req, res) => {
  const { caption, mediaUrls, type, marketCategory, marketFeePaid, paymentReference } = req.body;
  if (type === 'market') {
    if (!marketFeePaid) {
      return res.status(400).json({ message: 'You must pay ₦2,000 to 7032087886 before posting in the marketplace.' });
    }
    if (!paymentReference || !paymentReference.trim()) {
      return res.status(400).json({ message: 'Marketplace posts require a valid payment reference for the fee.' });
    }
    if (!marketCategory) {
      return res.status(400).json({ message: 'Marketplace posts need a category such as Phone, Books, or Supplies.' });
    }
  }
  const post = await Post.create({
    author: req.user.id,
    caption,
    mediaUrls,
    type,
    marketCategory: marketCategory || 'General',
    marketFeePaid: Boolean(marketFeePaid),
    paymentReference: paymentReference || '',
    expiresAt: type === 'story' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
  });
  await User.findByIdAndUpdate(req.user.id, { $inc: { crownCount: 2 } });
  res.json(post);
});

router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const alreadyLiked = post.likes.includes(req.user.id);
  if (alreadyLiked) {
    post.likes = post.likes.filter(id => id.toString() !== req.user.id);
  } else {
    post.likes.push(req.user.id);
  }
  await post.save();
  res.json(post);
});

router.post('/:id/share', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const alreadyShared = post.shares.includes(req.user.id);
  if (alreadyShared) {
    post.shares = post.shares.filter(id => id.toString() !== req.user.id);
  } else {
    post.shares.push(req.user.id);
    if (post.author.toString() !== req.user.id) {
      const sharer = await User.findById(req.user.id).select('name');
      const author = await User.findById(post.author);
      if (author && sharer) {
        author.notifications.push({
          message: `${sharer.name} shared your post`,
          read: false,
          createdAt: new Date()
        });
        await author.save();
      }
    }
  }

  await post.save();
  res.json(post);
});

router.post('/:id/comment', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.comments.push({ author: req.user.id, text: req.body.text });
  await post.save();
  await User.findByIdAndUpdate(req.user.id, { $inc: { crownCount: 1 } });
  await post.populate({ path: 'comments.author', select: 'name profilePicUrl' });
  res.json(post);
});

router.get('/marketplace', auth, async (req, res) => {
  const items = await Post.find({ type: 'market' })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatarUrl')
    .populate({ path: 'comments.author', select: 'name profilePicUrl' });
  res.json(items);
});

router.get('/reels', auth, async (req, res) => {
  const reels = await Post.find({ type: 'reel' })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatarUrl')
    .populate({ path: 'comments.author', select: 'name profilePicUrl' });
  res.json(reels);
});

module.exports = router;
