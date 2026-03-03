/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Menu, ShoppingBag, Moon, Sun } from 'lucide-react';
import maxFront from '../motionimages/max_front.png';
import maxSide from '../motionimages/max_side.png';
import manLeft from '../motionimages/man_left.png';
import iphoneImage from '../motionimages/iphone_image.png';
import appleLogo from '../motionimages/apple_logo.png';

function ThemeToggle({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center w-14 h-7 rounded-full p-1 transition-colors duration-500 ease-in-out \${
        isDark ? 'bg-black border border-white/20' : 'bg-gray-200 border border-gray-300 shadow-inner'
      }`}
      aria-label="Toggle Dark Mode"
    >
      {isDark && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-500" />
      )}
      <motion.div
        layout
        className={`z-10 flex items-center justify-center w-5 h-5 rounded-full shadow-md \${
          isDark ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500' : 'bg-white border border-gray-200'
        }`}
        animate={{
          x: isDark ? 28 : 0,
        }}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Hero animations
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.1], [1, 0.8]);

  // Window size tracking for responsive coordinates
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isBigScreen, setIsBigScreen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1280);
      setIsBigScreen(window.innerWidth >= 1280);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme support
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  // Viewport-relative measurements so positions scale across all screen sizes
  // Mobile uses vw for BOTH x and y since phone widths (360-430px) are more consistent than heights (667-932px)
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

  // Design section: headphones next to the person
  const targetX = isMobile ? vw * -0.025 : (isTablet ? vw * -0.015 : (isBigScreen ? -14 : -14));
  const targetY = isMobile ? vw * -0.43 : (isTablet ? vw * -0.35 : (isBigScreen ? -213 : -340));
  const targetScale = isMobile ? 0.53 : (isTablet ? 0.69 : (isBigScreen ? 0.43 : 0.70));

  // Tech Specs section: headphones next to the phone
  const techSpecsX = isMobile ? 0 : (isTablet ? vw * -0.1 : (isBigScreen ? -250 : -250));
  const techSpecsY = isMobile ? vw * -0.21 : (isTablet ? vw * -0.05 : (isBigScreen ? 50 : 50));
  const techSpecsScale = isMobile ? 1.05 : (isTablet ? 1 : (isBigScreen ? 1.1 : 1.1));

  // Hero: 0-0.3, transition to design: 0.3-0.5, hold on design: 0.5-0.65, trans to specs: 0.65-0.85, hold on specs: 0.85-1.0
  const imageX = useTransform(smoothProgress, [0, 0.3, 0.5, 0.65, 0.85, 1], [0, 0, targetX, targetX, techSpecsX, techSpecsX]);
  const imageY = useTransform(smoothProgress, [0, 0.3, 0.5, 0.65, 0.85, 1], [0, 0, targetY, targetY, techSpecsY, techSpecsY]);
  const imageScale = useTransform(smoothProgress, [0, 0.3, 0.5, 0.65, 0.85, 1], [1, 1, targetScale, targetScale, techSpecsScale, techSpecsScale]);

  // 3D Rotation and Image Swap
  // Rotate smoothly from front (0) to side (180) to front (360)
  const imageRotateY = useTransform(smoothProgress, [0, 0.1, 0.3, 0.5, 0.65, 0.85, 1], [0, 0, 90, 180, 180, 270, 360]);

  // Swap images quickly when reaching 90 degrees (around 0.3) and 270 degrees (around 0.75)
  // Front image is visible at 0 (hero) and 360 (specs). Hide it during 180 (design).
  const frontOpacity = useTransform(smoothProgress, [0, 0.25, 0.35, 0.65, 0.75, 1], [1, 1, 0, 0, 1, 1]);
  // Back image (side profile) is visible at 180 (design loop).
  const backOpacity = useTransform(smoothProgress, [0, 0.25, 0.35, 0.65, 0.75, 1], [0, 0, 1, 1, 0, 0]);

  // Content animations for Design section (bubbles)
  // They appear after the headphones land at progress 0.5, fade out when leaving at 0.65
  const bubble1Opacity = useTransform(smoothProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
  const bubble2Opacity = useTransform(smoothProgress, [0.55, 0.6, 0.65, 0.7], [0, 1, 1, 0]);
  const bubble3Opacity = useTransform(smoothProgress, [0.6, 0.65, 0.65, 0.7], [0, 1, 1, 0]);

  // Fade out the man background entirely when moving to Tech Specs
  const manOpacity = useTransform(smoothProgress, [0.65, 0.75], [1, 0]);

  // Fade in the phone ONLY when the headphones reach the bottom
  const phoneOpacity = useTransform(smoothProgress, [0.8, 0.9], [0, 1]);
  const specsTextOpacity = useTransform(smoothProgress, [0.85, 0.9], [0, 1]);
  const techBubble1Opacity = useTransform(smoothProgress, [0.88, 0.92], [0, 1]);
  const techBubble2Opacity = useTransform(smoothProgress, [0.9, 0.95], [0, 1]);
  const calloutOpacity = useTransform(smoothProgress, [0.92, 0.98], [0, 1]);

  return (
    <>
      <div ref={containerRef} className="relative min-h-[600vh] bg-[#f5f5f7] dark:bg-[#000000] transition-colors duration-700">
        {/* Sticky Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-[20px] border-b border-gray-100 dark:border-white/10 transition-colors duration-500">
          <div className="flex items-center gap-8">
            <img src={appleLogo} alt="Apple Logo" className={`w-6 h-6 transition-all duration-500 \${isDark ? 'invert' : ''}`} />
            <span className="hidden md:block text-sm font-semibold tracking-tight dark:text-white transition-colors duration-500">AirPods Max</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-xs font-medium hover:opacity-70 transition-opacity dark:text-gray-300 hidden md:block">Overview</button>
            <button className="text-xs font-medium hover:opacity-70 transition-opacity dark:text-gray-300 hidden md:block">Tech Specs</button>

            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-blue-700 transition-colors">
              Buy
            </button>
            <Menu className="w-5 h-5 md:hidden dark:text-white transition-colors" />
          </div>
        </nav>

        {/* Hero Section */}
        <section className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden z-50">
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="text-center z-10"
          >
            <h1 className="text-[12vw] font-bold tracking-tighter leading-none dark:text-white transition-colors duration-700">
              AirPods<br />Max
            </h1>
          </motion.div>

          {/* Central Animated Image Container */}
          <motion.div
            style={{
              x: imageX,
              y: imageY,
              scale: imageScale,
              rotateY: imageRotateY,
              perspective: 1000
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto z-30"
          >
            <motion.div
              className="relative w-[400px] md:w-[600px] h-[400px] md:h-[600px] cursor-pointer"
              whileHover={isMobile ? {} : { opacity: 0 }}
              whileTap={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Front Image */}
              <motion.img
                src={maxFront}
                alt="AirPods Max Front"
                style={{ opacity: frontOpacity }}
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
              {/* Back/Side Image */}
              <motion.img
                src={maxSide}
                alt="AirPods Max Side"
                style={{
                  opacity: backOpacity,
                  rotateY: 180 // Flip the back image so it faces correctly when the container is rotated 180
                }}
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Design Section (The person looking left) */}
        <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none">

          {/* Background Image of the Person */}
          <motion.div
            style={{ opacity: manOpacity }}
            className="absolute inset-0 flex items-center justify-center p-10 max-w-7xl mx-auto w-full pointer-events-none -z-10"
          >
            <img
              src={manLeft}
              alt="Person left"
              className="w-full max-w-2xl h-full object-contain"
            />
          </motion.div>

          {/* Text Bubbles overlay container */}
          <div className="relative w-full h-full max-w-7xl mx-auto z-10">

            {/* Bubble 1: Headband */}
            <motion.div
              style={{ opacity: bubble1Opacity }}
              className="absolute left-[10%] md:left-[20%] top-[45%] bg-white/90 dark:bg-zinc-800/80 backdrop-blur border border-gray-100 dark:border-white/10 rounded-3xl p-5 max-w-[280px] shadow-lg pointer-events-auto transition-colors duration-500"
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug transition-colors">
                The canopy spanning the headband is made from a breathable knit mesh, distributing weight to reduce on-head pressure.
              </p>
            </motion.div>

            {/* Bubble 2: Stainless Steel Frame */}
            <motion.div
              style={{ opacity: bubble2Opacity }}
              className="absolute right-[10%] md:right-[15%] top-[25%] bg-white/90 dark:bg-zinc-800/80 backdrop-blur border border-gray-100 dark:border-white/10 rounded-3xl p-5 max-w-[260px] shadow-lg pointer-events-auto transition-colors duration-500"
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug transition-colors">
                <span className="font-bold dark:text-white">The stainless steel frame</span> is wrapped with a soft-to-the-touch material for a remarkable combination of strength, flexibility and comfort.
              </p>
            </motion.div>

            {/* Bubble 3: Telescoping arms */}
            <motion.div
              style={{ opacity: bubble3Opacity }}
              className="absolute right-[10%] md:right-[20%] bottom-[25%] bg-white/90 dark:bg-zinc-800/80 backdrop-blur border border-gray-100 dark:border-white/10 rounded-3xl p-5 max-w-[260px] shadow-lg pointer-events-auto transition-colors duration-500"
            >
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug transition-colors">
                <span className="font-bold dark:text-white">Telescoping arms</span> smoothly extend and stay where you set them, for a consistent fit and seal.
              </p>
            </motion.div>

          </div>
        </section>

        {/* Tech Specs Section */}
        <section className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden pointer-events-none">

          {/* Background Image of the Phone */}
          <motion.div
            style={{ opacity: phoneOpacity }}
            className={`absolute inset-0 flex items-center justify-center p-4 md:p-10 max-w-7xl mx-auto w-full pointer-events-none -z-10 ${isMobile ? 'ml-[0px] mt-[100px]' : isTablet ? 'ml-[300px] mt-[50px]' : 'ml-[500px]'}`}
          >
            <div className={`relative ${isMobile ? 'w-[200px] h-[400px]' : isTablet ? 'w-[250px] h-[500px]' : 'w-[300px] h-[600px]'} flex items-center justify-center`}>
              <img
                src={iphoneImage}
                alt="iPhone Connection Screen"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Text Bubbles overlay container */}
          <div className="relative w-full h-full max-w-7xl mx-auto z-10">

            {/* Bubble: Connection Specs */}
            <motion.div
              style={{ opacity: specsTextOpacity }}
              className={`absolute bg-white/90 dark:bg-zinc-800/80 backdrop-blur border border-gray-100 dark:border-white/10 rounded-3xl p-5 shadow-lg pointer-events-auto transition-all duration-500 ${isMobile ? 'top-[35%] left-[5%] right-[5%] z-20' : isTablet ? 'top-[38%] left-[50%] max-w-[280px] z-20' : 'top-[40%] left-[55%] max-w-[280px]'}`}
            >
              <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug transition-colors">
                AirPods Max connect immediately to your iPhone or iPad. To pair, simply place AirPods Max near your device and tap Connect on your screen.
              </p>
            </motion.div>

            {/* Bubble: Battery Life */}
            <motion.div
              style={{ opacity: techBubble1Opacity }}
              className={`absolute bg-white/90 dark:bg-zinc-800/80 backdrop-blur border border-gray-100 dark:border-white/10 rounded-3xl p-5 shadow-lg pointer-events-auto transition-all duration-500 ${isMobile ? 'bottom-[18%] left-[4%] w-[44%] z-20' : isTablet ? 'bottom-[28%] left-[8%] max-w-[240px] z-20' : 'bottom-[30%] left-[10%] max-w-[240px]'}`}
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm md:text-base transition-colors">20 Hours</h4>
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 leading-snug transition-colors">
                Up to 20 hours of listening time with Active Noise Cancellation or Spatial Audio enabled.
              </p>
            </motion.div>

            {/* Bubble: Immersive Sound */}
            <motion.div
              style={{ opacity: techBubble2Opacity }}
              className={`absolute bg-white/90 dark:bg-zinc-800/80 backdrop-blur border border-gray-100 dark:border-white/10 rounded-3xl p-5 shadow-lg pointer-events-auto transition-all duration-500 ${isMobile ? 'bottom-[4%] right-[4%] w-[44%] z-20' : isTablet ? 'bottom-[12%] left-[35%] max-w-[250px] z-20' : 'bottom-[15%] left-[45%] max-w-[250px]'}`}
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm md:text-base transition-colors">Immersive Sound</h4>
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 leading-snug transition-colors">
                Industry-leading Active Noise Cancellation counters external sound with equal anti-noise.
              </p>
            </motion.div>

            {/* Hardware Callouts (Lines pointing to the headphones on the left) */}
            <motion.div
              style={{ opacity: calloutOpacity }}
              className="absolute top-[25%] pointer-events-none left-[15%] md:left-[20%]"
            >
              {/* Digital Crown Callout */}
              <div className="relative mb-12 md:mb-16">
                <div className="absolute right-[-2.5rem] top-3 w-4 md:w-10 border-b-2 border-gray-400 dark:border-gray-500"></div>
                <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-gray-200 dark:border-white/10 rounded-full font-bold text-gray-700 dark:text-gray-300 shadow-sm transition-colors duration-500 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs ml-[-2rem] md:ml-[-4rem]">
                  Digital Crown
                </div>
              </div>

              {/* Noise Control Callout */}
              <div className="relative">
                <div className="absolute right-[-4.5rem] top-3 w-8 md:w-16 border-b-2 border-gray-400 dark:border-gray-500"></div>
                <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-gray-200 dark:border-white/10 rounded-full font-bold text-gray-700 dark:text-gray-300 shadow-sm transition-colors duration-500 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs ml-[-0.5rem] md:ml-[-2rem]">
                  Noise Control
                </div>
              </div>
            </motion.div>

          </div>
        </section>

      </div>
    </>
  );
}
