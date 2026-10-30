'use client';

import React, { useState, useEffect } from 'react';

// Default static logos for instant initial render
const INITIAL_LOGOS = [
  '/brands/abbott.png',
  '/brands/Autobio.png',
  '/brands/avantor.png',
  '/brands/boditech.webp',
  '/brands/Edan.png',
  '/brands/Hemocue.png',
  '/brands/jmitralogop.webp',
  '/brands/Meril-More-To-Life.png',
  '/brands/rajbiosis.png',
  '/brands/Siemens.png',
  '/brands/Snibe%20Maglumi.png',
  '/brands/Sysmex_company_logo.svg.webp'
];

// Columns for Left Panel: alternating Up, Down, Up, Down, Up
const LEFT_COLUMNS_CONFIG = [
  { id: 'col-0', direction: 'up', duration: '32s', visibility: 'flex' },
  { id: 'col-1', direction: 'down', duration: '38s', visibility: 'flex' },
  { id: 'col-2', direction: 'up', duration: '30s', visibility: 'hidden sm:flex' },
  { id: 'col-3', direction: 'down', duration: '36s', visibility: 'hidden xl:flex' },
  { id: 'col-4', direction: 'up', duration: '34s', visibility: 'hidden 2xl:flex' }
];

export default function BrandCarouselLeftPanel() {
  const [logoList, setLogoList] = useState(INITIAL_LOGOS);

  // Automatically fetch any new images placed in public/brands
  useEffect(() => {
    let isMounted = true;
    async function loadBrandLogos() {
      try {
        const res = await fetch('/api/brand-logos', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.logos && data.logos.length > 0 && isMounted) {
            setLogoList(data.logos.map((item) => item.url));
          }
        }
      } catch (e) {
        // Fallback to initial logos
      }
    }
    loadBrandLogos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to build column items with rotated distribution & duplication for infinite loop
  const buildColumnItems = (colOffset) => {
    if (logoList.length === 0) return [];
    const count = Math.max(logoList.length, 6);
    const shifted = [];
    for (let i = 0; i < count; i++) {
      const idx = (i * 2 + colOffset * 3) % logoList.length;
      shifted.push(logoList[idx]);
    }
    // Duplicate list for seamless infinite loop (0% to -50% for up, -50% to 0% for down)
    return [...shifted, ...shifted];
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 bg-slate-100 flex items-center justify-center gap-3.5 sm:gap-4 lg:gap-5 px-4 sm:px-6">
      {/* Universal CSS Keyframe animations for seamless GPU-accelerated infinite scrolling */}
      <style>{`
        @keyframes brandScrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes brandScrollDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Subtle high-tech dot matrix pattern */}
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #64748b 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Multi-Column Scrolling Grid filling the Left Panel completely */}
      <div className="flex items-center gap-3.5 sm:gap-4 lg:gap-5 h-[140%] -my-[20%] w-full justify-center">
        {LEFT_COLUMNS_CONFIG.map((col, cIdx) => {
          const items = buildColumnItems(cIdx);
          const animationName = col.direction === 'up' ? 'brandScrollUp' : 'brandScrollDown';

          return (
            <div
              key={col.id}
              className={`w-[155px] sm:w-[175px] lg:w-[185px] xl:w-[205px] shrink-0 flex-col gap-3.5 sm:gap-4 overflow-hidden ${col.visibility}`}
            >
              <div
                className="flex flex-col gap-3.5 sm:gap-4 shrink-0 will-change-transform"
                style={{
                  animation: `${animationName} ${col.duration} linear infinite`
                }}
              >
                {items.map((logoUrl, idx) => (
                  <div
                    key={idx}
                    className="w-full h-24 sm:h-28 lg:h-30 bg-white hover:bg-white border border-slate-200/90 rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-md hover:border-sky-300 flex items-center justify-center p-4 sm:p-5 transition-all duration-300"
                  >
                    <img
                      src={logoUrl}
                      alt="Brand Logo"
                      className="max-h-full max-w-full object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top & Bottom Gentle Gradient Fade Mask */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-100 via-slate-100/80 to-transparent z-1 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-100 via-slate-100/80 to-transparent z-1 pointer-events-none" />
    </div>
  );
}
