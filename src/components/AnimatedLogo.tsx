'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const TRANSITION_DURATION = 0.5;

export default function AnimatedLogo() {
  const [isActive, setIsActive] = useState(false);

  const isCollapsed = !isActive;

  return (
    <div 
      className="flex items-center text-lg font-bold tracking-widest text-black dark:text-white md:text-xl"
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsActive(true);
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
          setIsActive(false);
        }
      }}
      onClick={(e) => {
        if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
          // On mobile, click toggles animation. Prevent navigation if opening the logo.
          if (!isActive) {
            e.preventDefault();
            setIsActive(true);
            
            // Auto collapse after 3 seconds on mobile
            setTimeout(() => {
              setIsActive(false);
            }, 3000);
          }
        }
      }}
      style={{ fontFamily: 'inherit' }}
    >
      {/* EVALU part */}
      <motion.span
        initial={false}
        className="inline-block"
        animate={{ x: 0 }}
        transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
      >
        {'EVALU'.split('').map((char, i) => (
          <motion.span key={`e-${i}`} className="inline-block">{char}</motion.span>
        ))}
      </motion.span>

      {/* Collapsing middle: ATE + (space) + INTELI */}
      <span className="inline-flex whitespace-nowrap">
        {'ATE INTELI'.split('').map((char, i, arr) => {
          const delay = isCollapsed ? (arr.length - 1 - i) * 0.03 : i * 0.04;
          return (
            <motion.span
              initial={false}
              key={`m-${i}`}
              className="inline-block overflow-hidden"
              animate={{
                width: isCollapsed ? 0 : 'auto',
                opacity: isCollapsed ? 0 : 1,
              }}
              transition={{ 
                width: { duration: 0.15, delay, ease: 'easeInOut' },
                opacity: { duration: 0.6, delay, ease: 'easeOut' }
              }}
            >
              <span className="inline-block">
                {char === ' ' ? '\u00A0' : char}
              </span>
            </motion.span>
          );
        })}
      </span>

      {/* GENCE part */}
      <motion.span
        initial={false}
        className="inline-block"
        animate={{ x: 0 }}
        transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
      >
        {'GENCE'.split('').map((char, i) => (
          <motion.span key={`g-${i}`} className="inline-block">{char}</motion.span>
        ))}
      </motion.span>
    </div>
  );
}
