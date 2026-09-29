const sequelize = require('../db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Story = require('./Story');
const Message = require('./Message');

// Post & User associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Comments associations
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Likes
const Like = sequelize.define('Like', {}, { timestamps: false });
User.belongsToMany(Post, { through: Like, as: 'likedPosts', foreignKey: 'userId' });
Post.belongsToMany(User, { through: Like, as: 'likes', foreignKey: 'postId' });

// Followers
const Follow = sequelize.define('Follow', {}, { timestamps: false });
User.belongsToMany(User, { through: Follow, as: 'followers', foreignKey: 'followingId' });
User.belongsToMany(User, { through: Follow, as: 'following', foreignKey: 'followerId' });

// Stories associations
User.hasMany(Story, { foreignKey: 'userId', as: 'stories', onDelete: 'CASCADE' });
Story.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Direct Messages associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Follow,
  Story,
  Message,
};