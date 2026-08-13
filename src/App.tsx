import React, { useState, useEffect, useCallback } from 'react';
import logo from './assets/logo.png';
import './App.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const COLORS = ['#ff2a2a', '#ff7a2a', '#ffc52a', '#43ff2a', '#2a88ff', '#9a2aff', '#ff2a88'];

function App() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hue, setHue] = useState(0);
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const interval = setInterval(() => {
      setHue((h) => (h + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: e.clientX,
      y: e.clientY,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    
    setParticles((prev) => [...prev, ...newParticles].slice(-50)); // keep max 50 particles
  }, []);

  return (
    <div 
      className="app-container" 
      style={{ '--bg-hue': hue } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <div 
        className="ambient-glow" 
        style={{ left: mousePos.x, top: mousePos.y }}
      />
      
      {particles.map((p) => (
        <div 
          key={p.id} 
          className="particle" 
          style={{ 
            left: p.x, 
            top: p.y, 
            backgroundColor: p.color,
            '--tx': `${(Math.random() - 0.5) * 300}px`,
            '--ty': `${(Math.random() - 0.5) * 300}px`,
          } as React.CSSProperties} 
        />
      ))}

      <div className="center-content">
        <img src={logo} alt="StimApp Logo" className="logo" />
        <h1 className="title">StimApp</h1>
        <p className="subtitle">Touch anywhere to interact</p>
      </div>
    </div>
  );
}

export default App;
