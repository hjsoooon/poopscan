
import React, { useState, useEffect } from 'react';
import { AppState, PoopAnalysisResult } from './types';
import { analyzePoopImage } from './services/geminiService';
import CameraView from './components/CameraView';
import ResultView from './components/ResultView';

// 해시 라우트 매핑
const VIEW_TO_HASH: Record<string, string> = {
  camera: '#/camera',
  analyzing: '#/analyzing', 
  result: '#/result',
};

const HASH_TO_VIEW: Record<string, string> = {
  '#/camera': 'camera',
  '#/analyzing': 'analyzing',
  '#/result': 'result',
  '': 'camera',  // 기본값
  '#/': 'camera',
};

// URL 해시에서 현재 뷰 가져오기
const getViewFromHash = (): string => {
  const hash = window.location.hash;
  return HASH_TO_VIEW[hash] || 'camera';
};

// URL 해시 업데이트
const setHash = (view: string) => {
  const newHash = VIEW_TO_HASH[view] || '#/camera';
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
    setHash(state.view);
  }, [state.view]);

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
