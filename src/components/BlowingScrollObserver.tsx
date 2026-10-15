import React, { useEffect } from 'react';

export const BlowingScrollObserver: React.FC = () => {
  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Observe elements throughout the website
    const selector = [
      'section',
      '.product-card-container',
      '.blow-on-reach',
      '[id^="product-card-"]',
      '.glass-card-interactive',
      '.glass-card-premium'
    ].join(', ');

    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            if (!el.classList.contains('is-wind-blown')) {
              el.classList.add('is-wind-blown');

              // Dispatch a subtle wind gust effect on the reached section
              triggerSectionWindGust(el);
            }
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const registerElement = (el: HTMLElement) => {
      if (!el.classList.contains('blow-on-reach')) {
        el.classList.add('blow-on-reach');
      }

      // If already in initial viewport, blow in immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        requestAnimationFrame(() => {
          el.classList.add('is-wind-blown');
        });
      }

      observer.observe(el);
    };

    elements.forEach((el) => {
      registerElement(el as HTMLElement);
    });

    // Also observe new elements dynamically added (e.g. dynamic tabs or search results)
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(selector)) {
              registerElement(node);
            }
            const nested = node.querySelectorAll?.(selector);
            nested?.forEach((el) => {
              registerElement(el as HTMLElement);
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
};

// Creates a transient, ethereal glowing breeze gust sweep across the reached element
function triggerSectionWindGust(element: HTMLElement) {
  // Check if gust element already exists
  if (element.querySelector('.wind-gust-beam')) return;

  const gust = document.createElement('div');
  gust.className = 'wind-gust-beam pointer-events-none';
  gust.setAttribute('aria-hidden', 'true');

  element.style.position = element.style.position || 'relative';
  element.appendChild(gust);

  // Remove beam after animation completes to keep DOM pristine
  setTimeout(() => {
    gust.remove();
  }, 1600);
}
