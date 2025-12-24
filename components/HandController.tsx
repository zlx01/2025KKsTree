import React, { useEffect, useRef, useState } from 'react';
import { HandGestureState } from '../types';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandControllerProps {
  onUpdate: (state: HandGestureState) => void;
}

export const HandController: React.FC<HandControllerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [debugStatus, setDebugStatus] = useState("Initializing Vision...");
  
  // Internal state
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    onUpdate({ isOpen, position });
  }, [isOpen, position, onUpdate]);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupVision = async () => {
      try {
        setDebugStatus("Loading AI Model...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setIsModelLoading(false);
        setDebugStatus("Waiting for camera...");
        startCamera();
      } catch (error) {
        console.error("Failed to load MediaPipe:", error);
        setDebugStatus("AI Load Failed");
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
            setIsCameraReady(true);
            setDebugStatus("Active");
            predictWebcam();
          });
        }
      } catch (err) {
        console.error("Camera denied:", err);
        setDebugStatus("Camera Denied");
      }
    };

    let lastVideoTime = -1;
    const predictWebcam = () => {
      if (videoRef.current && handLandmarker) {
        let startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTime) {
          lastVideoTime = videoRef.current.currentTime;
          const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
          
          if (results.landmarks && results.landmarks.length > 0) {
            const landmarks = results.landmarks[0];
            
            // 1. Calculate Hand Center (Position)
            // Use Wrist(0) and Middle Finger MCP(9) average for stability
            const wrist = landmarks[0];
            const middleMCP = landmarks[9];
            const avgX = (wrist.x + middleMCP.x) / 2;
            const avgY = (wrist.y + middleMCP.y) / 2;

            // MediaPipe X is 0(Left) -> 1(Right).
            // We mirror the video visually (CSS scale-x -1).
            // To interact naturally as a mirror:
            // If user moves Hand Right -> Image Capture shows hand on Left (x~0).
            // We want this to correspond to Screen Right (+1).
            // So: Input(0) -> Output(+1). Input(1) -> Output(-1).
            const normX = (0.5 - avgX) * 2.5; // Gain of 2.5 for sensitivity
            const normY = (0.5 - avgY) * 2.5; // Invert Y (0 is top) -> (0.5 - 0 = 0.5 -> +)
            
            setPosition({ 
              x: Math.max(-1, Math.min(1, normX)), 
              y: Math.max(-1, Math.min(1, normY)) 
            });

            // 2. Detect Open vs Closed (Unleash vs Tree)
            // Calculate distance of finger tips to wrist relative to hand size
            // Landmarks: 0=Wrist, 8=IndexTip, 12=MiddleTip, 16=RingTip, 20=PinkyTip
            // Scale Reference: Wrist(0) to MiddleMCP(9)
            const getDist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
            const handSize = getDist(wrist, middleMCP);
            
            // Check extension of each finger
            const isExtended = (tipIdx: number, mcpIdx: number) => {
               const tip = landmarks[tipIdx];
               const dist = getDist(wrist, tip);
               // If tip is significantly further than MCP relative to wrist, it's extended
               return dist > handSize * 1.6; 
            };

            const fingersOpen = [
              isExtended(8, 5),   // Index
              isExtended(12, 9),  // Middle
              isExtended(16, 13), // Ring
              isExtended(20, 17)  // Pinky
            ].filter(Boolean).length;

            // If 3 or more fingers are extended -> OPEN (Unleash)
            // Else -> CLOSED (Formed)
            const newIsOpen = fingersOpen >= 3;
            setIsOpen(newIsOpen);
            
            setDebugStatus(newIsOpen ? "STATE: UNLEASHED" : "STATE: FORMED");
          } else {
            // No hand detected - Default to Formed (Tree)
            setIsOpen(false);
            setDebugStatus("No Hand Detected");
          }
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setupVision();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (handLandmarker) {
        handLandmarker.close();
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Video Feed Overlay */}
      <div className="absolute bottom-4 right-4 w-48 h-36 border-2 border-[#D4AF37] rounded-lg overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.5)] bg-black pointer-events-auto">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transform scale-x-[-1] opacity-60 transition-all duration-300 ${isOpen ? 'brightness-150 sepia' : 'brightness-100'}`}
        />
        {isModelLoading && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-[#D4AF37] text-xs text-center p-2 animate-pulse">
             Loading AI...
           </div>
        )}
        <div className="absolute bottom-0 w-full bg-black/50 text-[#D4AF37] text-[10px] text-center py-1 font-serif tracking-wider">
          {debugStatus}
        </div>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <p className={`text-[#D4AF37] font-serif tracking-widest text-lg drop-shadow-md transition-all duration-500 ${isOpen ? 'opacity-100 scale-110' : 'opacity-80'}`}>
          {isOpen ? "✧ CHAOS UNLEASHED ✧" : "OPEN HAND TO UNLEASH"}
        </p>
        <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">
          {isOpen ? "Close hand to form tree" : "Move hand to rotate view"}
        </p>
      </div>
    </div>
  );
};
