import React, { useState, useEffect } from 'react';

export default function HackathonTimer({ endTime, timerStatus }) {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  useEffect(() => {
    // If timer is not set or stopped
    if (!endTime || timerStatus === 'stopped') {
      setTimeLeft("00:00:00");
      return;
    }

    const calculateTime = () => {
      // If paused, we don't recalculate the countdown
      if (timerStatus === 'paused') return;

      const destination = new Date(endTime).getTime();
      const now = new Date().getTime();
      const difference = destination - now;

      if (difference <= 0) {
        setTimeLeft("TIME IS UP!");
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const h = hours.toString().padStart(2, '0');
      const m = minutes.toString().padStart(2, '0');
      const s = seconds.toString().padStart(2, '0');

      setTimeLeft(`${h}:${m}:${s}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [endTime, timerStatus]);

  return (
  <>
    <div style={timerText} className="hackathon-timer">
      {timeLeft}
    </div>

    <style>{`
      /* ---------- TIMER ANIMATION ---------- */
      .hackathon-timer {
        transition: transform 0.3s ease, color 0.3s ease, text-shadow 0.3s ease;
        animation: timerPulse 1s infinite alternate;
        cursor: default;
      }

      .hackathon-timer:hover {
        transform: scale(1.08);
        color: #3ecf8e;
        text-shadow: 0 0 18px rgba(62,207,142,0.6);
      }

      @keyframes timerPulse {
        from {
          opacity: 0.85;
        }
        to {
          opacity: 1;
        }
      }
    `}</style>
  </>
);

}

const timerText = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '2rem',
  fontWeight: '800',
  color: '#12668dff',
  letterSpacing: '1px'
};