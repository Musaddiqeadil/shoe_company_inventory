"use client";

import { useRef, useState } from "react";

export const TAPS_NEEDED = 7;
const SHOW_FOR_MS = 5000;
// Taps further apart than this start the count again, so ordinary stray taps
// never add up to the secret.
const TAP_GAP_MS = 1500;

// Money the sales boy shouldn't see — purchase price, profit — is kept off the
// page entirely and only fetched once someone taps seven times in a row. It
// shows for five seconds and hides itself again.
//
// `load` runs on the seventh tap; whatever it returns is what gets shown.
export function useSecretReveal<T>(load: () => Promise<T>) {
  const [revealed, setRevealed] = useState<T | null>(null);
  const taps = useRef(0);
  const lastTap = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopCountdown() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function startCountdown() {
    stopCountdown();
    timer.current = setTimeout(() => setRevealed(null), SHOW_FOR_MS);
  }

  async function tap() {
    const now = Date.now();
    taps.current = now - lastTap.current > TAP_GAP_MS ? 1 : taps.current + 1;
    lastTap.current = now;

    if (taps.current < TAPS_NEEDED) return;
    taps.current = 0;

    const value = await load();
    setRevealed(value);
    startCountdown();
  }

  // Filling in a form takes longer than five seconds. `hold` keeps what is on
  // screen there while that happens; `release` hands the countdown back, with
  // an updated value if the form changed something.
  function hold() {
    stopCountdown();
  }

  function release(value?: T) {
    if (value !== undefined) setRevealed(value);
    startCountdown();
  }

  return { revealed, tap, hold, release };
}
