'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FlaskConical, Box, Settings, Menu, X, Sparkles, HelpCircle, Shield, Home } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import ThemeToggle from './ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  const [showThemeToggle, setShowThemeToggle] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncThemeNav = () => {
      const stored = localStorage.getItem('evalugence_show_theme_nav');
      setShowThemeToggle(stored !== 'false');
    };

    syncThemeNav();
    
    // Listen for cross-component changes
    window.addEventListener('theme_nav_change', syncThemeNav);
    return () => window.removeEventListener('theme_nav_change', syncThemeNav);
  }, []);

  const navItems = [
    { name: 'Lab', href: '/lab', icon: FlaskConical },
    { name: 'Models', href: '/models', icon: Box },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const bottomNavItems = [
    { name: 'Lab', href: '/lab', icon: FlaskConical },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Models', href: '/models', icon: Box },
  ];

  const hamburgerItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Features', href: '/features', icon: Sparkles },
    { name: 'How it Works', href: '/how-it-works', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-[100] flex items-center justify-between px-4 md:px-6 transition-all">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <AnimatedLogo />
          </Link>
        </div>

        {/* Center Navigation - Desktop Only */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full transition-all ${
                  isActive 
                    ? 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-white' 
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Actions - Desktop Only */}
        <div className="hidden md:flex items-center gap-4">
          {showThemeToggle && <ThemeToggle />}
          
          <Link 
            href="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm group ${
              pathname === '/dashboard' 
                ? 'bg-black dark:bg-white text-white dark:text-black border border-transparent' 
                : 'bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 transition-transform group-hover:scale-110 ${pathname === '/dashboard' ? 'text-white dark:text-black' : 'text-gray-500 dark:text-gray-400'}`} />
            Dashboard
          </Link>
        </div>

        {/* Mobile Dropdown Menu Container */}
        <div ref={mobileMenuRef} className="md:hidden">
          {/* Hamburger Menu Toggle - Mobile Only */}
          <div className="flex md:hidden items-center absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 shadow-lg md:hidden flex flex-col z-[90]"
              >
                <div className="flex flex-col py-1">
                  {hamburgerItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0 font-medium"
                      >
                        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {item.name}
                      </Link>
                    );
                  })}
                  {showThemeToggle && (
                    <div className="flex items-center justify-between px-6 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <span>Theme</span>
                      <ThemeToggle />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 z-[100] flex items-center justify-around px-2 pb-safe">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-500 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {isActive && (
                <>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-blue-500 dark:bg-blue-300 rounded-b-full shadow-[0_0_8px_rgba(59,130,246,0.3)] dark:shadow-[0_0_8px_rgba(147,197,253,0.3)] z-10" />
                  <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-500/15 dark:bg-blue-300/15 blur-[12px] rounded-full pointer-events-none" />
                </>
              )}
              <div className="p-1 transition-colors">
                <Icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5px] mt-[2px]' : 'stroke-2'}`} />
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
