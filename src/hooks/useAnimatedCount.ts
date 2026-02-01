import { useState, useEffect, useRef } from "react";

/**
 * Animates a number from 0 (or previous value) to the target value.
 */
export function useAnimatedCount(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + diff * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
        prevTarget.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
