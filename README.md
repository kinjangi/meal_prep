# Personalized Meal Prep & AI Nutrition Platform

A full-stack, AI-powered meal planning and nutrition platform featuring agentic Gemini meal planning, computer-vision food recognition, voice-driven food logging, dynamic grocery list aggregation, and an interactive analytics suite.

---

## Architecture Overview

The application is structured into two dedicated services:

```
meal_prep/
├── meal-planner/         # Frontend: React 18 + Vite + React Router + Recharts
│   ├── src/
│   │   ├── components/   # Reusable UI widgets (Analyzer, Voice, Meal Plan, Grocery, etc.)
│   │   ├── data/         # Recipe, ingredient, and user preference models
│   │   ├── layouts/      # App shell sidebar and top navigation layout
│   │   ├── pages/        # Dashboard, Preferences, Meal Plan, Grocery List, Analytics
│   │   ├── state/        # PreferencesContext for global state management
│   │   └── utils/        # Heuristic generators, macro math, and grocery aggregators
│   └── package.json
│
└── server/               # Backend: Node.js + Express + Google Gen AI SDK
    ├── routes/           # Endpoints for food image analysis, voice text, and AI planning
    ├── geminiClient.js   # Configured Google Gemini API client
    ├── index.js          # Express server with CORS & JSON body parsing
    ├── .env.example      # Environment variable template
    └── package.json
```

---

## Features

1. **Dashboard Overview**
   - Quick statistics: Daily caloric target, days planned, active restrictions, and items to purchase.
   - Tabbed quick logging interface allowing immediate photo analysis or voice dictation.

2. **Agentic AI Meal Planning (`gemini-3.8-flash`)**
   - **✨ AI Smart Plan**: Prompts Gemini with verified recipe libraries, user dietary restrictions, calorie targets, and pantry inventory to build a balanced 7-day schedule.
   - **Strategic Explanation**: Renders an **🤖 AI Strategy** callout box above the weekly schedule explaining Gemini's meal distribution rationale.
   - **⚡ Quick Generate**: Instant local heuristic generation sampling best-fit meals.
   - **Resilient Fallback**: Automatically falls back to local generation if the backend or AI provider is temporarily unavailable.

3. **AI Food Photo Recognition**
   - Upload or snap a picture of any meal.
   - Gemini analyzes the image and returns estimated calories, protein, carbs, fat, serving unit, and confidence rating.
   - One-click button to save the analyzed item directly into your personal pantry ingredients.

4. **Voice Food Logging**
   - Dictate what you ate using the browser's native Web Speech API.
   - Gemini interprets informal text descriptions (e.g. *"grilled chicken bowl with brown rice and broccoli"*) and computes nutritional values.

5. **Nutrition & Prep Analytics**
   - **Weekly Calorie Trend (Line Chart)**: Tracks planned daily totals against the user's calorie goal.
   - **Weekly Macro Breakdown (Stacked Bar Chart)**: Visualizes daily distribution of protein, carbs, and fat in grams.
   - **Average Macro Split (Donut Charts)**: Side-by-side comparison of user target macro goals vs. actual plan percentage contribution.
   - **Grocery Needs by Category (Horizontal Bar Chart)**: Visualizes pending grocery items needed per food category.
   - **Active Dietary Restrictions**: Summary display showing all active dietary rules.

6. **Unified Grocery List**
   - Automatically aggregates ingredients across all 28 weekly meals into categorized, alphabetized shopping lists.
   - **"What to Buy" Toggle**: Automatically excludes ingredients currently available in your pantry.

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Google Gemini API Key** (for AI features, free tier supported)

---

### 2. Configure Backend Environment
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Create your `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
3. Open `.env` and add your valid Google Gemini API key:
   ```env
   GEMINI_API_KEY=AIzaSy...
   PORT=3001
   ```

---

### 3. Running the Application (Two Terminals)

#### Terminal 1 — Start the Backend Server:
```bash
cd server
npm install
npm run dev
```
*The server will start on `http://localhost:3001`.*

#### Terminal 2 — Start the Frontend Dev Server:
```bash
cd meal-planner
npm install
npm run dev
```
*The Vite frontend will launch on `http://localhost:5173`.*

---

## Verification & End-to-End Testing

1. **Quick Plan & Analytics**:
   - Go to **Preferences**, select your calorie goal and macros, and click **Save Preferences**.
   - Navigate to **Meal Plan** and click **⚡ Quick Generate**.
   - Click **Analytics** to view the updated calorie trend, stacked macro bars, and grocery distribution.
2. **AI Smart Plan**:
   - On the **Meal Plan** page, click **✨ AI Smart Plan**.
   - Observe the planning indicator and the resulting **🤖 AI Strategy** callout box explaining Gemini's decisions.
   - Navigate to **Analytics** to see the plan mode update to `✨ AI Optimized`.
3. **Food Photo Analysis**:
   - Go to the **Dashboard**, select **📷 Take a Photo**, and upload a meal image.
   - Review estimated macros and click **Add to My Ingredients**.
   - Go to **Preferences** and verify the item appears in your pantry list.
4. **Voice Food Logging**:
   - On the **Dashboard**, switch to **🎤 Speak Name**, click the microphone, and dictate an item (e.g. *"Greek yogurt with honey and almonds"*).
   - Review the AI card and click **Add to My Ingredients**.
5. **Grocery List Synchronization**:
   - Go to **Grocery List** and toggle between **Full Recipe Needs** and **What to Buy** to verify pantry ingredient exclusions.

---

## Known Limitations

- **API Key & Network Dependency**: AI photo recognition, voice estimation, and AI Smart Plan generation require an active internet connection and a configured `GEMINI_API_KEY`. If unavailable, the system automatically falls back to local generation.
- **Voice Recognition Browser Support**: Voice logging utilizes the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), which is natively supported in Chrome, Edge, and Safari, but may have limited support in Firefox.
