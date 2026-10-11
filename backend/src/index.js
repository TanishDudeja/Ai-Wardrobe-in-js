const express = require('express');
const dotenv = require('dotenv');
// Load env vars
dotenv.config({ path: './.env' });

const cors = require('cors');
const connectDB = require('./config/db');
const wardrobeRoutes = require('./routes/wardrobeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message || err });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
