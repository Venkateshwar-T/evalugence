'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Phases: 0 (start) -> 1 (show full text) -> 2 (text change) -> 3 (collapse to EVALUGENCE)

type Phase = 0 | 1 | 2 | 3;

const TRANSITION_DURATION = 1.5; // Duration for the collapse animation
const HOLD_DURATION = 1000;      // How long to hold each phase before auto-advancing

export default function BrandLogoAnimation() {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Advance phases automatically when in view
  useEffect(() => {
    if (!isInView) return;
    
    const timer1 = setTimeout(() => setPhase(2), HOLD_DURATION);
    const timer2 = setTimeout(() => setPhase(3), HOLD_DURATION * 2);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isInView]);

  const isCollapsed = phase === 3;

  return (
    <div ref={ref} className="flex min-h-[40vh] items-center justify-center px-4 select-none">
      <div className="flex flex-col items-end">
        <div className="relative overflow-hidden flex items-baseline justify-center">
          <div 
            className="text-lg sm:text-3xl md:text-5xl lg:text-7xl font-semibold tracking-widest text-black dark:text-white flex items-baseline -mr-[0.1em]"
            style={{ fontFamily: 'inherit' }}
          >
            {/* EVALU part */}
            <motion.span
              layout
              layoutId="brand-logo-evalu"
              className="inline-block"
              animate={{
                x: isCollapsed ? -1 : 0,
              }}
              transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
            >
              {'EVALU'.split('').map((char, i) => (
                <motion.span key={`e-${i}`} className="inline-block">{char}</motion.span>
              ))}
            </motion.span>

            {/* Collapsing middle: ATE + (space) + INTELI */}
            <motion.span
              layout
              layoutId="brand-logo-mid"
              className="inline-block overflow-hidden whitespace-nowrap"
              animate={{
                width: isCollapsed ? 0 : 'auto',
                opacity: isCollapsed ? 0 : 1,
              }}
              transition={{ 
                width: { duration: TRANSITION_DURATION * 0.8, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: TRANSITION_DURATION * 0.5, ease: 'easeOut' }
              }}
            >
              <span className="inline-block px-1">
                {'ATE INTELI'}
              </span>
            </motion.span>

            {/* GENCE part */}
            <motion.span
              layout
              layoutId="brand-logo-gence"
              className="inline-block"
              animate={{
                x: isCollapsed ? 1 : 0,
              }}
              transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
            >
              {'GENCE'.split('').map((char, i) => (
                <motion.span key={`g-${i}`} className="inline-block">{char}</motion.span>
              ))}
            </motion.span>
          </div>
        </div>

        {/* Second line for "WITH" */}
        <div className="h-4 sm:h-8 md:h-12 mt-0 sm:mt-2 flex items-center justify-center text-xs sm:text-2xl md:text-4xl font-bold tracking-widest text-gray-400 dark:text-gray-500 w-full relative">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                key="with"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute whitespace-nowrap"
              >
                WITH
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
