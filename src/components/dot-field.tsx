"use client";

import { useEffect, useRef } from "react";

const GAP = 22; // distance between dots, px
const DOT_RADIUS = 1;
const LENS_RADIUS = 170; // how far the zoom reaches around the cursor
const MAX_ZOOM = 3.2; // dot size multiplier right under the cursor
const SPREAD = 0.35; // how much dots under the lens push outward

/**
 * The dot grid behind the landing and sign-in pages, drawn on a canvas so each
 * dot can have its own size: dots near the mouse zoom in like under a
 * magnifying glass. The grid is otherwise still, and the canvas only redraws
 * while the lens is moving, so an idle page costs no CPU. The lens is off on
 * touch-only devices.
 */
export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const canHover = window.matchMedia("(hover: hover)").matches;

    let width = 0;
    let height = 0;
    let dark = false;
    let frame = 0;
    const target = { x: -9999, y: -9999, strength: 0 };
    const lens = { x: -9999, y: -9999, strength: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      requestDraw();
    };
    const readTheme = () => {
      dark = document.documentElement.classList.contains("dark");
      requestDraw();
    };

    // Same fade as before: dots fade out toward the edges, around the hero text
    const edgeAlpha = (x: number, y: number) => {
      const dx = (x - width * 0.5) / (width * 0.7);
      const dy = (y - height * 0.35) / (height * 0.6);
      const distance = Math.hypot(dx, dy);
      return Math.min(1, Math.max(0, (0.75 - distance) / 0.45));
    };

    const draw = () => {
      frame = 0;
      // Ease the lens toward the cursor, so it glides instead of jumping
      lens.x += (target.x - lens.x) * 0.2;
      lens.y += (target.y - lens.y) * 0.2;
      lens.strength += (target.strength - lens.strength) * 0.12;

      const ink = dark ? "255, 255, 255" : "15, 23, 42";
      context.clearRect(0, 0, width, height);

      for (let y = GAP / 2; y < height; y += GAP) {
        for (let x = GAP / 2; x < width; x += GAP) {
          let radius = DOT_RADIUS;
          let drawX = x;
          let drawY = y;
          let zoom = 0;

          const dx = x - lens.x;
          const dy = y - lens.y;
          const distance = Math.hypot(dx, dy);
          if (lens.strength > 0.01 && distance < LENS_RADIUS) {
            const t = 1 - distance / LENS_RADIUS;
            zoom = t * t * (3 - 2 * t) * lens.strength; // smoothstep: soft lens edge
            radius = DOT_RADIUS * (1 + (MAX_ZOOM - 1) * zoom);
            drawX = x + dx * zoom * SPREAD;
            drawY = y + dy * zoom * SPREAD;
          }

          // Zoomed dots stay visible even where the grid has faded out
          const alpha = Math.max(edgeAlpha(x, y), zoom) * (0.14 + 0.22 * zoom);
          if (alpha < 0.01) continue;
          context.fillStyle = `rgba(${ink}, ${alpha})`;
          context.beginPath();
          context.arc(drawX, drawY, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      const settling =
        Math.abs(target.x - lens.x) > 0.5 ||
        Math.abs(target.y - lens.y) > 0.5 ||
        Math.abs(target.strength - lens.strength) > 0.01;
      // Keep drawing only while the lens is still easing toward the cursor
      if (settling) requestDraw();
    };

    function requestDraw() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
      target.strength = 1;
      // Start the lens where the cursor enters instead of sliding in from far away
      if (lens.strength < 0.01) {
        lens.x = target.x;
        lens.y = target.y;
      }
      requestDraw();
    };
    const onLeave = () => {
      target.strength = 0;
      requestDraw();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    // The theme toggle changes the "dark" class on <html>
    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, { attributeFilter: ["class"] });
    readTheme();
    if (canHover) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="dot-canvas" aria-hidden />;
}
