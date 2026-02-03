
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
  const [showHelp, setShowHelp] = useState(false);

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

  // 카메라 권한이 없는 경우 별도 화면
  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col safe-area-inset">
        {/* Header */}
        <div className="px-4 flex justify-between items-center" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
          <div className="w-9 h-9"></div>
          <div className="text-white font-semibold text-sm tracking-tight px-3 py-1.5 rounded-full bg-white/10">
            푸스캔 AI
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <i className="fa-solid fa-question text-sm"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-camera-slash text-3xl text-white/60"></i>
          </div>
          
          <h2 className="text-white text-xl font-bold mb-2 text-center">카메라 권한이 필요해요</h2>
          <p className="text-white/60 text-sm text-center mb-8 leading-relaxed">
            기저귀를 촬영하려면 카메라 권한이 필요해요.<br/>
            또는 앨범에서 사진을 선택해 주세요.
          </p>

          <label className="w-full max-w-xs h-14 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/30">
            <i className="fa-solid fa-images"></i>
            앨범에서 사진 선택
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>

          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-white/60 text-sm font-medium flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i>
            카메라 권한 다시 요청
          </button>
        </div>

        {/* Tips */}
        <div className="px-6 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/80 text-xs font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-yellow-400"></i>
              촬영 팁
            </p>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• 밝은 곳에서 촬영하면 더 정확해요</li>
              <li>• 기저귀 전체가 보이게 촬영해 주세요</li>
            </ul>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setShowHelp(false)}>
            <div 
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <i className="fa-solid fa-poop text-3xl"></i>
                </div>
                <h2 className="text-xl font-bold">PoopScan AI</h2>
                <p className="text-blue-100 text-sm mt-1">아기 기저귀 AI 분석 서비스</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-camera text-blue-600"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">간편한 촬영</h3>
                    <p className="text-xs text-gray-500">기저귀를 촬영하면 AI가 자동으로 분석해요</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-chart-pie text-green-600"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">상세 분석</h3>
                    <p className="text-xs text-gray-500">색상, 제형, 양, 수분 상태 등을 분석해요</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-lightbulb text-orange-600"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">맞춤 가이드</h3>
                    <p className="text-xs text-gray-500">AI가 아기 건강 관리 팁을 제공해요</p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                    본 서비스는 참고용이며 의료 진단을 대체하지 않습니다.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full h-12 bg-blue-500 text-white rounded-xl font-bold active:scale-[0.98] transition-transform"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col safe-area-inset">
      {/* Viewfinder - 전체 화면 */}
      <div className="flex-1 relative min-h-0">
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
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${isProcessing ? 'hidden' : ''}`}
          />
        )}
        
        {/* Header Overlay */}
        {!isProcessing && (
          <div className="absolute top-0 left-0 right-0 z-10 px-4 flex justify-between items-center" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
            <button className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-md">
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <div className="text-white font-semibold text-sm tracking-tight backdrop-blur-md px-3 py-1.5 rounded-full bg-black/30">
              푸스캔 AI
            </div>
            <button 
              onClick={() => setShowHelp(true)}
              className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-md"
            >
              <i className="fa-solid fa-question text-sm"></i>
            </button>
          </div>
        )}

        {/* Guide Lines & Scan Animation */}
        {!isProcessing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
            <div className="w-[85%] max-w-[320px] aspect-[3/4] border-2 border-white/50 rounded-3xl relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>

              {/* Guide Message */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-white/90 text-xs font-medium text-center drop-shadow-lg">
                  📷 기저귀를 프레임 안에 맞춰서 촬영해 주세요
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Guide Lines */}
        {isProcessing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
            <div className="w-[85%] max-w-[320px] aspect-[3/4] border-2 border-blue-500/50 rounded-3xl relative transition-colors duration-500">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
              <div className="scan-line absolute w-full rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className={`shrink-0 bg-gradient-to-t from-black/90 to-black/40 px-4 pt-2 flex flex-col items-center gap-2 transition-opacity duration-500 ${isProcessing ? 'opacity-30 pointer-events-none' : 'opacity-100'}`} style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}>
        <div className="flex items-center justify-around w-full max-w-xs">
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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setShowHelp(false)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-poop text-3xl"></i>
              </div>
              <h2 className="text-xl font-bold">PoopScan AI</h2>
              <p className="text-blue-100 text-sm mt-1">아기 기저귀 AI 분석 서비스</p>
            </div>
            
            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-camera text-blue-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">간편한 촬영</h3>
                  <p className="text-xs text-gray-500">기저귀를 촬영하면 AI가 자동으로 분석해요</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-chart-pie text-green-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">상세 분석</h3>
                  <p className="text-xs text-gray-500">색상, 제형, 양, 수분 상태 등을 분석해요</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-lightbulb text-orange-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">맞춤 가이드</h3>
                  <p className="text-xs text-gray-500">AI가 아기 건강 관리 팁을 제공해요</p>
                </div>
              </div>
              
              {/* Warning */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                  본 서비스는 참고용이며 의료 진단을 대체하지 않습니다. 
                  이상 증상 발견 시 전문의와 상담하세요.
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 pb-5">
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full h-12 bg-blue-500 text-white rounded-xl font-bold active:scale-[0.98] transition-transform"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
