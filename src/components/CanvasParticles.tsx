import React, { useEffect, useRef } from 'react';

interface BurstRequest {
  id: number;
  x: number;
  y: number;
  color?: string;
}

interface CanvasParticlesProps {
  burst: BurstRequest | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const CanvasParticles: React.FC<CanvasParticlesProps> = React.memo(({ burst }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const startLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const tick = () => {
      const list = particlesRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (list.length === 0) {
        rafRef.current = null;
        return;
      }

      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.09;
        p.life++;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life >= p.maxLife) list.splice(i, 1);
      }
      ctx.globalAlpha = 1;

      if (list.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = null;
      }
    };

    startLoopRef.current = () => {
      if (rafRef.current === null && particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startLoopRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!burst) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const colors = [burst.color ?? '#E5A93C', '#F8D482', '#38BDF8', '#FFFFFF'];
    // Cap max concurrent particles for smooth 60fps on Android devices
    if (particlesRef.current.length > 80) {
      particlesRef.current.splice(0, particlesRef.current.length - 80);
    }
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.35;
      const speed = 1.6 + Math.random() * 3.4;
      particlesRef.current.push({
        x: burst.x,
        y: burst.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        life: 0,
        maxLife: 24 + Math.random() * 14,
        size: 2 + Math.random() * 2.5,
        color: colors[i % colors.length],
      });
    }
    startLoopRef.current?.();
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
});

CanvasParticles.displayName = 'CanvasParticles';
