const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const newsRoutes = require('./routes/news');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/news', newsRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../Frontend/dist')));

// Serve index.html for React Router (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../Frontend/dist/index.html'));
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  console.error('Unexpected server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.get('/', (req, res) => {
  res.json({ message: 'Turtle-G backend is running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/turtleg';

// MongoDB connection with retry logic
const connectDB = async () => {
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✓ Connected to MongoDB');
      return;
    } catch (err) {
      retries++;
      if (retries < maxRetries) {
        console.log(`Retrying MongoDB connection (${retries}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('✗ MongoDB connection failed after retries');
        console.warn('Starting server without persistent database. Use local MongoDB for data persistence.');
        return;
      }
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
