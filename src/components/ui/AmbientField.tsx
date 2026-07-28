import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The ambient stratum: a slow generative constellation drawn on canvas.
 * Ember motes drift like fireflies; motes that wander near one another are
 * joined by hairlines, so faint schematic figures assemble and dissolve.
 * Palette-aware (reads the CSS tokens, re-reads on theme flips), pauses
 * when offscreen or the tab is hidden, and renders a single still frame
 * under prefers-reduced-motion. Pure ornament: aria-hidden, no pointer
 * events, and nothing else knows it exists.
 *
 * Variants: "hero" fills its positioned parent; "rails" is a fixed layer
 * masked to the empty gutters either side of the 1180px content rail.
 */

type Variant = "hero" | "rails";

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** twinkle phase + speed */
  ph: number;
  sp: number;
  /** 0 ink dust, 1 signal ember, 2 pulse fleck */
  kind: 0 | 1 | 2;
}

const SETTINGS: Record<
  Variant,
  { area: number; cap: number; link: number; lineAlpha: number; emberShare: number }
> = {
  hero: { area: 15000, cap: 64, link: 110, lineAlpha: 0.16, emberShare: 0.14 },
  rails: { area: 30000, cap: 80, link: 90, lineAlpha: 0.1, emberShare: 0.1 },
};

/** Gutter mask: opaque outside the content rail, fading in over 140px. */
const RAIL_MASK =
  "linear-gradient(to right, black, black calc(50% - 730px), transparent calc(50% - 590px), transparent calc(50% + 590px), black calc(50% + 730px), black)";

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "").trim();
  const f = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = Number.parseInt(f, 16);
  if (f.length !== 6 || Number.isNaN(n)) return [128, 128, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const readPalette = () => {
  const s = getComputedStyle(document.documentElement);
  return {
    dust: hexToRgb(s.getPropertyValue("--color-text-secondary")),
    ember: hexToRgb(s.getPropertyValue("--color-signal")),
    fleck: hexToRgb(s.getPropertyValue("--color-pulse")),
    dark: document.documentElement.classList.contains("dark"),
  };
};

const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

export const AmbientField = ({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = SETTINGS[variant];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let palette = readPalette();
    let motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let onScreen = true;

    const seed = (count: number) => {
      motes = Array.from({ length: count }, () => {
        const roll = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 9,
          vy: (Math.random() - 0.5) * 9,
          r: 0.8 + Math.random() * 1.4,
          ph: Math.random() * Math.PI * 2,
          sp: 0.3 + Math.random() * 0.5,
          kind: roll < cfg.emberShare ? 1 : roll < cfg.emberShare + 0.08 ? 2 : 0,
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const { dust, ember, fleck, dark } = palette;
      const dim = dark ? 1 : 0.75;

      // Hairlines first, so motes sit on top of the figure they form.
      ctx.lineWidth = 0.6;
      for (let i = 0; i < motes.length; i++) {
        for (let j = i + 1; j < motes.length; j++) {
          const dx = motes[i].x - motes[j].x;
          const dy = motes[i].y - motes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > cfg.link * cfg.link) continue;
          const a = (1 - Math.sqrt(d2) / cfg.link) * cfg.lineAlpha * dim;
          ctx.strokeStyle = rgba(ember, a);
          ctx.beginPath();
          ctx.moveTo(motes[i].x, motes[i].y);
          ctx.lineTo(motes[j].x, motes[j].y);
          ctx.stroke();
        }
      }

      for (const p of motes) {
        const tw = 0.55 + 0.45 * Math.sin(t * p.sp + p.ph);
        if (p.kind === 1) {
          // Ember: a soft firefly glow around a bright core.
          const glowR = p.r * 7;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          g.addColorStop(0, rgba(ember, 0.32 * tw * dim));
          g.addColorStop(1, rgba(ember, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = rgba(ember, 0.85 * tw * dim);
        } else if (p.kind === 2) {
          ctx.fillStyle = rgba(fleck, 0.5 * tw * dim);
        } else {
          ctx.fillStyle = rgba(dust, 0.3 * tw * dim);
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.05);
      // ~30fps is plenty for drift this slow; skip in-between frames.
      if (dt < 0.03) return;
      last = now;
      for (const p of motes) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Torus wrap keeps density constant with no edge clustering.
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
      draw(now / 1000);
    };

    const start = () => {
      if (raf || reduced || !onScreen || document.hidden || w === 0) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(Math.min(cfg.cap, Math.round((w * h) / cfg.area)));
      if (reduced || !raf) draw(performance.now() / 1000);
      start();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    // Theme flips swap every token; re-read and let the next frame recolor.
    const mo = new MutationObserver(() => {
      palette = readPalette();
      if (reduced) draw(performance.now() / 1000);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // Canvas is a replaced element: inset alone won't stretch it, so the
      // component always fills whatever box its positioning classes define.
      className={cn("pointer-events-none h-full w-full", className)}
      style={
        variant === "rails"
          ? { WebkitMaskImage: RAIL_MASK, maskImage: RAIL_MASK }
          : undefined
      }
    />
  );
};
