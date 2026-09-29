const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Post, User, Comment, Like } = require('../models');

// ==========================================
// 1. GET ALL POSTS (FEED)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePic'] 
        },
        { 
          model: User, 
          as: 'likes', 
          attributes: ['id'] 
        },
      ],
    });
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. CREATE A NEW POST (CAPTION + IMAGE)
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Caption cannot be empty' });
    }

    const newPost = await Post.create({
      content: content.trim(),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
      userId: req.user.id,
    });

    const populatedPost = await Post.findByPk(newPost.id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePic'] 
        },
        { 
          model: User, 
          as: 'likes', 
          attributes: ['id'] 
        },
      ],
    });

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. DELETE A POST (AUTHOR ONLY + CASCADE CLEANUP)
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (parseInt(post.userId) !== parseInt(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated comments and likes first to avoid MySQL foreign key constraints
    await Comment.destroy({ where: { postId } });
    await Like.destroy({ where: { postId } });

    // Delete the post itself
    await post.destroy();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 4. LIKE / UNLIKE A POST
// ==========================================
router.put('/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ where: { postId, userId } });

    if (existingLike) {
      await existingLike.destroy();
    } else {
      await Like.create({ postId, userId });
    }

    const likesCount = await Like.count({ where: { postId } });
    res.status(200).json({ likesCount, isLiked: !existingLike });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. GET COMMENTS FOR A POST
// ==========================================
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { postId: req.params.id },
      order: [['createdAt', 'ASC']],
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePic'] 
        }
      ],
    });
    res.status(200).json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. ADD A COMMENT TO A POST
// ==========================================
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const newComment = await Comment.create({
      text: text.trim(),
      postId: req.params.id,
      userId: req.user.id,
    });

    const populatedComment = await Comment.findByPk(newComment.id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePic'] 
        }
      ],
    });

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;