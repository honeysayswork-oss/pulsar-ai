"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener("resize", handleResize);

    const starCount = Math.floor((width * height) / 3800);
    const starColors = ["#ffffff", "#e0e7ff", "#c7d2fe", "#a5f3fc", "#e879f9", "#38bdf8"];
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        const baseAlpha = Math.random() * 0.7 + 0.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.8 + 0.4,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    const maybeSpawnShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 80 + 50,
          speed: Math.random() * 7 + 9,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          opacity: 1,
          active: true,
        });
      }
    };

    initStars();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space nebula glow
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        100,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.75
      );
      grad.addColorStop(0, "rgba(88, 28, 135, 0.14)");
      grad.addColorStop(0.4, "rgba(14, 116, 144, 0.08)");
      grad.addColorStop(1, "rgba(3, 7, 18, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render stars
      for (const star of stars) {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, star.alpha));
        ctx.shadowBlur = star.size > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Handle shooting stars
      maybeSpawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) {
          shootingStars.splice(i, 1);
          continue;
        }

        const headX = s.x;
        const headY = s.y;
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const lineGrad = ctx.createLinearGradient(headX, headY, tailX, tailY);
        lineGrad.addColorStop(0, `rgba(165, 243, 252, ${s.opacity})`);
        lineGrad.addColorStop(1, "rgba(165, 243, 252, 0)");

        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.015;

        if (s.opacity <= 0 || s.x > width + 100 || s.y > height + 100) {
          s.active = false;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "radial-gradient(ellipse at bottom, #090d16 0%, #030712 100%)" }}
    />
  );
}
