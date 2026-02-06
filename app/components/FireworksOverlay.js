"use client";
import React, { useEffect, useRef } from 'react';
import { Fireworks } from 'fireworks-js';

const FireworksOverlay = ({ active, onComplete }) => {
  const containerRef = useRef(null);
  const fireworksRef = useRef(null);

  useEffect(() => {
    if (active && containerRef.current && !fireworksRef.current) {
        
      const fireworks = new Fireworks(containerRef.current, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 50,
        traceLength: 3,
        traceSpeed: 10,
        explosion: 5,
        intensity: 30,
        flickering: 50,
        lineStyle: 'round',
        hue: {
          min: 0,
          max: 360
        },
        delay: {
          min: 15,
          max: 30
        },
        rocketsPoint: {
          min: 50,
          max: 50
        },
        lineWidth: {
          explosion: {
            min: 1,
            max: 3
          },
          trace: {
            min: 1,
            max: 2
          }
        },
        brightness: {
          min: 50,
          max: 80
        },
        decay: {
          min: 0.015,
          max: 0.03
        },
        mouse: {
          click: false,
          move: false,
          max: 1
        }
      });
      
      fireworks.start();
      fireworksRef.current = fireworks;

      // Stop after 5 seconds
      const timer = setTimeout(() => {
          fireworks.waitStop(true).then(() => {
             fireworksRef.current = null;
             if (onComplete) onComplete();
          });
      }, 5000);

      return () => {
          clearTimeout(timer);
          if (fireworksRef.current) {
             fireworksRef.current.stop(true);
             fireworksRef.current = null;
          }
      };
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div 
        ref={containerRef} 
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 99999,
        }}
    />
  );
};

export default FireworksOverlay;
