import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  length: number;
  alpha: number;
  maxAlpha: number;
  hue: number;
  life: number;
  maxLife: number;
}

export const AmbientWindCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Scroll gust velocity booster
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const now = performance.now();
      const dt = Math.max(16, now - lastScrollTime);
      const delta = Math.abs(currentScrollY - lastScrollY);
      
      // Calculate speed and add gust boost
      const speed = delta / dt;
      scrollVelocity = Math.min(18, scrollVelocity + speed * 4);
      
      lastScrollY = currentScrollY;
      lastScrollTime = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Particle pool: 45 lightweight breeze motes and wind streaks
    const particleCount = Math.min(48, Math.floor(width / 32));
    const particles: Particle[] = [];

    const createParticle = (initialX?: number): Particle => {
      const isStreak = Math.random() > 0.45;
      const hues = [240, 260, 220, 190, 280]; // violet, cyan, indigo, purple
      const hue = hues[Math.floor(Math.random() * hues.length)];

      return {
        x: initialX !== undefined ? initialX : Math.random() * width,
        y: Math.random() * height,
        vx: 0.6 + Math.random() * 1.4, // gentle rightward breeze
        vy: -0.2 + Math.random() * 0.4, // gentle drifting up/down
        size: isStreak ? 1 + Math.random() * 1.5 : 1.5 + Math.random() * 2,
        length: isStreak ? 12 + Math.random() * 32 : 2,
        alpha: 0,
        maxAlpha: 0.12 + Math.random() * 0.28,
        hue,
        life: 0,
        maxLife: 200 + Math.random() * 300
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Decay scroll gust velocity smoothly
      scrollVelocity *= 0.94;

      const gustBoost = scrollVelocity * 0.6;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Fade in and fade out curve
        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else if (progress > 0.8) {
          p.alpha = ((1 - progress) / 0.2) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        // Apply velocities with gust multiplier
        const currentVx = p.vx + gustBoost;
        p.x += currentVx;
        p.y += p.vy + Math.sin(p.life * 0.02) * 0.3;

        // Wrap around borders
        if (p.x > width + p.length + 50 || p.life >= p.maxLife) {
          particles[i] = createParticle(-p.length - 20);
          continue;
        }
        if (p.y < -30) p.y = height + 20;
        if (p.y > height + 30) p.y = -20;

        // Draw particle / wind streak
        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        if (p.length > 4) {
          // Wind streak
          const gradient = ctx.createLinearGradient(p.x - p.length, p.y, p.x, p.y);
          gradient.addColorStop(0, `hsla(${p.hue}, 85%, 70%, 0)`);
          gradient.addColorStop(0.7, `hsla(${p.hue}, 90%, 75%, ${p.alpha * 0.7})`);
          gradient.addColorStop(1, `hsla(${p.hue}, 100%, 90%, ${p.alpha})`);

          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.moveTo(p.x - p.length - gustBoost * 3, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          // Floating breeze mote
          ctx.beginPath();
          ctx.fillStyle = `hsla(${p.hue}, 90%, 80%, ${p.alpha})`;
          ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, 0.8)`;
          ctx.shadowBlur = 6;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full opacity-60 mix-blend-screen"
      aria-hidden="true"
    />
  );
};
