const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-passwordHash')
    .populate('followers following friends', 'name email profilePicUrl')
    .lean();
  res.json(user);
});

router.get('/all', auth, async (req, res) => {
  const currentUser = await User.findById(req.user.id).select('following friends pendingFollowRequests').lean();
  const users = await User.find({ _id: { $ne: req.user.id } })
    .select('name bio location profilePicUrl followers following friends')
    .lean();

  const followingIds = (currentUser.following || []).map((id) => id.toString());
  const friendIds = (currentUser.friends || []).map((id) => id.toString());
  const pendingIds = (currentUser.pendingFollowRequests || []).map((id) => id.toString());
  const result = users.map((user) => {
    const id = user._id.toString();
    const isFriend = friendIds.includes(id);
    return {
      _id: user._id,
      name: user.name,
      bio: user.bio,
      location: user.location,
      profilePicUrl: user.profilePicUrl,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing: followingIds.includes(id) || isFriend,
      isFriend,
      requestPending: pendingIds.includes(id)
    };
  });

  res.json(result);
});

router.get('/requests', auth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('followRequests', 'name bio profilePicUrl')
    .lean();
  res.json(user.followRequests || []);
});

router.post('/follow/:id', auth, async (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ message: 'Cannot add yourself as a friend' });

  const user = await User.findById(req.user.id);
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (user.friends.some((id) => id.toString() === target._id.toString()) || target.friends.some((id) => id.toString() === user._id.toString())) {
    return res.status(400).json({ message: 'Already friends' });
  }
  if (user.pendingFollowRequests.some((id) => id.toString() === target._id.toString()) || target.followRequests.some((id) => id.toString() === user._id.toString())) {
    return res.status(200).json({ status: 'requested' });
  }

  target.followRequests.push(user._id);
  user.pendingFollowRequests.push(target._id);
  target.notifications.push({ message: `${user.name} sent you a friend request`, read: false });
  await user.save();
  await target.save();

  res.json({ status: 'requested' });
});

router.post('/requests/accept/:id', auth, async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const requester = await User.findById(req.params.id);
  if (!requester) return res.status(404).json({ message: 'User not found' });

  if (!currentUser.followRequests.some((id) => id.toString() === requester._id.toString())) {
    return res.status(400).json({ message: 'No pending friend request from this user' });
  }

  currentUser.followRequests = currentUser.followRequests.filter((id) => id.toString() !== requester._id.toString());
  requester.pendingFollowRequests = requester.pendingFollowRequests.filter((id) => id.toString() !== currentUser._id.toString());

  if (!currentUser.friends.includes(requester._id)) currentUser.friends.push(requester._id);
  if (!requester.friends.includes(currentUser._id)) requester.friends.push(currentUser._id);
  if (!currentUser.followers.includes(requester._id)) currentUser.followers.push(requester._id);
  if (!requester.following.includes(currentUser._id)) requester.following.push(currentUser._id);

  currentUser.notifications.push({ message: `${requester.name} is now your friend`, read: false });
  requester.notifications.push({ message: `${currentUser.name} accepted your friend request`, read: false });

  await currentUser.save();
  await requester.save();

  res.json({ success: true });
});

router.post('/requests/reject/:id', auth, async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const requester = await User.findById(req.params.id);
  if (!requester) return res.status(404).json({ message: 'User not found' });

  currentUser.followRequests = currentUser.followRequests.filter((id) => id.toString() !== requester._id.toString());
  requester.pendingFollowRequests = requester.pendingFollowRequests.filter((id) => id.toString() !== currentUser._id.toString());

  requester.notifications.push({ message: `${currentUser.name} declined your follow request`, read: false });

  await currentUser.save();
  await requester.save();

  res.json({ success: true });
});

router.patch('/me', auth, async (req, res) => {
  const updates = ['name', 'bio', 'profilePicUrl', 'birthday', 'age', 'location', 'questions'];
  const payload = {};
  updates.forEach(field => {
    if (req.body[field] !== undefined) payload[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, payload, { new: true }).select('-passwordHash');
  res.json(user);
});

router.get('/following', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('following', 'name profilePicUrl').lean();
  res.json(user.following);
});

router.get('/followers', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('followers', 'name profilePicUrl').lean();
  res.json(user.followers);
});

router.get('/friends', auth, async (req, res) => {
  const user = await User.findById(req.user.id).populate('friends', 'name bio profilePicUrl location lastActive').lean();
  res.json(user.friends || []);
});

router.get('/contacts', auth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('following', 'name profilePicUrl lastActive')
    .populate('followers', 'name profilePicUrl lastActive')
    .lean();

  const unique = new Map();
  const allContacts = [...(user.followers || []), ...(user.following || [])];
  allContacts.forEach((item) => {
    const id = item._id.toString();
    if (!unique.has(id)) {
      const lastActive = item.lastActive ? new Date(item.lastActive) : null;
      const online = lastActive ? (Date.now() - lastActive.getTime() < 2 * 60 * 1000) : false;
      unique.set(id, {
        _id: item._id,
        name: item.name,
        profilePicUrl: item.profilePicUrl,
        online,
        lastActive
      });
    }
  });

  res.json(Array.from(unique.values()));
});

router.get('/notifications', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('notifications').lean();
  const notifications = (user.notifications || []).sort((a, b) => b.createdAt - a.createdAt);
  res.json(notifications);
});

router.post('/notifications/read-all', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.notifications = user.notifications.map((item) => ({ ...item.toObject(), read: true }));
  await user.save();
  res.json({ success: true });
});

router.post('/unfollow/:id', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found' });

  user.following = user.following.filter(id => id.toString() !== req.params.id);
  target.followers = target.followers.filter(id => id.toString() !== req.user.id);
  user.friends = user.friends.filter(id => id.toString() !== req.params.id);
  target.friends = target.friends.filter(id => id.toString() !== req.user.id);

  await user.save();
  await target.save();

  res.json({ following: user.following, followers: target.followers, friends: user.friends });
});

module.exports = router;
