const { GoogleGenAI } = require('@google/genai');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const apiKey = process.env.GEMINI_API_KEY;

console.log(`[Gemini Client] Initialized with model: ${GEMINI_MODEL}`);
console.log(`[Gemini Client] API Key is: ${apiKey && apiKey !== 'your_key_here' ? 'set' : 'missing'}`);

if (!apiKey || apiKey === 'your_key_here') {
  console.error('\n❌ STARTUP ERROR: GEMINI_API_KEY is missing or not configured in environment variables.');
  console.error('Please set GEMINI_API_KEY in server/.env with your Google AI Studio API key.\n');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || 'dummy_key'
});

/**
 * Helper to check if an error from the SDK is a rate limit / 429 error.
 */
function isRateLimitError(error) {
  if (!error) return false;
  if (error.status === 429 || error.statusCode === 429) return true;
  const msg = String(error.message || error).toLowerCase();
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
}

/**
 * Helper to get a generic category for errors.
 */
function getErrorCategory(error) {
  if (isRateLimitError(error)) return 'rate_limit';
  const msg = String(error.message || error).toLowerCase();
  if (msg.includes('api key') || msg.includes('unauthenticated') || error.status === 401 || error.status === 403) return 'auth_error';
  if (msg.includes('not found') || msg.includes('is no longer available') || error.status === 404) return 'model_not_found';
  return 'unknown';
}

module.exports = {
  ai,
  GEMINI_MODEL,
  isRateLimitError,
  getErrorCategory
};
