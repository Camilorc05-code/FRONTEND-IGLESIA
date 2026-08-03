import { useState, useEffect, useRef, useCallback } from 'react';

export function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false;
  if (window.__LOW_END__) return true;
  const lowCPU = (navigator.hardwareConcurrency || 4) <= 2;
  const saveData = navigator.connection?.saveData === true;
  return lowCPU || saveData;
}

export function prefersReducedMotion() {
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

// Hook para saber si se deben omitir las animaciones decorativas pesadas
// (partículas, parallax con mouse, tilt, etc.) en este dispositivo.
export function useSkipDecorations() {
  const reduced = useReducedMotion();
  return reduced;
}

export function optimizeForLowEnd() {
  if (typeof window === 'undefined') return;
  if (!isLowEndDevice()) return;

  const style = document.createElement('style');
  style.setAttribute('data-perf-opt', 'low-end');
  style.textContent = `
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    [style*="will-change: transform"],
    [style*="will-change:translate"] {
      will-change: auto !important;
    }
  `;
  document.head.appendChild(style);

  window.__REDUCED_MOTION_OVERRIDE__ = true;
}

// Lazy-load de imágenes: agrega loading="lazy" + decoding="async" a <img>.
// Se ejecuta una vez y usa MutationObserver para cubrir imágenes dinámicas.
export function enableLazyImages() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  const procesar = (img) => {
    if (img.getAttribute('loading')) return;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  };
  document.querySelectorAll('img').forEach(procesar);
  const obs = new MutationObserver((mutations) => {
    mutations.forEach((m) => m.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.tagName === 'IMG') procesar(node);
        node.querySelectorAll?.('img').forEach(procesar);
      }
    }));
  });
  obs.observe(document.body, { childList: true, subtree: true });
}
