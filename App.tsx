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
      // If hand is detected, use it. Otherwise allow mouse to stay at its last pos.
      if (newState.position.x === 0 && newState.position.y === 0 && !newState.isOpen && mouseActive) {
        return prev;
      }
      return newState;
    });
  }, [mouseActive]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseActive(true);
      // Map to -1 to 1
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
        {/* 3D Scene Layer */}
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

      {/* Interaction Layer & Camera Feed */}
      <HandController onUpdate={handleGestureUpdate} />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-10 pointer-events-none z-20">
        <div className="flex justify-between items-start">
          <div className="mt-2 ml-4 flex flex-col items-start">
            <h1 className="font-['Pinyon_Script'] text-6xl md:text-7xl text-[#FFD700] text-glow-gold tracking-widest leading-none">
              Merry Christmas
            </h1>
            <p className="font-['Cinzel'] text-[#D4AF37] tracking-[0.3em] text-xs mt-4 opacity-70 ml-2">
              EXCLUSIVELY CRAFTED BY KK
            </p>
          </div>
          
          <div className="hidden md:block text-right">
            <div className="border border-[#D4AF37]/50 p-6 bg-black/60 backdrop-blur-md rounded-sm">
              <p className="text-[#D4AF37] font-[Cinzel] text-[10px] tracking-widest mb-1 opacity-60">SYSTEM STATUS</p>
              <p className={`text-3xl font-bold tracking-tighter transition-all duration-500 ${treeState === TreeState.CHAOS ? 'text-red-500 text-glow-gold' : 'text-emerald-400'}`}>
                {treeState === TreeState.CHAOS ? 'UNLEASHED' : 'FORMED'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Help Tips */}
      <div className="absolute top-1/2 left-10 transform -translate-y-1/2 pointer-events-none hidden xl:block">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-5 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-4xl text-[#D4AF37]">✋</div>
            <div>
              <p className="text-[#D4AF37] font-[Cinzel] font-bold text-xs tracking-widest">HAND GESTURE</p>
              <p className="text-white/50 text-[10px] font-serif italic uppercase tracking-tighter">Open: Chaos | Move: View</p>
            </div>
          </div>
          <div className="flex items-center gap-5 opacity-40 hover:opacity-100 transition-opacity">
            <div className="text-4xl text-[#D4AF37]">🖱️</div>
            <div>
              <p className="text-[#D4AF37] font-[Cinzel] font-bold text-xs tracking-widest">MOUSE CONTROL</p>
              <p className="text-white/50 text-[10px] font-serif italic uppercase tracking-tighter">Click: Chaos | Wheel: Zoom</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Frame */}
      <div className="absolute inset-0 border-[20px] border-[#011a0e] pointer-events-none z-30 opacity-90"></div>
      <div className="absolute inset-5 border border-[#D4AF37]/20 pointer-events-none z-30"></div>

    </div>
  );
}

export default App;