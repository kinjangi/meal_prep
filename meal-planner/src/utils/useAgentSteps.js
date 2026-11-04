import { useState, useRef, useCallback } from 'react';

/**
 * useAgentSteps
 * -------------
 * Manages the step-tracker state for an agent loading sequence.
 *
 * @param {string[]} labels   Ordered list of step labels, e.g.
 *                            ["Reading image", "Identifying food", ...]
 * @param {number}   interval Milliseconds between auto-advancing steps (default 1400)
 *
 * Returns:
 *   steps          Array<{label, status}> — pass directly to <AgentStatusPanel>
 *   startSteps()   Call when the fetch begins.
 *   finishSteps()  Call when the fetch resolves (success or error).
 *                  Fast-forwards any remaining active/pending steps to "done".
 *   resetSteps()   Reset everything to "pending".
 *   isRunning      Boolean — true while steps are in progress
 */
export function useAgentSteps(labels, interval = 1400) {
  const initialSteps = labels.map(label => ({ label, status: 'pending' }));

  const [steps, setSteps] = useState(initialSteps);
  const [isRunning, setIsRunning] = useState(false);

  // We use refs to survive closures in setInterval
  const timerRef   = useRef(null);
  const currentRef = useRef(0);   // index of the currently "active" step
  const doneRef    = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startSteps = useCallback(() => {
    clearTimer();
    doneRef.current = false;
    currentRef.current = 0;
    setIsRunning(true);

    // Immediately activate step 0
    setSteps(labels.map((label, i) => ({
      label,
      status: i === 0 ? 'active' : 'pending'
    })));

    timerRef.current = setInterval(() => {
      currentRef.current += 1;
      const next = currentRef.current;

      if (next >= labels.length) {
        // All steps have been visited — stop ticking
        clearTimer();
        return;
      }

      if (doneRef.current) {
        // finishSteps was already called — stop
        clearTimer();
        return;
      }

      setSteps(prev => prev.map((s, i) => {
        if (i < next)  return { ...s, status: 'done' };
        if (i === next) return { ...s, status: 'active' };
        return s;
      }));
    }, interval);
  }, [labels, interval]);

  const finishSteps = useCallback(() => {
    doneRef.current = true;
    clearTimer();
    // Fast-forward everything to "done"
    setSteps(labels.map(label => ({ label, status: 'done' })));
    // Brief delay before clearing so the user sees the final "done" state
    setTimeout(() => setIsRunning(false), 600);
  }, [labels]);

  const resetSteps = useCallback(() => {
    doneRef.current = false;
    clearTimer();
    currentRef.current = 0;
    setIsRunning(false);
    setSteps(initialSteps);
  }, [initialSteps]);

  return { steps, startSteps, finishSteps, resetSteps, isRunning };
}
