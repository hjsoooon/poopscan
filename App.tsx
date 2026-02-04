
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, PoopAnalysisResult } from './types';
import { analyzePoopImage } from './services/geminiService';
import CameraView from './components/CameraView';
import ResultView from './components/ResultView';

// 해시 라우트 매핑
const VIEW_TO_HASH: Record<string, string> = {
  camera: '#/camera',
  'camera-ready': '#/camera-ready',  // 카메라 권한 허용됨
  'permission-denied': '#/permission-denied',  // 카메라 권한 거부됨
  analyzing: '#/analyzing', 
  result: '#/result',
};

const HASH_TO_VIEW: Record<string, string> = {
  '#/camera': 'camera',
  '#/camera-ready': 'camera',
  '#/permission-denied': 'camera',
  '#/analyzing': 'analyzing',
  '#/result': 'result',
  '': 'camera',
  '#/': 'camera',
};

// URL 해시에서 현재 뷰 가져오기
const getViewFromHash = (): string => {
  const hash = window.location.hash;
  return HASH_TO_VIEW[hash] || 'camera';
};

// URL 해시 업데이트
const setHash = (hashKey: string) => {
  const newHash = VIEW_TO_HASH[hashKey] || '#/camera';
  if (window.location.hash !== newHash) {
    window.location.hash = newHash;
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => ({
    view: getViewFromHash() as 'camera' | 'analyzing' | 'result',
    capturedImage: null,
    analysis: null,
  }));
  
  // 카메라 권한 상태 (null: 대기중, true: 허용, false: 거부)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  // 해시 변경 감지 (뒤로가기/앞으로가기)
  useEffect(() => {
    const handleHashChange = () => {
      const newView = getViewFromHash();
      setState(prev => {
        // analyzing이나 result로 직접 이동하는 경우 camera로 리다이렉트
        if ((newView === 'analyzing' || newView === 'result') && !prev.capturedImage) {
          setHash('camera');
          return { ...prev, view: 'camera' };
        }
        return { ...prev, view: newView as 'camera' | 'analyzing' | 'result' };
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // 초기 해시 설정
    if (!window.location.hash) {
      setHash('camera');
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 뷰 변경 시 해시 업데이트
  useEffect(() => {
    // 카메라 뷰일 때는 권한 상태에 따라 다른 해시 사용
    if (state.view === 'camera') {
      if (cameraPermission === true) {
        setHash('camera-ready');
      } else if (cameraPermission === false) {
        setHash('permission-denied');
      } else {
        setHash('camera');
      }
    } else {
      setHash(state.view);
    }
  }, [state.view, cameraPermission]);

  // 카메라 권한 상태 변경 핸들러
  const handlePermissionChange = useCallback((hasPermission: boolean | null) => {
    setCameraPermission(hasPermission);
  }, []);

  const handleCapture = async (imageData: string) => {
    setState(prev => ({ ...prev, view: 'analyzing', capturedImage: imageData }));
    
    try {
      const result = await analyzePoopImage(imageData);
      setState(prev => ({ 
        ...prev, 
        view: 'result', 
        analysis: result 
      }));
    } catch (error) {
      console.error("Analysis Failed", error);
      alert("분석 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setState(prev => ({ ...prev, view: 'camera' }));
    }
  };

  const handleReset = () => {
    setState({
      view: 'camera',
      capturedImage: null,
      analysis: null,
    });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full sm:max-w-lg sm:mx-auto md:shadow-2xl relative bg-black flex flex-col overflow-hidden">
      {state.view === 'camera' && (
        <CameraView 
          onCapture={handleCapture} 
          isProcessing={false}
          onPermissionChange={handlePermissionChange}
        />
      )}
      
      {state.view === 'analyzing' && (
        <CameraView 
          onCapture={() => {}} 
          isProcessing={true} 
          capturedImage={state.capturedImage}
        />
      )}

      {state.view === 'result' && state.capturedImage && state.analysis && (
        <div className="overflow-y-auto h-full bg-white">
          <ResultView 
            image={state.capturedImage} 
            analysis={state.analysis} 
            onReset={handleReset} 
          />
        </div>
      )}
    </div>
  );
};

export default App;
