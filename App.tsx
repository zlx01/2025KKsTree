import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { HandController } from './components/HandController';
import { TreeState, HandGestureState } from './types';

const LoadingFallback = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
    <div className="w-24 h-24 border-t-2 border-b-2 border-[#D4AF37] rounded-full animate-spin mb-6"></div>
    <p className="text-[#D4AF37] font-['Cinzel'] tracking-[0.5em] animate-pulse text-lg">LUXURY ASCENDING...</p>
  </div>
);

function App() {
  const [gestureState, setGestureState] = useState<HandGestureState>({
    isOpen: false,
    position: { x: 0, y: 0 }
  });

  const [zoom, setZoom] = useState(0);
  const [mouseActive, setMouseActive] = useState(false);

  const handleGestureUpdate = useCallback((newState: HandGestureState) => {
    setGestureState(prev => {
      if (newState.position.x === 0 && newState.position.y === 0 && !newState.isOpen && mouseActive) {
        return prev;
      }
      return newState;
    });
  }, [mouseActive]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseActive(true);
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      setGestureState(prev => ({
        ...prev,
        position: { x, y }
      }));
    };

    const handleMouseDown = () => setGestureState(prev => ({ ...prev, isOpen: true }));
    const handleMouseUp = () => setGestureState(prev => ({ ...prev, isOpen: false }));
    
    const handleWheel = (e: WheelEvent) => {
      setZoom(prev => Math.min(20, Math.max(-15, prev + e.deltaY * 0.02)));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const treeState = gestureState.isOpen ? TreeState.CHAOS : TreeState.FORMED;

  return (
    <div className="w-full h-screen bg-[#000d05] relative overflow-hidden select-none">
      
      <Suspense fallback={<LoadingFallback />}>
        <div className="absolute inset-0 z-0">
          <Canvas 
            dpr={[1, 2]} 
            shadows 
            camera={{ position: [0, 4, 30], fov: 45 }}
            gl={{ antialias: true, stencil: false, depth: true }}
          >
            <Scene treeState={treeState} gestureState={gestureState} zoom={zoom} />
          </Canvas>
        </div>
      </Suspense>

      <HandController onUpdate={handleGestureUpdate} />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-10 md:p-14 pointer-events-none z-20">
        <div className="flex justify-between items-start">
          <div className="mt-2 ml-4 flex flex-col items-start max-w-2xl">
            <h1 className="font-['Pinyon_Script'] text-6xl md:text-7xl text-[#FFD700] text-glow-gold leading-tight drop-shadow-2xl">
              Merry Christmas
            </h1>
            <div className="h-[1px] w-48 bg-gradient-to-r from-[#D4AF37] to-transparent mt-2 mb-2"></div>
            <p className="font-['Cinzel'] text-[#D4AF37] tracking-[0.4em] text-[10px] md:text-xs opacity-80">
              EXCLUSIVELY CREATED BY KK
            </p>
          </div>
          
          <div className="hidden md:block text-right">
            <div className="border border-[#D4AF37]/40 p-6 bg-black/40 backdrop-blur-xl rounded-sm shadow-2xl">
              <p className="text-[#D4AF37] font-[Cinzel] text-[9px] tracking-[0.3em] mb-1 opacity-50">STASIS CORE</p>
              <p className={`text-3xl font-bold tracking-tighter transition-all duration-700 font-['Cinzel'] ${treeState === TreeState.CHAOS ? 'text-red-500 text-glow-gold translate-x-1' : 'text-emerald-400'}`}>
                {treeState === TreeState.CHAOS ? 'UNLEASHED' : 'STABILIZED'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Help Tips */}
      <div className="absolute bottom-20 left-10 pointer-events-none hidden xl:block">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#D4AF37]/30 text-2xl group-hover:bg-[#D4AF37]/10 transition-colors">✋</div>
            <div className="translate-y-1">
              <p className="text-[#D4AF37] font-[Cinzel] font-bold text-[10px] tracking-[0.2em]">VISION CONTROL</p>
              <p className="text-white/40 text-[9px] font-serif italic uppercase tracking-widest">Gesture: Open to Unleash</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#D4AF37]/30 text-2xl group-hover:bg-[#D4AF37]/10 transition-colors">🖱️</div>
            <div className="translate-y-1">
              <p className="text-[#D4AF37] font-[Cinzel] font-bold text-[10px] tracking-[0.2em]">PRECISION INPUT</p>
              <p className="text-white/40 text-[9px] font-serif italic uppercase tracking-widest">Click to Chaos | Scroll to Zoom</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Frame */}
      <div className="absolute inset-0 border-[24px] border-[#011a0e] pointer-events-none z-30 opacity-95"></div>
      <div className="absolute inset-6 border border-[#D4AF37]/15 pointer-events-none z-30"></div>

    </div>
  );
}

export default App;