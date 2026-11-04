import React, { useState, useRef } from 'react';
import { usePreferences } from '../state/PreferencesContext';
import AnalysisResultCard from './AnalysisResultCard';
import AgentStatusPanel from './AgentStatusPanel';
import { useAgentSteps } from '../utils/useAgentSteps';
import './FoodPhotoAnalyzer.css';

const PHOTO_STEP_LABELS = [
  'Reading image',
  'Identifying food',
  'Calculating macros',
  'Preparing result',
];

const THINKING_PHRASES = [
  'Scanning pixel patterns…',
  'Cross-referencing food database…',
  'Estimating portion size…',
  'Finalising nutritional values…',
];

export default function FoodPhotoAnalyzer() {
  const { preferences, updatePreferences } = usePreferences();
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [result, setResult]       = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  const { steps, startSteps, finishSteps, resetSteps, isRunning } =
    useAgentSteps(PHOTO_STEP_LABELS, 1300);

  // Which thinking phrase to show — tied to the active step index
  const activeIdx = steps.findIndex(s => s.status === 'active');
  const thinkingText = isRunning && activeIdx >= 0
    ? THINKING_PHRASES[activeIdx] ?? THINKING_PHRASES[THINKING_PHRASES.length - 1]
    : undefined;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setResult(null);
    resetSteps();

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      analyzeImage(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image, mediaType) => {
    setLoading(true);
    startSteps();          // ← kick off the step animation

    try {
      const response = await fetch('http://localhost:3001/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, mediaType })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const err = new Error(errData.error || `Server error: ${response.status}`);
        err.errorType = errData.errorType;
        throw err;
      }

      const data = await response.json();
      finishSteps();       // ← fast-forward remaining steps to done
      // Brief pause so user sees the final "done" state before result appears
      setTimeout(() => setResult(data), 450);
    } catch (err) {
      finishSteps();
      console.error(err);
      const isConnectionError =
        err.name === 'TypeError' ||
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError');
      let uiMsg = err.message || 'Failed to analyze image. Please try again.';
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
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setPreviewUrl(null);
    resetSteps();
  };

  const handleRetry = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="food-analyzer-card">
      <div className="analyzer-header">
        <h3>
          <svg width={22} height={22} fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          AI Food Analyzer
        </h3>
        <p>Snap a photo of your food to instantly identify macros.</p>
      </div>

      {/* Upload / preview area — always visible */}
      <div
        className={`upload-area ${loading ? 'upload-area--loading' : ''}`}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Food preview" className="preview-image" />
        ) : (
          <div className="upload-placeholder">
            <svg width={46} height={46} fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Tap to take a photo or upload</span>
          </div>
        )}
      </div>

      {/* Agent step tracker — replaces the plain spinner */}
      {isRunning && (
        <AgentStatusPanel steps={steps} thinkingText={thinkingText} />
      )}

      {/* Error state */}
      {error && !loading && !isRunning && (
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRetry}>Try Again</button>
        </div>
      )}

      {/* Result card */}
      <AnalysisResultCard result={result} onReset={handleReset} />
    </div>
  );
}
