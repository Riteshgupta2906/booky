"use client";
import { useState, useRef,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FireworksOverlay from "../components/FireworksOverlay";
import Image from "next/image";

const FUNNY_TEXTS = [
  "Pls click on yes",
  "Are you sure u want to do this?",
  "I k u dont, pls click on yes",
  "Don't break my heart 💔",
  "Think about it...",
  "Really? No? 🥺",
  "Just one click on Yes!",
  "I'll buy you chocolate 🍫",
  "I know u love me the most🚫",
];

const DOG_IMAGES = [
  "/dogImages/cry.png",
  "/dogImages/dog.png",
  "/dogImages/dog2.png",
  "/dogImages/sad.png",
  "/dogImages/sad1.png",
  "/dogImages/sad2.png"
];

// Floating hearts component
// Floating hearts component
const FloatingHearts = () => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    setHearts(Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      size: 20 + Math.random() * 30,
      opacity: 0.3 + Math.random() * 0.4
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: heart.left,
            bottom: -50,
            fontSize: heart.size,
            opacity: heart.opacity
          }}
          animate={{
            y: [-50, -1200],
            x: [0, Math.sin(heart.id) * 100],
            rotate: [0, 360]
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          💗
        </motion.div>
      ))}
    </div>
  );
};

// Decorative doodle elements
const DoodleDecorations = () => (
  <>
    {/* Floating stars */}
    <motion.div
      className="absolute top-20 left-10 text-4xl"
      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      ✨
    </motion.div>
    <motion.div
      className="absolute top-32 right-16 text-3xl"
      animate={{ rotate: -360, scale: [1, 1.3, 1] }}
      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
    >
      ⭐
    </motion.div>
    <motion.div
      className="absolute bottom-32 left-20 text-3xl"
      animate={{ rotate: 360, y: [-10, 10, -10] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      💫
    </motion.div>
    <motion.div
      className="absolute bottom-20 right-10 text-4xl"
      animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    >
      💝
    </motion.div>
  </>
);

export default function ValentinePage() {
  const [showFireworks, setShowFireworks] = useState(false);
  const [yesPressed, setYesPressed] = useState(false);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFunnyText, setCurrentFunnyText] = useState(FUNNY_TEXTS[0]);
  const [currentDogImage, setCurrentDogImage] = useState(DOG_IMAGES[0]);
  const [clickCount, setClickCount] = useState(0);

  const containerRef = useRef(null);

  // Calculate YES button size based on click count
  const yesButtonSize = 1 + clickCount * 0.1;

  const handleNoClick = () => {
    // Trigger haptic feedback (vibration) for 5 seconds with a heartbeat pattern
    if (typeof window !== 'undefined' && navigator.vibrate) {
      // Heartbeat pattern: strong pulse, pause, weak pulse, pause (repeated for 5 seconds)
      // Pattern: [vibrate, pause, vibrate, pause, ...] in milliseconds
      const heartbeatPattern = [200, 100, 100, 100, 200, 500]; // One heartbeat cycle
      const duration = 5000; // 5 seconds total
      const repetitions = Math.floor(duration / heartbeatPattern.reduce((a, b) => a + b, 0));
      const fullPattern = Array(repetitions).fill(heartbeatPattern).flat();

      navigator.vibrate(fullPattern);
    }

    // Random position within window bounds - keep button fully visible
    if (typeof window !== 'undefined') {
        const buttonWidth = 160; // w-40 = 10rem = 160px
        const buttonHeight = 60; // approximate button height
        
        // Define safe boundary (smaller area on mobile)
        // On mobile we want to keep it relatively close to center so it doesn't go off screen
        // or behind UI elements
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Limit movement to a "safe zone"
        // On mobile (narrow screen), limit X movement significantly
        const safeMarginX = Math.min(viewportWidth * 0.4, 150); // Don't go too far horizontally
        const safeMarginY = Math.min(viewportHeight * 0.4, 250); // Allow more vertical movement
        
        // Calculate max translation allowed from center
        // The button starts somewhat centered, so we translate relative to its origin
        const maxTranslateX = (viewportWidth / 2) - (buttonWidth / 2) - 20;
        const maxTranslateY = (viewportHeight / 2) - (buttonHeight / 2) - 20;

        // Use the stricter constraint
        const boundX = Math.min(safeMarginX, maxTranslateX);
        const boundY = Math.min(safeMarginY, maxTranslateY);

        // Calculate random position within these safe bounds
        const randomX = (Math.random() * 2 - 1) * boundX; 
        const randomY = (Math.random() * 2 - 1) * boundY;

        setNoButtonPosition({ x: randomX, y: randomY });
    }

    // Cycle text
    const nextTextIndex = (clickCount) % FUNNY_TEXTS.length;
    setCurrentFunnyText(FUNNY_TEXTS[nextTextIndex]);

    // Random dog image
    const randomImage = DOG_IMAGES[Math.floor(Math.random() * DOG_IMAGES.length)];
    setCurrentDogImage(randomImage);

    setClickCount(prev => prev + 1);
    setModalOpen(true);
  };

  const handleYesClick = () => {
    setYesPressed(true);
    setShowFireworks(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-purple-50 flex flex-col items-center justify-center p-4 overflow-hidden relative" ref={containerRef}>
      <FloatingHearts />
      <DoodleDecorations />
      <FireworksOverlay active={showFireworks} onComplete={() => setShowFireworks(false)} />

      <main className="flex flex-col items-center text-center z-10 w-full max-w-md">

        {!yesPressed ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="sketch-card bg-white p-8 md:p-12 w-full flex flex-col items-center transform rotate-1 relative overflow-visible"
            style={{
              boxShadow: '12px 12px 0px rgba(255, 105, 135, 0.3), 24px 24px 0px rgba(255, 182, 193, 0.2)',
              border: '4px solid #333'
            }}
          >
            {/* Decorative corner hearts */}
            <motion.div
              className="absolute -top-4 -left-4 text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💕
            </motion.div>
            <motion.div
              className="absolute -top-4 -right-4 text-4xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              💕
            </motion.div>

            <motion.h1
              className="text-3xl md:text-5xl font-bold mb-8 text-[var(--ink)] leading-tight"
              style={{ fontFamily: 'var(--font-gaegu)' }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Hey Akshuu, <br/>
              will you be my <span className="text-red-500 underline decoration-wavy decoration-red-300 relative">
                valentine
                <motion.span
                  className="absolute -right-8 top-0 text-2xl"
                  animate={{ rotate: [0, 20, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  
                </motion.span>
              </span> pls? 🌹
            </motion.h1>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full relative h-32">
               {/* YES BUTTON */}
               <motion.button
                whileHover={{ scale: 1.15, rotate: [0, -3, 3, 0] }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYesClick}
                animate={{ scale: yesButtonSize }}
                className="sketch-button bg-gradient-to-br from-green-100 to-green-200 text-green-700 text-2xl font-bold px-8 py-3 w-40 hover:from-green-200 hover:to-green-300 transition-all z-20 relative shadow-lg"
                style={{
                  fontFamily: 'var(--font-gaegu)',
                  border: '3px solid #15803d',
                  boxShadow: '4px 4px 0px #15803d'
                }}
              >
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  YES! 💖
                </motion.span>
              </motion.button>

              {/* NO BUTTON */}
              <motion.button
                animate={{ x: noButtonPosition.x, y: noButtonPosition.y }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ rotate: [0, 5, -5, 0] }}
                onClick={handleNoClick}
                className="sketch-button bg-gradient-to-br from-red-100 to-red-200 text-red-700 text-2xl font-bold px-8 py-3 w-40 hover:from-red-200 hover:to-red-300 transition-all z-20"
                style={{
                  fontFamily: 'var(--font-gaegu)',
                  border: '3px solid #991b1b',
                  boxShadow: '4px 4px 0px #991b1b'
                }}
              >
                No 😢
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: -1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="sketch-card bg-gradient-to-br from-pink-50 to-purple-100 p-8 md:p-12 w-full flex flex-col items-center transform relative overflow-visible"
            style={{
              boxShadow: '12px 12px 0px rgba(219, 39, 119, 0.3), 24px 24px 0px rgba(236, 72, 153, 0.2)',
              border: '4px solid #333'
            }}
          >
             {/* Celebration elements */}
             <motion.div
               className="absolute -top-10 left-1/2 transform -translate-x-1/2"
               animate={{ y: [0, -20, 0], rotate: [0, 360] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               <span className="text-6xl">🎊</span>
             </motion.div>

             <motion.h1
               className="text-4xl md:text-6xl font-bold text-[var(--ink)] mb-4"
               style={{ fontFamily: 'var(--font-gaegu)' }}
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 1, repeat: Infinity }}
             >
               YAYYYYY! 🎉
             </motion.h1>
             <p className="text-2xl md:text-3xl text-[var(--ink)] font-bold mb-4" style={{ fontFamily: 'var(--font-gaegu)' }}>
              I knew you would make the right decision!
             </p>
             <motion.div
               className="text-6xl mt-4 flex gap-4"
               animate={{ y: [0, -15, 0] }}
               transition={{ duration: 1.5, repeat: Infinity }}
             >
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>😘</motion.span>
                <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}>🥰</motion.span>
                <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}>💏</motion.span>
             </motion.div>
             
             {/* Email Button */}
             <motion.a
               href={`mailto:rkgritesh50@gmail.com?subject=My answer is yes my love&body=My answer is yes my love%0D%0A%0D%0Alove ,%0D%0Aakshuuu`}
               className="sketch-button mt-8 px-8 py-3 bg-blue-100 text-blue-700 text-xl font-bold flex items-center gap-2 hover:bg-blue-200"
               style={{ 
                 fontFamily: 'var(--font-gaegu)',
                 textDecoration: 'none',
                 display: 'inline-flex'
               }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               animate={{ y: [0, -5, 0] }}
               transition={{ duration: 2, repeat: Infinity, delay: 1 }}
             >
               <span>Send Yes 💌</span>
             </motion.a>
          </motion.div>
        )}

      </main>

      {/* Modal for No Click */}
      <AnimatePresence>
        {modalOpen && !yesPressed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => {
              setModalOpen(false);
              // Stop vibration when clicking outside modal
              if (typeof window !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(0);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10, y: 50 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.5, rotate: 10, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white to-pink-50 p-8 max-w-sm w-full relative flex flex-col items-center overflow-visible"
              style={{
                boxShadow: "10px 10px 0px rgba(239, 68, 68, 0.4), 20px 20px 0px rgba(251, 113, 133, 0.2)",
                border: "4px solid #333",
                borderRadius: "20px"
              }}
            >
              {/* Decorative crying elements */}
              <motion.div
                className="absolute -top-6 -left-6 text-3xl"
                animate={{ y: [0, 10, 0], rotate: [0, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💧
              </motion.div>
              <motion.div
                className="absolute -top-6 -right-6 text-3xl"
                animate={{ y: [0, 10, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                💧
              </motion.div>

              <motion.div
                className="w-36 h-36 relative mb-4 rounded-full overflow-hidden"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  border: '3px dashed #ec4899',
                  padding: '8px'
                }}
              >
                  <Image
                    src={currentDogImage}
                    alt="Sad dog"
                    fill
                    className="object-contain"
                  />
              </motion.div>

              {/* <motion.h3
                className="text-3xl font-bold mb-3 text-[var(--ink)] text-center"
                style={{ fontFamily: 'var(--font-gaegu)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Wait a min... 🧐
              </motion.h3> */}

              <motion.p
                className="text-2xl text-center mb-6 font-bold bg-yellow-100 px-4 py-2 rounded-lg"
                style={{
                  fontFamily: 'var(--font-gaegu)',
                  border: '2px solid #854d0e',
                  boxShadow: '3px 3px 0px #854d0e'
                }}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {currentFunnyText}
              </motion.p>

              <motion.button
                onClick={() => {
                  setModalOpen(false);
                  // Stop vibration when modal closes
                  if (typeof window !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(0);
                  }
                }}
                whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                whileTap={{ scale: 0.95 }}
                className="sketch-button bg-gradient-to-br from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 text-yellow-800 text-xl font-bold px-8 py-3"
                style={{
                  fontFamily: 'var(--font-gaegu)',
                  border: '3px solid #854d0e',
                  boxShadow: '4px 4px 0px #854d0e'
                }}
              >
                Okay, I&apos;ll try again 🙄
              </motion.button>

              {/* Decorative broken heart */}
              <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-5xl"
                animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💔
              </motion.div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
