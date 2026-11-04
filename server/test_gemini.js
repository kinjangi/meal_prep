require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const https = require('https');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = 'gemini-3.8-flash'; // Let's use the one we set, or gemini-2.0-flash if 3.8 doesn't exist! Wait, the prompt says they were told models/gemini-2.0-flash is no longer available and to update to gemini-3.8-flash, which means they are interacting with the mocked environment or Google's API returned that exact string. Let's just use the current model from geminiClient.
// Actually, let's just use what they asked us to use earlier: 'gemini-3.8-flash'.

async function runTest() {
  console.log('--- TEST 1: Plain Text ---');
  try {
    const resText = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Say hello'
    });
    console.log('Text Response:', resText.text);
  } catch (e) {
    console.log('Text Error Status:', e.status || e.statusCode);
    console.log('Text Error Message:', e.message);
  }

  console.log('\n--- TEST 2: Image ---');
  const imgPath = './test_pixel.jpg';


  try {
    const fileBuffer = fs.readFileSync(imgPath);
    const base64Image = fileBuffer.toString('base64');
    // Ensure no prefix
    console.log('Base64 starts with:', base64Image.substring(0, 20));
    
    const resImg = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        },
        { text: 'What is in this image?' }
      ]
    });
    console.log('Image Response:', resImg.text);
  } catch (e) {
    console.log('Image Error Status:', e.status || e.statusCode);
    console.log('Image Error Message:', e.message);
  }
}

runTest();
