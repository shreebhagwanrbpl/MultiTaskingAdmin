'use client';

import React from 'react';

// Floating Brand Pods with positions and float timing
const BRAND_PODS = [
  { name: 'Abbott', src: '/brands/abbott.png', top: '12%', left: '14%', delay: '0s', duration: '5s' },
  { name: 'Siemens', src: '/brands/Siemens.png', top: '10%', right: '16%', delay: '1s', duration: '6s' },
  { name: 'Sysmex', src: '/brands/Sysmex_company_logo.svg.webp', top: '34%', left: '8%', delay: '0.5s', duration: '5.5s' },
  { name: 'Meril', src: '/brands/Meril-More-To-Life.png', top: '32%', right: '10%', delay: '1.5s', duration: '4.8s' },
  { name: 'Snibe', src: '/brands/Snibe%20Maglumi.png', top: '56%', left: '12%', delay: '2s', duration: '5.2s' },
  { name: 'Autobio', src: '/brands/Autobio.png', top: '54%', right: '14%', delay: '0.8s', duration: '6.2s' },
  { name: 'Boditech', src: '/brands/boditech.webp', top: '78%', left: '18%', delay: '1.2s', duration: '4.5s' },
  { name: 'HemoCue', src: '/brands/Hemocue.png', top: '76%', right: '20%', delay: '2.2s', duration: '5.8s' },
  { name: 'J. Mitra', src: '/brands/jmitralogop.webp', top: '88%', left: '42%', delay: '1.8s', duration: '5.4s' },
  { name: 'Edan', src: '/brands/Edan.png', top: '18%', left: '44%', delay: '0.3s', duration: '4.2s' },
  { name: 'Avantor', src: '/brands/avantor.png', top: '68%', right: '36%', delay: '1.6s', duration: '5.6s' }
];

export default function BiomedicalLeftAnimation() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#070B14] via-[#0B1222] to-[#080E1C] flex items-center justify-center select-none pointer-events-none">

      {/* Universal CSS Keyframe Animations */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-9px) scale(1.02);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.6;
          }
        }

        @keyframes ecgSweep {
          0% {
            stroke-dashoffset: 800;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes orbitRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* 1. AMBIENT GLOW ORBS */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-sky-500/15 rounded-full blur-[110px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px]" />
      <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-[90px]" />

      {/* 2. HIGH-TECH MEDICAL GRID PATTERN */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* 3. CONCENTRIC ROTATING ORBIT RINGS */}
      <div
        className="absolute w-[340px] h-[340px] rounded-full border border-sky-500/15 border-dashed"
        style={{ animation: 'orbitRotate 50s linear infinite' }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full border border-indigo-500/10"
        style={{ animation: 'orbitRotate 75s linear infinite reverse' }}
      />
      <div
        className="absolute w-[660px] h-[660px] rounded-full border border-teal-500/10 border-dotted"
        style={{ animation: 'orbitRotate 90s linear infinite' }}
      />

      {/* 4. CENTRAL GLOWING HEARTBEAT (ECG) WAVE */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-30 flex items-center justify-center">
        <svg viewBox="0 0 1000 80" className="w-full h-16" fill="none">
          <path
            d="M0 40 H280 L295 15 L310 65 L325 20 L340 50 L355 35 L370 40 H630 L645 15 L660 65 L675 20 L690 50 L705 35 L720 40 H1000"
            stroke="url(#ecgLinearGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="800"
            style={{ animation: 'ecgSweep 6s linear infinite' }}
          />
          <defs>
            <linearGradient id="ecgLinearGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="70%" stopColor="#818cf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 5. CENTRAL RAJ BIOSIS GLOWING COMMAND CORE */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        {/* Pulsing Outer Rings */}
        <div
          className="absolute w-44 h-44 rounded-full border border-sky-400/30"
          style={{ animation: 'pulseRing 4s ease-in-out infinite' }}
        />
        <div
          className="absolute w-36 h-36 rounded-full bg-sky-500/10 blur-md"
          style={{ animation: 'pulseRing 3s ease-in-out infinite' }}
        />

        {/* Central Core Emblem Card */}
        <div className="relative w-28 h-28 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_0_50px_rgba(56,189,248,0.35)] flex flex-col items-center justify-center p-3 transition-transform">
          <div className="w-14 h-14 flex items-center justify-center">
            <img
              src="/rajbiosis-logo.png"
              alt="Raj Biosis"
              className="max-h-full max-w-full object-contain filter drop-shadow-sm"
            />
          </div>
          <span className="text-[10px] font-black text-slate-900 tracking-tight leading-none mt-1">
            RAJ BIOSIS
          </span>
          <span className="text-[8px] font-bold text-sky-600 uppercase tracking-widest mt-0.5">
            Central Hub
          </span>
        </div>

        {/* Live Network Status Indicator */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-[10px] font-bold shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Pan-India Biomedical Network Active</span>
        </div>
      </div>

      {/* 6. FLOATING BRAND PODS (ORBITING SATELLITES) */}
      {BRAND_PODS.map((pod, idx) => (
        <div
          key={idx}
          className="absolute z-10"
          style={{
            top: pod.top,
            left: pod.left,
            right: pod.right,
            animation: `floatSlow ${pod.duration} ease-in-out infinite`,
            animationDelay: pod.delay
          }}
        >
          <div className="h-10 sm:h-11 px-3 sm:px-3.5 bg-white/90 backdrop-blur-md rounded-2xl border border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center gap-2 transition-transform hover:scale-105">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <img
              src={pod.src}
              alt={pod.name}
              className="h-5 sm:h-5.5 max-w-[70px] sm:max-w-[80px] object-contain filter drop-shadow-2xs"
            />
          </div>
        </div>
      ))}

      {/* 7. TOP & BOTTOM SUBTLE BRAND PILLS */}
      <div className="absolute top-6 left-8 z-20 flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Raj Biosis Inventory management system
        </span>
      </div>

      <div className="absolute bottom-6 inset-x-8 z-20 flex items-center justify-between text-[11px] text-slate-400 font-semibold border-t border-white/10 pt-3">
        <span>12+ Authorized Global OEMs</span>
        <span className="text-sky-400">100% CDSCO Registered</span>
      </div>

    </div>
  );
}

