const express = require('express');
const router = express.Router();
const { ai, GEMINI_MODEL, isRateLimitError, getErrorCategory } = require('../geminiClient');

router.post('/', async (req, res) => {
  try {
    const { foodDescription } = req.body;
    
    if (!foodDescription || foodDescription.trim() === '') {
      return res.status(400).json({ error: 'Missing foodDescription in request body.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

const systemPrompt = `You are a nutrition expert.
First, determine if the described input actually refers to a real, edible food item. Short inputs or single words like "brinjal", "dal", "apple", or "rice" ARE valid food items. If a single word or short name is provided, assume a typical serving size (e.g. "1 cup cooked" or "1 medium").

1. If the description does NOT depict real food (e.g. it is a person, an object, an animal, homework, gibberish/nonsense like "asdf", random non-food words, or you are not reasonably confident it's food), respond with EXACTLY this JSON structure:
{
  "isFood": false,
  "message": "<a brief, friendly explanation of what you understood instead and why it's not recognized as food>"
}

2. If the description IS food, estimate the name, calories, protein (g), carbs (g), fat (g), and typical serving size/unit. Respond with EXACTLY this JSON structure:
{
  "isFood": true,
  "name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "unit": "string",
  "confidence": "high" | "medium" | "low"
}

Respond ONLY with a raw JSON object, without markdown code fences or conversational text.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: `Food description: ${foodDescription}\nPlease determine if this is food, and provide the JSON response.` }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    let jsonStr = (response.text || '').trim();
    
    // Strip markdown code fences if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    
    // Extract substring between first { and last }
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', jsonStr);
      return res.status(500).json({ error: 'Failed to parse the AI response as JSON.' });
    }

    // Handle isFood: false
    if (parsedResult.isFood === false) {
      return res.json({
        isFood: false,
        message: parsedResult.message || "This description does not appear to refer to edible food. Please try describing a food item."
      });
    }

    // Handle isFood: true
    res.json({
      isFood: true,
      name: parsedResult.name || foodDescription,
      calories: Math.round(Number(parsedResult.calories) || 0),
      protein: Math.round((Number(parsedResult.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(parsedResult.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(parsedResult.fat) || 0) * 10) / 10,
      unit: parsedResult.unit || '1 serving',
      confidence: ['high', 'medium', 'low'].includes(parsedResult.confidence) ? parsedResult.confidence : 'medium'
    });
  } catch (error) {
    console.error('Error analyzing food text:');
    console.error('Status:', error.status || error.statusCode || 'N/A');
    console.error('Message:', error.message || error);
    console.error('Raw response:', error.response?.text || error.response?.data || 'N/A');
    
    const errorType = getErrorCategory(error);

    if (errorType === 'rate_limit') {
      return res.status(429).json({ error: "AI rate limit reached, please wait a minute and try again", errorType });
    }
    res.status(500).json({ error: 'The AI service returned an error. Please try again.', errorType });
  }
});

module.exports = router;
