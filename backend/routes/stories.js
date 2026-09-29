const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const { Story, User } = require('../models');

// GET /api/stories - Fetch all active stories (expiresAt > now)
router.get('/', async (req, res) => {
  try {
    const stories = await Story.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePic'],
        },
      ],
    });
    res.status(200).json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stories - Create new 24-hour story
router.post('/', auth, async (req, res) => {
  try {
    const { mediaUrl } = req.body;
    if (!mediaUrl) {
      return res.status(400).json({ message: 'Story image is required' });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newStory = await Story.create({
      mediaUrl,
      expiresAt,
      userId: req.user.id,
    });

    const populatedStory = await Story.findByPk(newStory.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePic'],
        },
      ],
    });

    res.status(201).json(populatedStory);
  } catch (err) {
    console.error('Error creating story:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stories/:id - Delete own story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check ownership
    if (parseInt(story.userId) !== parseInt(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    await story.destroy();
    res.status(200).json({ message: 'Story deleted successfully' });
  } catch (err) {
    console.error('Error deleting story:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;