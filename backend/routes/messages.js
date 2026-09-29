const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const { Message, User } = require('../models');

// GET user list to chat
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { id: { [Op.ne]: req.user.id } },
      attributes: ['id', 'username', 'profilePic'],
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET chat messages between current user and selected user
router.get('/:userId', auth, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    const myId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      order: [['createdAt', 'ASC']],
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Receiver and text are required' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;