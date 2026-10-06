'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulseSpeed: number;
  color: string;
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Mouse parallax state for background and ambient light
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Scroll parallax state
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Mount & Reduced Motion Detection
  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  // 2. Mouse tracking with ultra-smooth lerp physics (Desktop only)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
      mouseTargetRef.current = { 
        x: Math.max(-1, Math.min(1, x)), 
        y: Math.max(-1, Math.min(1, y)) 
      };
    };

    const handleMouseLeave = () => {
      mouseTargetRef.current = { x: 0, y: 0 };
    };

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updatePhysics = () => {
      // Very slow, buttery interpolation for cinematic luxury feel
      mouseCurrentRef.current.x = lerp(mouseCurrentRef.current.x, mouseTargetRef.current.x, 0.035);
      mouseCurrentRef.current.y = lerp(mouseCurrentRef.current.y, mouseTargetRef.current.y, 0.035);
      setMousePos({ x: mouseCurrentRef.current.x, y: mouseCurrentRef.current.y });
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion]);

  // 3. Scroll-driven parallax
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const heroHeight = containerRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const progress = Math.min(1, Math.max(0, scrollY / (heroHeight * 0.95)));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // 4. Subtle Floating Cocoa Particles Canvas
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const PARTICLE_COUNT = 32;
    const colors = [
      'rgba(197, 160, 89, 0.45)', // Warm gold
      'rgba(230, 213, 184, 0.35)', // Light champagne
      'rgba(184, 134, 11, 0.3)',   // Deep amber bronze
      'rgba(140, 126, 114, 0.25)', // Cocoa dust
    ];

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -(Math.random() * 0.35 + 0.1), // Gentle thermal upward drift
      opacity: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.015 + 0.005,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 0.018;

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(tick + p.y * 0.012) * 0.18;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const dynamicOpacity = Math.max(0.08, Math.min(0.7, p.opacity + Math.sin(tick * p.pulseSpeed * 40) * 0.15));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = dynamicOpacity;
        ctx.shadowColor = 'rgba(197, 160, 89, 0.3)';
        ctx.shadowBlur = p.size * 2;
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [prefersReducedMotion]);

  // Smooth scroll helper
  const scrollToCollection = useCallback(() => {
    const target = document.getElementById('collection');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Parallax calculations
  const bgParallaxX = mousePos.x * 14;
  const bgParallaxY = mousePos.y * 10;
  const scrollBgY = scrollProgress * 50;

  return (
    <section 
      ref={containerRef}
      id="hero"
      aria-label="THALF Hero: A Little Dark. A Lot of THALF."
      suppressHydrationWarning
      className="relative min-h-[calc(100svh-5rem)] min-h-[calc(100vh-5rem)] w-full bg-[#0b0604] text-champagne overflow-hidden flex flex-col justify-between select-none"
    >
      {/* 1. FULL-BLEED CINEMATIC HERO BACKGROUND (EDGE-TO-EDGE, NO CARDS/RECTANGLES) */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        style={{
          transform: prefersReducedMotion 
            ? 'none' 
            : `translate3d(${bgParallaxX}px, ${bgParallaxY + scrollBgY}px, 0) scale(1.04)`,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <Image
          src="/images/thalf-hero-bg.jpg"
          alt="THALF Artisanal Dark Chocolate Slabs with Flowing Melted Chocolate Ganache"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-[center_right] lg:object-right select-none"
        />

        {/* Ambient Warm Golden Rim Glow on Right side */}
        <div 
          className="absolute right-0 top-[15%] w-[55vw] max-w-[700px] h-[55vw] max-h-[700px] rounded-full opacity-30 blur-[130px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(197,160,89,0.3) 0%, rgba(90,61,36,0.15) 50%, transparent 70%)'
          }}
        />
      </div>

      {/* 2. SUBTLE DARK BROWN GRADIENT OVERLAYS (LEFT ONLY & MOBILE READABILITY) */}
      
      {/* Left dark brown gradient to ensure crisp, readable typography while keeping chocolate visible on right */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#0b0604] via-[#0b0604]/90 sm:via-[#0b0604]/80 md:via-[#0b0604]/60 lg:via-[#0b0604]/40 to-transparent w-full md:w-[78%] lg:w-[65%]" 
      />

      {/* Mobile vertical gradient: ensures headline readability without obstructing chocolate details on mobile */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#0b0604]/95 via-[#0b0604]/60 to-transparent sm:hidden" 
      />

      {/* Top subtle fade from header */}
      <div 
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0e0805]/80 via-[#0e0805]/40 to-transparent z-10 pointer-events-none" 
      />

      {/* Bottom smooth edge transition into collection */}
      <div 
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0b0604] via-[#0b0604]/60 to-transparent z-10 pointer-events-none" 
      />

      {/* Floating Cocoa Particles Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 3. OVERLAY HTML CONTENT (POSITIONED 10–12% FROM LEFT ON DESKTOP, VERTICALLY CENTERED) */}
      <div className="relative z-20 w-full flex-grow flex items-center py-12 sm:py-16 md:py-20">
        <div className="w-full px-5 sm:px-8 md:pl-[10%] lg:pl-[11%] xl:pl-[12%] md:pr-8">
          
          <div className="max-w-2xl lg:max-w-3xl space-y-5 sm:space-y-7">
            
            {/* Eyebrow: PREMIUM CRAFT CHOCOLATES */}
            <div 
              className={`flex items-center space-x-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-gold/90 font-mono transition-all duration-1000 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-8 h-[1.5px] bg-gold/70 inline-block shadow-[0_0_8px_rgba(197,160,89,0.6)]" />
              <span>PREMIUM CRAFT CHOCOLATES</span>
            </div>

            {/* Editorial Headline (Significantly Larger, Elegant, Line-by-Line Reveal) */}
            <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-[6.4rem] xl:text-[7.2rem] font-light text-cream leading-[0.98] tracking-tight">
              
              {/* Line 1: A LITTLE */}
              <span className="block overflow-hidden py-1">
                <span 
                  className={`block transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
                    mounted ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ transitionDelay: '150ms' }}
                >
                  A LITTLE
                </span>
              </span>

              {/* Line 2: DARK. */}
              <span className="block overflow-hidden py-1">
                <span 
                  className={`block transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) text-gold font-light ${
                    mounted ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ transitionDelay: '300ms' }}
                >
                  DARK.
                </span>
              </span>

              {/* Line 3: A LOT OF */}
              <span className="block overflow-hidden py-1">
                <span 
                  className={`block transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
                    mounted ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ transitionDelay: '450ms' }}
                >
                  A LOT OF
                </span>
              </span>

              {/* Line 4: THALF. */}
              <span className="block overflow-hidden py-1">
                <span 
                  className={`block transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) text-cream tracking-[0.04em] font-normal ${
                    mounted ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ transitionDelay: '600ms' }}
                >
                  THALF.
                </span>
              </span>

            </h1>

            {/* Supporting Text */}
            <div className="overflow-hidden pt-1">
              <p 
                className={`text-xs sm:text-sm md:text-base text-taupe/95 font-light max-w-xl leading-relaxed transition-all duration-1000 ease-out ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: '750ms' }}
              >
                Handcrafted chocolates made to turn ordinary moments into something unforgettable.
              </p>
            </div>

            {/* CTA Buttons: Stacked on Mobile, Side-by-Side on Desktop */}
            <div 
              className={`pt-3 sm:pt-4 flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-stretch sm:items-center transition-all duration-1000 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '900ms' }}
            >
              {/* Primary CTA: SHOP CHOCOLATES → */}
              <Link
                href="/shop"
                className="group relative px-8 sm:px-9 py-4 bg-gold text-[#120B07] hover:bg-gold-light text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(197,160,89,0.35)] hover:shadow-[0_15px_30px_-5px_rgba(197,160,89,0.5)] flex items-center justify-center space-x-3 active:scale-[0.98]"
              >
                <span>SHOP CHOCOLATES</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 stroke-[2.2]" />
                
                {/* Sheen animation on hover */}
                <span className="absolute inset-0 overflow-hidden pointer-events-none">
                  <span className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 group-hover:translate-x-[250%] transition-transform duration-1000 ease-out" />
                </span>
              </Link>

              {/* Secondary CTA: EXPLORE COLLECTION → */}
              <Link
                href="#collection"
                onClick={scrollToCollection}
                className="group px-8 sm:px-9 py-4 border border-gold/45 text-cream hover:border-gold hover:text-gold text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 bg-[#090503]/50 backdrop-blur-sm flex items-center justify-center space-x-2.5 active:scale-[0.98]"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 opacity-70 group-hover:opacity-100 stroke-[2]" />
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* 4. SCROLL INDICATOR (BOTTOM LEFT) */}
      <div className="relative z-20 w-full px-5 sm:px-8 md:pl-[10%] lg:pl-[11%] xl:pl-[12%] pb-6 pt-2">
        <button
          onClick={scrollToCollection}
          aria-label="Scroll down to the chocolates collection"
          suppressHydrationWarning
          className="group inline-flex items-center space-x-3 text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-taupe/80 hover:text-gold transition-colors duration-300 focus:outline-none"
        >
          <span className="flex flex-col items-start">
            <span>SCROLL</span>
            <span className="w-4 h-[1px] bg-gold/40 mt-1 group-hover:w-6 transition-all duration-300" />
          </span>
          <span className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center text-gold group-hover:border-gold group-hover:translate-y-1 transition-all duration-300 bg-cream/5">
            <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
          </span>
        </button>
      </div>

    </section>
  );
}
