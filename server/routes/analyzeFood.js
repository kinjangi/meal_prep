const express = require('express');
const router = express.Router();
const { ai, GEMINI_MODEL, isRateLimitError, getErrorCategory } = require('../geminiClient');

router.post('/', async (req, res) => {
  try {
    const { image, mediaType } = req.body;
    
    if (!image || !mediaType) {
      return res.status(400).json({ error: 'Missing image or mediaType in request body.' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const systemPrompt = `You are an expert nutrition and computer vision food recognition AI.
First, determine if the provided image actually depicts a real, edible food item.

1. If the image does NOT depict real food (e.g. it is a person, a selfie, an object, an animal, a room or wall, text/document, something unclear, or you are not reasonably confident it is food), respond with EXACTLY this JSON structure:
{
  "isFood": false,
  "message": "<a brief, friendly explanation of what you saw instead and why it's not recognized as food>"
}

2. If the image IS food, identify the food item(s) and estimate the nutrition for the portion shown. Respond with EXACTLY this JSON structure:
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
        {
          inlineData: {
            data: image,
            mimeType: mediaType,
          },
        },
        { text: 'Please analyze this image, determine if it is food, and provide the JSON response.' }
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
        message: parsedResult.message || "This doesn't appear to be edible food. Please try uploading an image of food."
      });
    }

    // Handle isFood: true
    res.json({
      isFood: true,
      name: parsedResult.name || 'Identified Food',
      calories: Math.round(Number(parsedResult.calories) || 0),
      protein: Math.round((Number(parsedResult.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(parsedResult.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(parsedResult.fat) || 0) * 10) / 10,
      unit: parsedResult.unit || '1 serving',
      confidence: ['high', 'medium', 'low'].includes(parsedResult.confidence) ? parsedResult.confidence : 'medium'
    });
  } catch (error) {
    console.error('Error analyzing food:');
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
