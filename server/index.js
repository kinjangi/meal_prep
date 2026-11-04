require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Dynamic CORS configuration allowing any localhost port during development (e.g. 5173, 5174, etc.)
const localhostRegex = /^http:\/\/localhost:\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (localhostRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

// Parse JSON bodies (increased limit for base64 images)
app.use(express.json({ limit: '10mb' }));

// Routes
const analyzeFoodRoute = require('./routes/analyzeFood');
const analyzeFoodTextRoute = require('./routes/analyzeFoodText');
const generateAIPlanRoute = require('./routes/generateAIPlan');

app.use('/api/analyze-food', analyzeFoodRoute);
app.use('/api/analyze-food-text', analyzeFoodTextRoute);
app.use('/api/generate-ai-plan', generateAIPlanRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
  console.log(`CORS allowed origins: Any localhost port matching /^http:\\/\\/localhost:\\d+$/ (e.g. 5173, 5174, 5175, etc.)`);
});
