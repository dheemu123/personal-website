"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseWheelStepperOptions {
  /** Total number of items */
  itemCount: number;
  /** Current active index */
  activeIndex: number;
  /** Callback when index should change */
  onIndexChange: (newIndex: number, direction: 1 | -1) => void;
  /** Ref to the element that captures wheel events */
  containerRef: React.RefObject<HTMLElement>;
  /** Animation duration in ms - lockout window */
  lockoutDuration?: number;
  /** Delta threshold to trigger a step (normalizes trackpad vs mouse wheel) */
  deltaThreshold?: number;
  /** Whether the stepper is enabled */
  enabled?: boolean;
}

export function useWheelStepper({
  itemCount,
  activeIndex,
  onIndexChange,
  containerRef,
  lockoutDuration = 600,
  deltaThreshold = 50,
  enabled = true,
}: UseWheelStepperOptions) {
  const lockedRef = useRef(false);
  const accumulatorRef = useRef(0);
  const lastWheelTime = useRef(0);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!enabled) return;

      const now = Date.now();
      
      // Reset accumulator if there's been a pause in scrolling
      if (now - lastWheelTime.current > 150) {
        accumulatorRef.current = 0;
      }
      lastWheelTime.current = now;

      // Determine scroll direction
      const delta = e.deltaY;
      const isScrollingDown = delta > 0;
      const isScrollingUp = delta < 0;

      // At boundaries, allow normal page scroll
      const atStart = activeIndex === 0;
      const atEnd = activeIndex === itemCount - 1;

      if (atStart && isScrollingUp) {
        // Allow scrolling up past the section
        return;
      }
      if (atEnd && isScrollingDown) {
        // Allow scrolling down past the section
        return;
      }

      // Prevent default scroll while we're handling it
      e.preventDefault();

      // If locked, ignore further wheel events
      if (lockedRef.current) {
        return;
      }

      // Accumulate delta
      accumulatorRef.current += delta;

      // Check if we've crossed the threshold
      if (Math.abs(accumulatorRef.current) >= deltaThreshold) {
        const direction = accumulatorRef.current > 0 ? 1 : -1;
        const nextIndex = activeIndex + direction;

        // Clamp to valid range
        if (nextIndex >= 0 && nextIndex < itemCount) {
          // Lock to prevent rapid firing
          lockedRef.current = true;
          
          // Reset accumulator
          accumulatorRef.current = 0;

          // Trigger the change
          onIndexChange(nextIndex, direction as 1 | -1);

          // Unlock after animation duration
          setTimeout(() => {
            lockedRef.current = false;
          }, lockoutDuration);
        }
      }
    },
    [activeIndex, itemCount, onIndexChange, deltaThreshold, lockoutDuration, enabled]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    // Must use non-passive to allow preventDefault
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, handleWheel, enabled]);

  // Keyboard support
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockedRef.current) return;

      let direction: 1 | -1 | null = null;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        direction = 1;
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        direction = -1;
      }

      if (direction !== null) {
        const nextIndex = activeIndex + direction;
        if (nextIndex >= 0 && nextIndex < itemCount) {
          e.preventDefault();
          lockedRef.current = true;
          onIndexChange(nextIndex, direction);
          setTimeout(() => {
            lockedRef.current = false;
          }, lockoutDuration);
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, activeIndex, itemCount, onIndexChange, lockoutDuration, enabled]);

  return {
    isLocked: lockedRef.current,
  };
}
