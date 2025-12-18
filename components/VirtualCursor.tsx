
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { PetSkinId } from '../types';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  shape?: 'circle' | 'square' | 'star' | 'paw';
}

interface VirtualCursorProps {
  petSkin: PetSkinId;
}

const VirtualCursor: React.FC<VirtualCursorProps> = ({ petSkin }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trailingPos, setTrailingPos] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const requestRef = useRef<number>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particleIdCounter = useRef(0);

  // Style mapping based on pet skin
  const styleConfig = useMemo(() => {
    switch (petSkin) {
      case 'girl-white':
        return {
          primary: '#00E5FF',
          secondary: '#FF0055',
          glow: 'rgba(0, 229, 255, 0.5)',
          particleColors: ['#00E5FF', '#FF0055', '#FFFFFF'],
          particleShape: 'square' as const,
          haloSize: '80px',
        };
      case 'girl-pink': // Star Envoy
        return {
          primary: '#FACC15',
          secondary: '#FFFFFF',
          glow: 'rgba(250, 204, 21, 0.4)',
          particleColors: ['#FACC15', '#FFFFFF', '#FEF3C7'],
          particleShape: 'star' as const,
          haloSize: '100px',
        };
      case 'goth-bunny':
        return {
          primary: '#F43F5E',
          secondary: '#18181B',
          glow: 'rgba(244, 63, 94, 0.5)',
          particleColors: ['#F43F5E', '#18181B', '#4C0519'],
          particleShape: 'circle' as const,
          haloSize: '70px',
        };
      case 'cat-orange':
        return {
          primary: '#FDBA74',
          secondary: '#FFF7ED',
          glow: 'rgba(253, 186, 116, 0.5)',
          particleColors: ['#FDBA74', '#FB923C', '#FFFFFF'],
          particleShape: 'paw' as const,
          haloSize: '90px',
        };
      default:
        return {
          primary: '#000000',
          secondary: '#FFFFFF',
          glow: 'rgba(0, 0, 0, 0.2)',
          particleColors: ['#000000', '#FFFFFF'],
          particleShape: 'circle' as const,
          haloSize: '60px',
        };
    }
  }, [petSkin]);

  const animate = () => {
    setTrailingPos(prev => ({
      x: prev.x + (mouseRef.current.x - prev.x) * 0.12,
      y: prev.y + (mouseRef.current.y - prev.y) * 0.12
    }));

    setParticles(prev => {
      const updated = prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1,
          size: p.size * 0.95
        }))
        .filter(p => p.life > 0);

      if (Math.random() > 0.35) {
        particleIdCounter.current++;
        updated.push({
          id: particleIdCounter.current,
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          size: Math.random() * 6 + 2,
          color: styleConfig.particleColors[Math.floor(Math.random() * styleConfig.particleColors.length)],
          life: 20 + Math.random() * 20,
          maxLife: 40,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          shape: styleConfig.particleShape
        });
      }
      return updated;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const isPointer = window.getComputedStyle(target).cursor === 'pointer' || 
                        target.tagName === 'BUTTON' || 
                        target.tagName === 'A' ||
                        target.closest('button') ||
                        target.closest('a');
      setIsHovering(!!isPointer);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden hidden md:block">
      {/* Particle Trail */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="absolute blur-[1px] transition-opacity duration-300"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'paw' ? p.color : 'transparent',
            opacity: p.life / p.maxLife,
            transform: `translate(-50%, -50%) rotate(${p.life * 5}deg)`,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0',
            clipPath: p.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {p.shape === 'paw' && <span style={{ fontSize: p.size, color: p.color }}>🐾</span>}
        </div>
      ))}

      {/* Trailing Soft Halo */}
      <div 
        className="absolute rounded-full transition-all duration-700 ease-out border-[1px] border-white/10"
        style={{ 
          left: trailingPos.x, 
          top: trailingPos.y, 
          width: isHovering ? `calc(${styleConfig.haloSize} * 1.5)` : styleConfig.haloSize,
          height: isHovering ? `calc(${styleConfig.haloSize} * 1.5)` : styleConfig.haloSize,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${styleConfig.glow} 0%, transparent 70%)`,
          boxShadow: `0 0 40px ${styleConfig.glow}`,
          opacity: 0.4
        }}
      />

      {/* Main Composite Cursor Layer (Triangles) */}
      <div 
        className="absolute transition-transform duration-200 ease-out"
        style={{ 
          left: pos.x, 
          top: pos.y, 
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.7 : isHovering ? 1.3 : 1})` 
        }}
      >
        <div className="relative flex items-center justify-center">
            {/* Pulsating Light Background */}
            <div 
              className="absolute rounded-full blur-2xl transition-colors duration-500 animate-pulse" 
              style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: styleConfig.primary,
                opacity: 0.2
              }} 
            />

            {/* Composite Triangle SVG */}
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 40 40" 
              className="relative z-10 overflow-visible"
            >
              {/* Outer Triangle - Rotating */}
              <g className={`origin-center ${isHovering ? 'animate-[spin_1s_linear_infinite]' : 'animate-[spin_4s_linear_infinite]'}`}>
                <path 
                  d="M20,6 L34,30 L6,30 Z" 
                  fill="none" 
                  stroke={styleConfig.primary} 
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  style={{ 
                    filter: `drop-shadow(0 0 5px ${styleConfig.primary})`,
                    opacity: 0.8
                  }}
                />
              </g>

              {/* Inner Triangle - Fixed or Slow Counter-Rotate */}
              <g className={`origin-center ${isHovering ? 'animate-[spin_1.5s_linear_infinite_reverse]' : 'animate-[spin_8s_linear_infinite_reverse]'}`}>
                <path 
                  d="M20,12 L28,26 L12,26 Z" 
                  fill="none" 
                  stroke={styleConfig.secondary} 
                  strokeWidth="1"
                  strokeLinejoin="round"
                  style={{ 
                    filter: `drop-shadow(0 0 3px ${styleConfig.secondary})`,
                    opacity: 0.6
                  }}
                />
              </g>

              {/* Center Dot (Core Anchor) */}
              <circle 
                cx="20" cy="23" r="1.5" 
                fill="white" 
                className="animate-pulse"
              />
            </svg>

            {/* Decorative Crosshair Accents */}
            <div 
              className={`absolute transition-all duration-500 ${isHovering ? 'rotate-180 scale-150 opacity-40' : 'rotate-0 scale-100 opacity-20'}`}
              style={{ width: '48px', height: '48px' }}
            >
                <div className="absolute top-1/2 left-0 w-full h-[1px]" style={{ backgroundColor: styleConfig.primary }}></div>
                <div className="absolute left-1/2 top-0 h-full w-[1px]" style={{ backgroundColor: styleConfig.primary }}></div>
            </div>
        </div>
      </div>

      {/* Clicking Ripple */}
      {isClicking && (
        <div 
          className="absolute rounded-full border-2 animate-ping"
          style={{ 
            left: pos.x, 
            top: pos.y, 
            width: '80px', 
            height: '80px', 
            transform: 'translate(-50%, -50%)',
            borderColor: styleConfig.primary,
            opacity: 0.6
          }}
        />
      )}
    </div>
  );
};

export default VirtualCursor;
