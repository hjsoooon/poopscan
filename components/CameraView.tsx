
import React, { useRef, useState, useEffect } from 'react';
import { setHash } from '../App';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
  capturedImage?: string | null;
  onPermissionChange?: (hasPermission: boolean | null) => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing, capturedImage, onPermissionChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashSupported, setIsFlashSupported] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 권한 상태 변경 시 부모에게 알림
  useEffect(() => {
    onPermissionChange?.(hasPermission);
  }, [hasPermission, onPermissionChange]);

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
      // 앨범 선택 해시 업데이트
      setHash('album-select');
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
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col safe-area-inset">
        {/* Header */}
        <div className="px-4 flex justify-between items-center" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}>
          <div className="w-9 h-9"></div>
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm tracking-tight px-4 py-2 rounded-full bg-white shadow-sm">
            <img src="/로고.png" alt="푸스캔" className="w-5 h-5" />
            푸스캔 AI
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-600"
          >
            <i className="fa-solid fa-question text-sm"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
            <span className="text-5xl">📷</span>
          </div>
          
          <h2 className="text-amber-900 text-xl font-bold mb-2 text-center">카메라 권한이 필요해요</h2>
          <p className="text-amber-700/70 text-sm text-center mb-8 leading-relaxed">
            기저귀를 촬영하려면 카메라 권한이 필요해요.<br/>
            또는 앨범에서 사진을 선택해 주세요.
          </p>

          <label className="w-full max-w-xs h-14 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform shadow-lg shadow-orange-300/50">
            <i className="fa-solid fa-images"></i>
            앨범에서 사진 선택
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>

          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-amber-600 text-sm font-medium flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i>
            카메라 권한 다시 요청
          </button>
        </div>

        {/* Tips */}
        <div className="px-6 pb-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-amber-800 text-xs font-bold mb-2 flex items-center gap-2">
              <span className="text-base">💡</span>
              촬영 팁
            </p>
            <ul className="text-amber-700/70 text-xs space-y-1">
              <li>• 밝은 곳에서 촬영하면 더 정확해요</li>
              <li>• 기저귀 전체가 보이게 촬영해 주세요</li>
            </ul>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowHelp(false)}>
            <div 
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <img src="/로고.png" alt="푸스캔" className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold">푸스캔 AI</h2>
                <p className="text-amber-100 text-sm mt-1">아기 기저귀 AI 분석 서비스</p>
              </div>
              <div className="p-5 space-y-4 bg-amber-50/50">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-lg">📷</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">간편한 촬영</h3>
                    <p className="text-xs text-amber-700/70">기저귀를 촬영하면 AI가 자동으로 분석해요</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-lg">📊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">상세 분석</h3>
                    <p className="text-xs text-amber-700/70">색상, 제형, 양, 수분 상태 등을 분석해요</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-lg">💡</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">맞춤 가이드</h3>
                    <p className="text-xs text-amber-700/70">AI가 아기 건강 관리 팁을 제공해요</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-amber-200">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    ⚠️ 본 서비스는 참고용이며 의료 진단을 대체하지 않습니다.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 bg-amber-50/50">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl font-bold active:scale-[0.98] transition-transform"
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
    <div className="absolute inset-0 bg-gradient-to-b from-amber-100/80 to-orange-100/80 flex flex-col safe-area-inset">
      {/* Viewfinder - 전체 화면 */}
      <div className="flex-1 relative min-h-0 m-3 rounded-3xl overflow-hidden shadow-lg">
        {isProcessing && capturedImage ? (
          // Blurred background image during processing
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={capturedImage} 
              className="w-full h-full object-cover blur-xl scale-110 opacity-70"
              alt="Analyzing backdrop"
            />
            <div className="absolute inset-0 bg-amber-900/20"></div>
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
          <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-3 flex justify-between items-center">
            <button className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-amber-700 shadow-sm">
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm tracking-tight px-4 py-2 rounded-full bg-white/90 shadow-sm">
              <img src="/로고.png" alt="푸스캔" className="w-5 h-5" />
              푸스캔 AI
            </div>
            <button 
              onClick={() => setShowHelp(true)}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-amber-700 shadow-sm"
            >
              <i className="fa-solid fa-question text-sm"></i>
            </button>
          </div>
        )}

        {/* Guide Lines & Scan Animation */}
        {!isProcessing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
            <div className="w-[85%] max-w-[280px] aspect-[3/4] border-2 border-white/60 rounded-3xl relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-amber-400 rounded-br-2xl"></div>

              {/* Guide Message */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-white text-xs font-medium text-center drop-shadow-lg bg-amber-500/80 px-3 py-1.5 rounded-full">
                  📷 기저귀를 프레임 안에 맞춰주세요
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Guide Lines */}
        {isProcessing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
            <div className="w-[85%] max-w-[280px] aspect-[3/4] border-2 border-amber-400/50 rounded-3xl relative transition-colors duration-500">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-amber-400 rounded-br-2xl"></div>
              <div className="scan-line absolute w-full rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className={`shrink-0 bg-white/80 backdrop-blur-md rounded-t-3xl px-4 pt-4 flex flex-col items-center gap-2 transition-opacity duration-500 ${isProcessing ? 'opacity-30 pointer-events-none' : 'opacity-100'}`} style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        <div className="flex items-center justify-around w-full max-w-xs">
          <button 
            onClick={toggleFlash}
            disabled={!isFlashSupported}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              isFlashOn 
                ? 'bg-amber-400 text-white' 
                : isFlashSupported 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-gray-100 text-gray-300'
            }`}>
              <i className={`fa-solid ${isFlashOn ? 'fa-bolt-lightning' : 'fa-bolt'}`}></i>
            </div>
            <span className={`text-[10px] font-medium ${
              isFlashOn ? 'text-amber-600' : 'text-amber-700/60'
            }`}>
              {isFlashOn ? 'ON' : '플래시'}
            </span>
          </button>

          <button 
            onClick={handleCapture}
            disabled={isProcessing}
            className="group relative w-[76px] h-[76px] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-orange-300/50"></div>
            <div className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center">
               <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </div>
          </button>

          <label className="flex flex-col items-center gap-1 cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
              <i className="fa-solid fa-images"></i>
            </div>
            <span className="text-[10px] text-amber-700/60 font-medium">앨범</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-amber-900/60 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
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
           
           <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <img src="/로고.png" alt="푸스캔" className="w-10 h-10 animate-bounce" />
              </div>
           </div>
           <h2 className="text-xl font-bold mb-2 tracking-tight">AI가 분석하고 있어요</h2>
           <p className="text-white/80 text-sm text-center px-4">잠시만 기다려 주세요~</p>
           
           {/* Mini Preview of Captured Image */}
           <div className="mt-8 w-16 h-16 rounded-2xl border-2 border-amber-300/50 overflow-hidden shadow-2xl">
              <img src={capturedImage || ''} className="w-full h-full object-cover" alt="Captured" />
           </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowHelp(false)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <img src="/로고.png" alt="푸스캔" className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold">푸스캔 AI</h2>
              <p className="text-amber-100 text-sm mt-1">아기 기저귀 AI 분석 서비스</p>
            </div>
            
            {/* Content */}
            <div className="p-5 space-y-4 bg-amber-50/50">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-lg">📷</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-sm">간편한 촬영</h3>
                  <p className="text-xs text-amber-700/70">기저귀를 촬영하면 AI가 자동으로 분석해요</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-sm">상세 분석</h3>
                  <p className="text-xs text-amber-700/70">색상, 제형, 양, 수분 상태 등을 분석해요</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-sm">맞춤 가이드</h3>
                  <p className="text-xs text-amber-700/70">AI가 아기 건강 관리 팁을 제공해요</p>
                </div>
              </div>
              
              {/* Warning */}
              <div className="bg-white rounded-xl p-3 border border-amber-200">
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  ⚠️ 본 서비스는 참고용이며 의료 진단을 대체하지 않습니다. 
                  이상 증상 발견 시 전문의와 상담하세요.
                </p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 pb-5 bg-amber-50/50">
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl font-bold active:scale-[0.98] transition-transform"
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
