"use client";

import { useEffect, useState, useRef } from 'react';

interface ClientAnimatedNumberProps {
  to: number;
  duration?: number;
  className?: string; // Allow passing className
}

export function ClientAnimatedNumber({ to, duration = 1, className }: ClientAnimatedNumberProps) {
  const [currentNumber, setCurrentNumber] = useState(0);
  const initialValue = useRef(0); // Store the initial value when the component mounts or 'to' changes significantly
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Start animation from 0 or the previous 'to' value if needed
    // For simplicity, let's restart from 0 each time 'to' changes, unless 'to' is 0
    const start = 0; // Or potentially track previous 'to' value
    initialValue.current = start;
    setCurrentNumber(start);

    if (to === start) return; // No animation needed if target is the start value

    const startTime = performance.now();
    const animationDuration = duration * 1000; // Convert seconds to ms

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      // Simple linear interpolation
      const value = Math.floor(start + (to - start) * progress);
      setCurrentNumber(value);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentNumber(to); // Ensure it ends exactly at 'to' value
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    // Cleanup function to cancel animation frame if component unmounts or 'to' changes
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [to, duration]); // Rerun effect if 'to' or 'duration' changes

  // Format with commas
  const formattedNumber = currentNumber.toLocaleString();

  return <span className={className}>{formattedNumber}</span>;
}
