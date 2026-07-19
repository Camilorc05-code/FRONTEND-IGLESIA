import { useState, useEffect, useRef, useCallback } from 'react';

function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false;
  const lowCPU = (navigator.hardwareConcurrency || 4) <= 2;
  const saveData = navigator.connection?.saveData === true;
  return lowCPU || saveData;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => prefersReducedMotion() || isLowEndDevice());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches || isLowEndDevice());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export function useLazyLoad(ref, options = {}) {
  const { threshold = 0.1, rootMargin = '100px' } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible) setHasBeenVisible(true);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return { isVisible, hasBeenVisible };
}

export function optimizeForLowEnd() {
  if (typeof window === 'undefined') return;
  if (!isLowEndDevice()) return;

  const style = document.createElement('style');
  style.setAttribute('data-perf-opt', 'low-end');
  style.textContent = `
    [style*="will-change: transform"],
    [style*="will-change:translate"] {
      will-change: auto !important;
    }
  `;
  document.head.appendChild(style);

  if (window.__FRAMER_MOTION__) {
    const defaults = window.__FRAMER_MOTION__.MotionConfig?.defaults;
    if (defaults) {
      defaults.transition = { duration: 0.2 };
    }
  }

  window.__REDUCED_MOTION_OVERRIDE__ = true;
}
