"use client";

import { useEffect, useState } from "react";

const WARNING_THRESHOLD_SECONDS = 30;

function getSecondsRemaining(sessionExpiresAt: string, now: number): number {
  return Math.max(
    0,
    Math.floor((new Date(sessionExpiresAt).getTime() - now) / 1000),
  );
}

export function useSessionCountdown(sessionExpiresAt?: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!sessionExpiresAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessionExpiresAt]);

  if (!sessionExpiresAt) {
    return {
      secondsRemaining: null,
      shouldShowWarning: false,
      isExpired: false,
    };
  }

  const secondsRemaining = getSecondsRemaining(sessionExpiresAt, now);
  const shouldShowWarning =
    secondsRemaining <= WARNING_THRESHOLD_SECONDS && secondsRemaining > 0;
  const isExpired = secondsRemaining === 0;

  return {
    secondsRemaining,
    shouldShowWarning,
    isExpired,
  };
}
