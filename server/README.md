# Meal Planner Backend Server

This is the backend server for the Meal Planner application. It acts as a proxy to securely communicate with the Google Gemini API without exposing API keys in the frontend.

## Setup Instructions

1. **Install dependencies**
   Make sure you are in the `server` directory, then run:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Then, open `.env` and replace `your_key_here` with your actual Google AI Studio API key (free tier supported).

3. **Start the Server**
   Start the development server using:
   ```bash
   npm run dev
   ```
   This uses Node's built-in `--watch` flag to automatically restart the server when files change.

The server will start on port `3001` (by default). You can verify it's running by visiting [http://localhost:3001/api/health](http://localhost:3001/api/health) in your browser.
