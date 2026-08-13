import React, { useState, useEffect, useCallback, useRef } from 'react';
import logo from './assets/logo.png';
import './App.css';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

const COLORS = ['#ff2a2a', '#ff7a2a', '#ffc52a', '#43ff2a', '#2a88ff', '#9a2aff', '#ff2a88'];

type VisualMode = 'particles' | 'fluid' | 'grid';

function App() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [liquidDrops, setLiquidDrops] = useState<{id: number, x: number, y: number}[]>([]);
  const [hue, setHue] = useState(0);
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visualMode, setVisualMode] = useState<VisualMode>('particles');
  const lastDropTime = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue((h) => (h + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (visualMode === 'fluid' && hasInteracted) {
      const now = Date.now();
      if (now - lastDropTime.current > 30) {
        setLiquidDrops(prev => [...prev, { id: now, x: e.clientX, y: e.clientY }].slice(-40));
        lastDropTime.current = now;
      }
    }
  }, [visualMode, hasInteracted]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.menu-container') || (e.target as HTMLElement).closest('.menu-toggle')) {
      return;
    }
    setHasInteracted(true);
    
    if (visualMode === 'particles') {
      const newParticles: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
      setParticles((prev) => [...prev, ...newParticles].slice(-60));
    } else if (visualMode === 'fluid') {
      const now = Date.now();
      setLiquidDrops(prev => [...prev, { id: now, x: e.clientX, y: e.clientY }].slice(-40));
    }
  }, [visualMode]);

  return (
    <div 
      className={`app-container mode-${visualMode}`}
      style={{ '--bg-hue': hue } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      {/* Grid Mode Background */}
      {visualMode === 'grid' && (
        <div className="neon-grid-container" style={{ 
          transform: `rotateX(60deg) translateY(${mousePos.y * 0.1}px) translateX(${(mousePos.x - window.innerWidth/2) * -0.05}px)`
        }}>
          <div className="neon-grid"></div>
        </div>
      )}

      {/* Fluid Mode (Metaballs) */}
      {visualMode === 'fluid' && (
        <div className="liquid-container">
          <div 
            className="liquid-cursor" 
            style={{ left: mousePos.x, top: mousePos.y }}
          />
          {liquidDrops.map(drop => (
            <div key={drop.id} className="liquid-drop" style={{ left: drop.x, top: drop.y }} />
          ))}
        </div>
      )}

      <div 
        className="ambient-glow" 
        style={{ left: mousePos.x, top: mousePos.y }}
      />
      
      {/* Particles Mode */}
      {visualMode === 'particles' && particles.map((p) => (
        <div 
          key={p.id} 
          className="particle" 
          style={{ 
            left: p.x, 
            top: p.y, 
            backgroundColor: p.color,
            '--tx': `${(Math.random() - 0.5) * 400}px`,
            '--ty': `${(Math.random() - 0.5) * 400}px`,
          } as React.CSSProperties} 
        />
      ))}

      <div className={`center-content ${hasInteracted ? 'dimmed' : ''}`}>
        <img src={logo} alt="StimApp Logo" className="logo" />
        <h1 className="title">StimApp</h1>
        <p className="subtitle">{hasInteracted ? 'Sensory Active' : 'Touch anywhere to interact'}</p>
      </div>

      <button 
        className={`menu-toggle ${menuOpen ? 'open' : ''}`} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <div className={`menu-container ${menuOpen ? 'open' : ''}`}>
        <h2>Sensory Options</h2>
        <div className="menu-group">
          <label>Visuals</label>
          <button 
            className={`menu-btn ${visualMode === 'particles' ? 'active' : ''}`}
            onClick={() => setVisualMode('particles')}
          >
            Particles
          </button>
          <button 
            className={`menu-btn ${visualMode === 'fluid' ? 'active' : ''}`}
            onClick={() => setVisualMode('fluid')}
          >
            Fluid Ripples
          </button>
          <button 
            className={`menu-btn ${visualMode === 'grid' ? 'active' : ''}`}
            onClick={() => setVisualMode('grid')}
          >
            Neon Grid
          </button>
        </div>
        <div className="menu-group">
          <label>Audio (Coming Soon)</label>
          <button className="menu-btn" disabled>White Noise</button>
          <button className="menu-btn" disabled>Binaural Beats</button>
        </div>
      </div>
    </div>
  );
}

export default App;
