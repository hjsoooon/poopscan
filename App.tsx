
import React, { useState } from 'react';
import { AppState, PoopAnalysisResult } from './types';
import { analyzePoopImage } from './services/geminiService';
import CameraView from './components/CameraView';
import ResultView from './components/ResultView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'camera',
    capturedImage: null,
    analysis: null,
  });

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
      // Even if it fails, the service has a mock fallback, but let's handle it just in case.
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
    <div className="h-screen w-full max-w-md mx-auto shadow-2xl relative bg-black flex flex-col overflow-hidden">
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
