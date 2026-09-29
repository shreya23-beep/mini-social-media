const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User, Post, Follow } = require('../models');

// GET /api/users/:id - Profile details
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Post, as: 'posts', order: [['createdAt', 'DESC']] },
        { model: User, as: 'followers', attributes: ['id'] },
        { model: User, as: 'following', attributes: ['id'] },
      ],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/follow - Follow / Unfollow
router.put('/:id/follow', auth, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId = req.user.id;

    if (followingId === followerId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({ where: { followerId, followingId } });

    if (existingFollow) {
      await existingFollow.destroy();
    } else {
      await Follow.create({ followerId, followingId });
    }

    const followersCount = await Follow.count({ where: { followingId } });
    res.status(200).json({ isFollowing: !existingFollow, followersCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;