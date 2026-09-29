const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  mediaUrl: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Story;