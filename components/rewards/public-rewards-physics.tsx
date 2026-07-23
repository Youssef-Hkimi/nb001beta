"use client";

import { useEffect, useRef, useState } from "react";

export function PublicRewardsRain({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPainted(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => setPainted(true));
    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!canvas || !context) return;
    const rainCanvas = canvas;
    const drawingContext = context;

    let width = Math.max(1, rainCanvas.clientWidth);
    let height = Math.max(1, rainCanvas.clientHeight);
    let animationFrame = 0;
    let lastFrameTime = performance.now();
    let disposed = false;
    let started = false;

    function resizeCanvas() {
      width = Math.max(1, rainCanvas.clientWidth);
      height = Math.max(1, rainCanvas.clientHeight);
      rainCanvas.width = width;
      rainCanvas.height = height;
    }
    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(rainCanvas);

    const config = {
      density: 96,
      speed: 1,
      size: 99,
      wind: -0.2,
      rotationSpeed: 0.035,
      image:
        "https://res.cloudinary.com/zux0o0wz/image/upload/v1784727487/GifBox4_xqmmme.webp",
    };

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      vx: 0,
      vy: 0,
      radius: 120,
      active: false,
    };

    function handlePointerMove(event: PointerEvent) {
      const bounds = rainCanvas.getBoundingClientRect();
      mouse.targetX = event.clientX - bounds.left;
      mouse.targetY = event.clientY - bounds.top;
      if (!mouse.active) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      }
      mouse.active = true;
    }

    function handlePointerLeave(event: PointerEvent) {
      if (event.relatedTarget === null) mouse.active = false;
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerLeave, { passive: true });

    const image = new Image();
    image.decoding = "async";

    const sprite = document.createElement("canvas");
    const spriteSize = 320;
    sprite.width = spriteSize;
    sprite.height = spriteSize;

    class Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      angle: number;
      rotation: number;
      opacity: number;
      vx: number;
      vy: number;

      constructor() {
        this.x = Math.random() * width * 1.4 - width * 0.2;
        this.y = Math.random() * height;
        this.speed = Math.random() * 2;
        this.size = 0.7 + Math.random() * 0.6;
        this.angle = Math.random() * Math.PI * 2;
        this.rotation = Math.random() - 0.5;
        this.opacity = 0.6 + Math.random() * 0.4;
        this.vx = 0;
        this.vy = 0;
      }

      update(delta: number) {
        const deltaX = this.x - mouse.x;
        const deltaY = this.y - mouse.y;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;
        const visualSize = config.size * this.size;
        const interactionRadius = mouse.radius + visualSize * 0.35;
        const radiusSquared = interactionRadius * interactionRadius;

        if (mouse.active && distanceSquared < radiusSquared && distanceSquared > 0) {
          const distance = Math.sqrt(distanceSquared);
          const force = 1 - distance / interactionRadius;
          const angle = Math.atan2(deltaY, deltaX);
          const pointerSpeed = Math.min(8, Math.hypot(mouse.vx, mouse.vy) * 0.55);
          const push = force * (3 + pointerSpeed);
          this.vx += Math.cos(angle) * push + mouse.vx * 0.14;
          this.vy += Math.sin(angle) * push + mouse.vy * 0.14;
        }

        this.y += (config.speed + this.speed + this.vy) * delta;
        this.x += (config.wind + this.vx) * delta;
        this.vx *= Math.pow(0.92, delta);
        this.vy *= Math.pow(0.92, delta);
        this.angle += this.rotation * config.rotationSpeed * delta;

        const edgeMargin = config.size;
        if (this.y > height + edgeMargin) {
          this.y = -edgeMargin;
          this.x = Math.random() * width * 1.4 - width * 0.2;
        }
        if (this.x < -edgeMargin) this.x = width + edgeMargin;
        if (this.x > width + edgeMargin) this.x = -edgeMargin;
      }

      draw() {
        const size = config.size * this.size;
        const drawHeight = size * (sprite.height / sprite.width);
        const cosine = Math.cos(this.angle);
        const sine = Math.sin(this.angle);
        drawingContext.setTransform(cosine, sine, -sine, cosine, this.x, this.y);
        drawingContext.globalAlpha = this.opacity;
        drawingContext.drawImage(
          sprite,
          -size / 2,
          -drawHeight / 2,
          size,
          drawHeight,
        );
      }
    }

    const particles: Particle[] = [];

    function loop(frameTime: number) {
      const delta = Math.min(
        2,
        Math.max(0.5, (frameTime - lastFrameTime) / 16.667),
      );
      lastFrameTime = frameTime;
      drawingContext.setTransform(1, 0, 0, 1, 0, 0);
      drawingContext.globalAlpha = 1;
      drawingContext.clearRect(0, 0, width, height);

      if (mouse.active) {
        const previousX = mouse.x;
        const previousY = mouse.y;
        const pointerEasing = 1 - Math.pow(0.24, delta);
        mouse.x += (mouse.targetX - mouse.x) * pointerEasing;
        mouse.y += (mouse.targetY - mouse.y) * pointerEasing;
        mouse.vx = mouse.x - previousX;
        mouse.vy = mouse.y - previousY;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
        mouse.vx = 0;
        mouse.vy = 0;
      }

      for (const particle of particles) {
        particle.update(delta);
        particle.draw();
      }

      drawingContext.setTransform(1, 0, 0, 1, 0, 0);
      drawingContext.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(loop);
    }

    function startAnimation() {
      if (disposed || started || image.naturalWidth === 0) return;
      started = true;
      sprite.height = Math.round(spriteSize * (image.naturalHeight / image.naturalWidth));
      sprite
        .getContext("2d")
        ?.drawImage(image, 0, 0, sprite.width, sprite.height);
      image.removeAttribute("src");
      for (let index = 0; index < config.density; index += 1) {
        particles.push(new Particle());
      }
      animationFrame = window.requestAnimationFrame(loop);
    }

    image.onload = startAnimation;
    image.src = config.image;
    if (image.complete && image.naturalWidth > 0) {
      window.requestAnimationFrame(startAnimation);
    }

    return () => {
      disposed = true;
      image.onload = null;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-30 h-screen w-screen transform-gpu contain-strict transition-opacity duration-700 ease-in-out ${
        painted ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
