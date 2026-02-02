
import React, { useRef, useState, useEffect } from 'react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
  capturedImage?: string | null;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing, capturedImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashSupported, setIsFlashSupported] = useState(false);

  useEffect(() => {
    if (isProcessing) return; // Don't restart camera if we are processing

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // 플래시(토치) 지원 여부 확인
        const track = stream.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
          if (capabilities?.torch) {
            setIsFlashSupported(true);
          }
        }
        
        setHasPermission(true);
      } catch (err) {
        console.error("Camera access denied", err);
        setHasPermission(false);
      }
    }
    setupCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsFlashOn(false);
    };
  }, [isProcessing]);

  // 플래시 토글
  const toggleFlash = async () => {
    if (!streamRef.current || !isFlashSupported) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    
    try {
      const newFlashState = !isFlashOn;
      await track.applyConstraints({
        advanced: [{ torch: newFlashState } as MediaTrackConstraintSet]
      });
      setIsFlashOn(newFlashState);
    } catch (err) {
      console.error("Flash toggle failed:", err);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col safe-area-inset">
      {/* Top Section: Header + Guide Message */}
      {!isProcessing && (
        <div className="shrink-0 z-10 flex flex-col" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
          {/* Header */}
          <div className="px-4 py-2 flex justify-between items-center">
            <button className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-md">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="text-white font-semibold text-base tracking-tight backdrop-blur-md px-4 py-2 rounded-full bg-black/20">
              푸스캔 AI
            </div>
            <button className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white backdrop-blur-md">
              <i className="fa-solid fa-question"></i>
            </button>
          </div>
          
          {/* Guide Message */}
          <div className="px-4 py-2">
            <div className="bg-blue-600/90 backdrop-blur-md rounded-xl p-3 flex items-center gap-3 shadow-lg border border-blue-400/30 max-w-sm mx-auto">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <i className="fa-solid fa-camera-retro text-sm"></i>
              </div>
              <p className="text-[12px] font-bold text-white leading-tight flex-1">
                기저귀를 가이드라인 중앙에 맞춰 선명하게 촬영해 주세요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        {isProcessing && capturedImage ? (
          // Blurred background image during processing
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={capturedImage} 
              className="w-full h-full object-cover blur-xl scale-110 opacity-70"
              alt="Analyzing backdrop"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ) : hasPermission === false ? (
          <div className="p-8 text-center text-white">
            <p className="mb-4">카메라 권한이 필요합니다.</p>
            <label className="bg-blue-600 px-6 py-2 rounded-full inline-block cursor-pointer">
              파일 업로드
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${isProcessing ? 'hidden' : ''}`}
          />
        )}
        
        {/* Guide Lines & Scan Animation */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <div className={`w-full max-w-[260px] aspect-square border-2 ${isProcessing ? 'border-blue-500/50' : 'border-white/40'} rounded-3xl relative transition-colors duration-500`}>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
            
            {isProcessing && (
              <div className="scan-line absolute w-full rounded-full"></div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`shrink-0 bg-black/70 backdrop-blur-2xl px-4 pt-3 flex flex-col items-center gap-3 border-t border-white/10 transition-opacity duration-500 ${isProcessing ? 'opacity-30 pointer-events-none' : 'opacity-100'}`} style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        <div className="w-full flex items-center justify-between text-white/50 px-2">
           <div className="flex flex-col items-center">
              <p className="text-[9px] uppercase font-bold mb-1 tracking-tighter">AI Precision Mode</p>
              <div className="h-1 w-20 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500"></div>
              </div>
           </div>
           <div className="text-[10px] font-bold text-white/80 tracking-widest uppercase">Ready to Scan</div>
        </div>

        <div className="flex items-center justify-around w-full max-w-xs pb-1">
          <button 
            onClick={toggleFlash}
            disabled={!isFlashSupported}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
              isFlashOn 
                ? 'bg-yellow-400 text-black' 
                : isFlashSupported 
                  ? 'bg-white/10 text-white/80' 
                  : 'bg-white/5 text-white/30'
            }`}>
              <i className={`fa-solid ${isFlashOn ? 'fa-bolt-lightning' : 'fa-bolt'}`}></i>
            </div>
            <span className={`text-[10px] font-medium ${
              isFlashOn ? 'text-yellow-400' : 'text-white/60'
            }`}>
              {isFlashOn ? 'ON' : '플래시'}
            </span>
          </button>

          <button 
            onClick={handleCapture}
            disabled={isProcessing}
            className="group relative w-[72px] h-[72px] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
          >
            <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-colors"></div>
            <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center shadow-lg">
               <div className="w-[52px] h-[52px] rounded-full border-2 border-gray-100"></div>
            </div>
          </button>

          <label className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-white/20 transition-colors">
              <i className="fa-solid fa-images"></i>
            </div>
            <span className="text-[10px] text-white/60 font-medium">앨범</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
           {/* Background captured image */}
           {capturedImage && (
             <div className="absolute inset-0 -z-10">
               <img 
                 src={capturedImage} 
                 className="w-full h-full object-cover blur-xl scale-110 opacity-50"
                 alt="Analyzing backdrop"
               />
             </div>
           )}
           
           <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <i className="fa-solid fa-microchip text-2xl text-blue-400 animate-pulse"></i>
              </div>
           </div>
           <h2 className="text-xl font-bold mb-2 tracking-tight">AI 정밀 분석 중</h2>
           <p className="text-white/70 text-sm text-center px-4">기저귀의 색상과 제형을 확인하고 있어요</p>
           
           {/* Mini Preview of Captured Image */}
           <div className="mt-8 w-16 h-16 rounded-xl border-2 border-white/30 overflow-hidden shadow-2xl">
              <img src={capturedImage || ''} className="w-full h-full object-cover" alt="Captured" />
           </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
