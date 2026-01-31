"use client";
import { useEffect, useRef, useCallback } from "react";

const colors = [
  "#FFADAD", "#FFD6A5", "#FDFFB6", "#CAFFBF", 
  "#9BF6FF", "#A0C4FF", "#BDB2FF", "#FFC6FF"
];

export default function WheelTab({ 
  books, 
  isSpinning, 
  onSpin, 
  triggerHaptic, 
  activeBook,
  onWin
}) {
  const canvasRef = useRef(null);
  const currentRotationRef = useRef(0);
  const isSpinningRef = useRef(false);

  // Draw wheel function
  const drawWheel = useCallback((rotation = currentRotationRef.current) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 5;
    const sliceAngle = (2 * Math.PI) / books.length;

    ctx.clearRect(0, 0, size, size);

    books.forEach((book, i) => {
      const angle = i * sliceAngle + rotation;
      const color = colors[i % colors.length];

      // 1. Define Path and Fill
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();

      // 2. Draw Border
      ctx.strokeStyle = "#2d3436";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Draw Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#2d3436";
      const fontFamily = typeof window !== 'undefined' ? getComputedStyle(document.body).fontFamily : "cursive";
      ctx.font = `bold 18px ${fontFamily}`;

      let displayTitle = book.length > 16 ? book.substring(0, 13) + "..." : book;
      ctx.fillText(displayTitle, radius - 20, 6);
      ctx.restore();
    });

    // Center Pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#2d3436";
    ctx.fill();
    ctx.stroke();
  }, [books]);

  // Initial draw
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const animateSpin = useCallback(() => {
    if (isSpinningRef.current) return;
    
    isSpinningRef.current = true;
    onWin(null);
    triggerHaptic(50);

    const extraSpins = 8 + Math.random() * 8;
    const startRotation = currentRotationRef.current;
    const targetRotation = startRotation + (extraSpins * 2 * Math.PI);
    const startTime = performance.now();
    const duration = 5000;

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      currentRotationRef.current = startRotation + (targetRotation - startRotation) * easeOut;
      drawWheel(currentRotationRef.current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentRotationRef.current = targetRotation % (2 * Math.PI);
        isSpinningRef.current = false;
        onSpin(false);
        triggerHaptic([50, 50, 50]);
        
        // Determine Winner
        const rotationDeg = (currentRotationRef.current * 180 / Math.PI) % 360;
        const sliceDeg = 360 / books.length;
        let idx = Math.floor((270 - rotationDeg + 360) % 360 / sliceDeg);
        onWin(books[idx]);
      }
    };
    
    requestAnimationFrame(animate);
  }, [books, onSpin, onWin, triggerHaptic, drawWheel]);

  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      animateSpin();
    }
  }, [isSpinning, animateSpin]);

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2">
      <header className="text-center mb-4 px-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--ink)]" style={{fontFamily: 'var(--font-gaegu)'}}>
          TBR Spinner
        </h1>
        <p className="text-base md:text-xl font-bold text-[var(--ink)] opacity-80 my-2">
          What&apos;s the next story?
        </p>
      </header>

      {/* Wheel */}
      <div 
        className={`relative w-[260px] h-[260px] md:w-[320px] md:h-[320px] max-w-[90vw] max-h-[90vw] bg-white p-[5px] border-[3px] border-[var(--ink)] mb-8 transition-transform ${isSpinning ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
        style={{
          borderRadius: "53% 47% 52% 48% / 51% 46% 53% 49%",
          boxShadow: "5px 5px 0px rgba(45, 52, 54, 0.4)"
        }}
      >
        {/* Styled Pointer */}
        <div className="absolute -top-[25px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
          <div className="w-8 h-10 bg-[#FF6B6B] border-[3px] border-[var(--ink)] rounded-b-full rounded-t-md shadow-sm relative z-10 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full opacity-50 mb-2"></div>
          </div>
        </div>
        
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="w-full h-full"
          style={{ borderRadius: "50%" }}
        />
      </div>
    </div>
  );
}