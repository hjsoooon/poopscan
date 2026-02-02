import React, { useState } from 'react';
import { PoopAnalysisResult } from '../types';

interface ResultViewProps {
  image: string;
  analysis: PoopAnalysisResult;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ image, analysis, onReset }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // 이미지 저장 기능
  const handleSaveImage = async () => {
    setIsSaving(true);
    try {
      // 이미지를 Blob으로 변환
      const response = await fetch(image);
      const blob = await response.blob();
      
      // 파일명 생성
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `poopscan_${timestamp}_${analysis.statusLabel}.jpg`;

      // 모바일에서 공유 API를 통한 저장 시도
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'PoopScan AI 분석 결과',
          });
          setIsSaving(false);
          return;
        }
      }

      // 폴백: 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('이미지가 저장되었습니다!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장에 실패했습니다. 다시 시도해 주세요.');
    }
    setIsSaving(false);
  };

  // 공유 기능
  const handleShare = async () => {
    setIsSharing(true);
    
    const shareText = `🔍 PoopScan AI 분석 결과

📊 상태: ${analysis.statusLabel}
🎨 색상: ${analysis.color}
💧 제형: ${analysis.consistency}
📝 오늘 ${analysis.frequencyToday}번째

💡 AI 가이드:
"${analysis.insight}"

⚠️ 본 결과는 참고용이며, 정확한 진단은 전문의와 상담하세요.`;

    try {
      // Web Share API 지원 확인
      if (navigator.share) {
        // 이미지와 함께 공유 시도
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], 'poopscan_result.jpg', { type: 'image/jpeg' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'PoopScan AI 분석 결과',
            text: shareText,
            files: [file],
          });
        } else {
          // 이미지 없이 텍스트만 공유
          await navigator.share({
            title: 'PoopScan AI 분석 결과',
            text: shareText,
          });
        }
      } else {
        // Web Share API 미지원시 클립보드 복사
        await navigator.clipboard.writeText(shareText);
        alert('분석 결과가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        // 폴백: 클립보드 복사
        try {
          await navigator.clipboard.writeText(shareText);
          alert('분석 결과가 클립보드에 복사되었습니다!');
        } catch {
          alert('공유에 실패했습니다.');
        }
      }
    }
    setIsSharing(false);
  };

  const getStatusColorClass = (status: string) => {
    switch(status) {
      case 'normal': return 'bg-green-100 text-green-700';
      case 'caution': return 'bg-orange-100 text-orange-700';
      case 'warning': return 'bg-red-100 text-red-700';
      case 'emergency': return 'bg-black text-white';
      case 'invalid': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // 기저귀가 아닌 경우 별도 UI
  if (analysis.status === 'invalid') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#FDFCFB] text-gray-900 pb-[max(5rem,env(safe-area-inset-bottom))] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-100">
          <button onClick={onReset} className="w-10 h-10 flex items-center justify-center -ml-2">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <h1 className="flex-1 text-center font-bold text-lg -mr-8">AI 분석 결과</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-image text-4xl text-gray-400"></i>
          </div>
          
          {/* Error Message */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">기저귀 사진이 아니에요</h2>
          <p className="text-gray-500 text-center mb-8 leading-relaxed">
            기저귀 사진을 업로드해 주세요.<br/>
            배변이 보이는 기저귀를 선명하게 촬영해 주시면<br/>
            더 정확한 분석이 가능합니다.
          </p>

          {/* Uploaded Image Preview */}
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 mb-8">
            <img src={image} className="w-full h-full object-cover" alt="Uploaded" />
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-2xl p-4 w-full max-w-sm mb-8">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-lightbulb text-blue-500"></i>
              <span className="text-sm font-bold text-blue-700">촬영 팁</span>
            </div>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• 밝은 곳에서 촬영해 주세요</li>
              <li>• 배변 부분이 잘 보이게 촬영해 주세요</li>
              <li>• 기저귀 전체가 프레임에 들어오게 해주세요</li>
            </ul>
          </div>

          {/* Retry Button */}
          <button 
            onClick={onReset}
            className="w-full max-w-sm h-14 bg-[#F97316] text-white rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-camera"></i>
            다시 촬영하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#FDFCFB] text-gray-900 pb-[max(5rem,env(safe-area-inset-bottom))] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-100">
        <button onClick={onReset} className="w-10 h-10 flex items-center justify-center -ml-2">
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg -mr-8">AI 분석 결과</h1>
      </div>

      {/* Demo Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="flex items-center gap-2 text-amber-700">
          <i className="fa-solid fa-flask text-sm"></i>
          <p className="text-xs font-medium">
            본 결과는 <span className="font-bold">데모용 임시 데이터</span>이며, 실제 AI 분석 결과가 아닙니다.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Badge */}
        <div className="flex flex-col items-center gap-2">
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${getStatusColorClass(analysis.status)}`}>
            {analysis.status !== 'normal' && <i className="fa-solid fa-triangle-exclamation"></i>}
            상태 분석 결과
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{analysis.statusLabel}</h2>
          <p className="text-gray-500 font-medium">{analysis.description}</p>
        </div>

        {/* Diaper Image Section */}
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl shadow-blue-900/10 group">
          <img src={image} className="w-full h-full object-cover" alt="Diaper scan" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          {/* AI Markers */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold shadow-lg border border-white whitespace-nowrap">
                   배변 영역 감지
                </div>
                <div className="w-16 h-16 border-2 border-white/50 rounded-full animate-ping"></div>
                <div className="absolute inset-0 w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
             </div>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-2">
            <i className="fa-solid fa-camera"></i>
            시료 분석 기록
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between border border-white/50">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                  <i className="fa-solid fa-wand-magic-sparkles text-sm"></i>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400">AI 분석 완료</p>
                   <p className="text-xs font-bold">2개 특이점 발견</p>
                </div>
             </div>
             <i className="fa-solid fa-chevron-right text-gray-300"></i>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                 <span className="text-xs font-bold text-gray-400">색상</span>
                 <div className="w-4 h-4 rounded-full border shadow-sm" style={{backgroundColor: analysis.colorHex}}></div>
              </div>
              <p className="text-base font-bold">{analysis.color}</p>
              <p className="text-[10px] text-gray-400">표준 지표</p>
           </div>
           
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                 <span className="text-xs font-bold text-gray-400">횟수</span>
                 <i className="fa-solid fa-clock-rotate-left text-gray-300"></i>
              </div>
              <p className="text-base font-bold">오늘 {analysis.frequencyToday}번째</p>
              <p className="text-[10px] text-gray-400">일일 기록</p>
           </div>

           <div className="col-span-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                 <span className="text-xs font-bold text-gray-400 block mb-1">제형</span>
                 <p className="text-lg font-bold text-orange-600">{analysis.consistency}</p>
                 <p className="text-[10px] text-gray-400">관찰 후 주의</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                <i className="fa-solid fa-droplet text-lg"></i>
              </div>
           </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-[#1E293B] text-white p-4 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-share-nodes text-xs"></i>
              </div>
              <span className="text-xs font-bold tracking-wider">AI 맞춤 가이드</span>
           </div>
           
           <p className="text-base font-medium leading-relaxed mb-4">
             &ldquo;{analysis.insight}&rdquo;
           </p>

           <div className="flex flex-wrap gap-2">
              {analysis.recommendations.map((rec, idx) => (
                <span key={idx} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors cursor-default">
                  {rec}
                </span>
              ))}
           </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
           <button 
             onClick={handleSaveImage}
             disabled={isSaving}
             className="w-full h-14 bg-[#F97316] text-white rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {isSaving ? (
               <>
                 <i className="fa-solid fa-spinner animate-spin"></i>
                 저장 중...
               </>
             ) : (
               <>
                 <i className="fa-solid fa-download"></i>
                 사진 저장하기
               </>
             )}
           </button>
           <button 
             onClick={handleShare}
             disabled={isSharing}
             className="w-full h-14 bg-white border border-gray-100 text-[#F97316] rounded-xl font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
           >
             {isSharing ? (
               <>
                 <i className="fa-solid fa-spinner animate-spin"></i>
                 공유 준비 중...
               </>
             ) : (
               <>
                 <i className="fa-solid fa-share-nodes"></i>
                 공유하기
               </>
             )}
           </button>
           
           <div className="text-center pt-4">
              <button className="text-gray-400 font-bold text-sm flex items-center gap-2 mx-auto hover:text-orange-500 transition-colors">
                <i className="fa-solid fa-comment-dots"></i>
                AI 전문가에게 묻기
              </button>
           </div>
        </div>

        {/* Disclaimer */}
        <div className="text-[10px] text-gray-400 text-center px-4 pt-4 leading-relaxed">
          본 서비스는 AI 분석 정보만을 제공하며 의료적 진단을 대신할 수 없습니다. 
          이상이 있는 경우 반드시 소아청소년과 전문의와 상담하십시오.
        </div>
      </div>
    </div>
  );
};

export default ResultView;
