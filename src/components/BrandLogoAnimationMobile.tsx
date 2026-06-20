'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const TRANSITION_DURATION = 1.5;
const HOLD_DURATION = 3500;

export default function BrandLogoAnimationMobile() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => setIsCollapsed(true), HOLD_DURATION);

    return () => clearTimeout(timer);
  }, [isInView]);

  return (
    <div ref={ref} className="flex min-h-[80vh] items-start pt-[35vh] justify-center px-4 select-none">
      <div className="flex flex-col items-start w-max">
        
        {/* Main Animated Text Grid */}
        <motion.div 
          layout
          layoutId="brand-mobile-grid"
          className="grid grid-cols-2 text-3xl sm:text-4xl font-semibold tracking-widest text-black dark:text-white relative"
          style={{ fontFamily: 'inherit' }}
        >
          {/* Ghost to preserve exactly Col 1's width when INTELI is removed */}
          <div className="col-start-1 row-start-1 flex justify-end invisible whitespace-nowrap" aria-hidden="true">
            <span className="inline-block">
              {'INTELI'.split('').map((char, i) => (
                <span key={`ghost-${i}`} className="inline-block">{char}</span>
              ))}
            </span>
          </div>

          {/* Top Left: EVALU */}
          <motion.div 
            layout 
            layoutId="brand-mobile-tl"
            className="col-start-1 row-start-1 flex justify-end whitespace-nowrap"
          >
            <motion.span layout layoutId="brand-mobile-evalu" className="inline-block relative">
              {'EVALU'.split('').map((char, i) => (
                <motion.span key={`e-${i}`} className="inline-block">{char}</motion.span>
              ))}

              {/* Subtitle rigidly anchored to the grid */}
              <motion.div 
                className="absolute left-1/2 -translate-x-1/2 tracking-widest text-2xl sm:text-3xl font-bold text-gray-400 dark:text-gray-500 flex whitespace-nowrap pointer-events-none"
                animate={{ top: isCollapsed ? '120%' : '220%' }}
                transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      key="with"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="whitespace-nowrap"
                    >
                      WITH
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.span>
          </motion.div>

          {/* Top Right: ATE */}
          <motion.div 
            layout
            layoutId="brand-mobile-tr"
            className="col-start-2 row-start-1 flex justify-start whitespace-nowrap overflow-hidden pl-0.5"
            animate={{ width: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
            transition={{ 
              width: { duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: TRANSITION_DURATION * 0.8, ease: 'easeOut' }
            }}
          >
            <motion.span 
              layout 
              layoutId="brand-mobile-ate" 
              className="inline-block"
              animate={{ x: isCollapsed ? 30 : 0 }}
              transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
            >
              {'ATE'.split('').map((char, i) => (
                <motion.span key={`a-${i}`} className="inline-block">{char}</motion.span>
              ))}
            </motion.span>
          </motion.div>

          {/* Bottom Left: INTELI */}
          <motion.div 
            layout
            layoutId="brand-mobile-bl"
            className="col-start-1 row-start-2 flex justify-end whitespace-nowrap overflow-hidden pr-0.5"
            animate={{ width: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
            transition={{ 
              width: { duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: TRANSITION_DURATION * 0.8, ease: 'easeOut' }
            }}
          >
            <motion.span layout layoutId="brand-mobile-inteli" className="inline-block">
              {'INTELI'.split('').map((char, i) => (
                <motion.span key={`i-${i}`} className="inline-block">{char}</motion.span>
              ))}
            </motion.span>
          </motion.div>

          {/* Bottom Right: GENCE */}
          <motion.div 
            layout 
            layoutId="brand-mobile-br"
            className={`flex justify-start whitespace-nowrap col-start-2 ${isCollapsed ? 'row-start-1' : 'row-start-2'}`}
            transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span layout layoutId="brand-mobile-gence" className="inline-block relative">
              {'GENCE'.split('').map((char, i) => (
                <motion.span key={`g-${i}`} className="inline-block">{char}</motion.span>
              ))}
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Spacer to maintain overall block height since subtitle is now absolute */}
        <div className="h-12 w-full"></div>
      </div>
    </div>
  );
}
