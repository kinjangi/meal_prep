import React, { useState, useEffect } from 'react';
import AnalysisResultCard from './AnalysisResultCard';
import AgentStatusPanel from './AgentStatusPanel';
import { useAgentSteps } from '../utils/useAgentSteps';
import './VoiceFoodLogger.css';

const VOICE_STEP_LABELS = [
  'Parsing description',
  'Understanding food context',
  'Estimating portions',
  'Calculating macros',
];

const VOICE_THINKING_PHRASES = [
  'Interpreting your words…',
  'Identifying ingredients…',
  'Estimating serving size…',
  'Compiling nutritional data…',
];

export default function VoiceFoodLogger() {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [result, setResult]           = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  const { steps, startSteps, finishSteps, resetSteps, isRunning } =
    useAgentSteps(VOICE_STEP_LABELS, 1200);

  const activeIdx = steps.findIndex(s => s.status === 'active');
  const thinkingText = isRunning && activeIdx >= 0
    ? VOICE_THINKING_PHRASES[activeIdx] ?? VOICE_THINKING_PHRASES[VOICE_THINKING_PHRASES.length - 1]
    : undefined;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous    = true;
      recog.interimResults = true;
      recog.lang           = 'en-US';

      recog.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recog.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Microphone error: ${event.error}`);
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      if (transcript.trim().length > 0) analyzeText(transcript.trim());
    } else {
      setTranscript('');
      setError(null);
      setResult(null);
      resetSteps();
      recognition.start();
      setIsListening(true);
    }
  };

  const analyzeText = async (text) => {
    setLoading(true);
    startSteps();

    try {
      const response = await fetch('http://localhost:3001/api/analyze-food-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodDescription: text })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const err = new Error(errData.error || `Server error: ${response.status}`);
        err.errorType = errData.errorType;
        throw err;
      }

      const data = await response.json();
      finishSteps();
      setTimeout(() => setResult(data), 450);
    } catch (err) {
      finishSteps();
      console.error(err);
      const isConnectionError =
        err.name === 'TypeError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError');
      let uiMsg = err.message || 'Failed to analyze text. Please try again.';
      if (err.errorType === 'model_not_found') uiMsg = 'AI model not found (server needs update)';
      else if (err.errorType === 'rate_limit')  uiMsg = 'Rate limit reached, wait a minute';
      else if (err.errorType === 'auth_error')  uiMsg = 'API key problem';
      else if (err.errorType === 'unknown')     uiMsg = 'AI returned an unreadable response';
      setTimeout(() => setError(
        isConnectionError
          ? "Can't connect to AI server — is it running on port 3001?"
          : uiMsg
      ), 450);
    } finally {
      setLoading(false);
      setTranscript('');
    }
  };

  const handleReset = () => {
    setResult(null);
    setTranscript('');
    setError(null);
    resetSteps();
  };

  if (!speechSupported) {
    return (
      <div className="voice-logger-unsupported">
        <p>Voice input isn't supported in this browser, try Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className="voice-logger-container">
      {/* Mic button — hidden during agent run or when result showing */}
      {!result && !isRunning && (
        <div className="mic-container">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
          >
            {isListening ? (
              <svg width={32} height={32} fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width={32} height={32} fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 1v11m0 0a3 3 0 01-3-3V4a3 3 0 116 0v5a3 3 0 01-3 3zm0 0v5m-4 0h8" />
              </svg>
            )}
          </button>

          <p className="mic-status">
            {isListening ? 'Listening… Tap to stop' : 'Tap to speak your food'}
          </p>

          {transcript && (
            <div className="live-transcript">"{transcript}"</div>
          )}
        </div>
      )}

      {/* Agent step tracker */}
      {isRunning && (
        <AgentStatusPanel steps={steps} thinkingText={thinkingText} />
      )}

      {/* Error */}
      {error && !loading && !isRunning && (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={() => setError(null)}>Try Again</button>
        </div>
      )}

      <AnalysisResultCard result={result} onReset={handleReset} />
    </div>
  );
}
