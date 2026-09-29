const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();

// Middleware - allow up to 25mb for photos
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/messages', require('./routes/messages'));

app.get('/', (req, res) => {
  res.send('VibeShare API is running...');
});

const PORT = process.env.PORT || 5000;

// Sync database and ensure columns can hold full-size images
sequelize
  .sync({ alter: true })
  .then(async () => {
    // Automatically alter column types directly in MySQL
    try {
      await sequelize.query('ALTER TABLE Stories MODIFY mediaUrl LONGTEXT NOT NULL;');
      await sequelize.query('ALTER TABLE Posts MODIFY imageUrl LONGTEXT NULL;');
      console.log('✅ Image columns converted to LONGTEXT');
    } catch (e) {
      console.log('Notice: Column alter checked/skipped:', e.message);
    }

    console.log('✅ MySQL Database & Tables Synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database sync failed:', err);
  });