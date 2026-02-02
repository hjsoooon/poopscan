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
📦 양: ${analysis.amount}
💦 수분 상태: ${analysis.hydration}
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
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
          <img src={image} className="w-full h-full object-cover" alt="Diaper scan" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          
          {/* 분석 시간 */}
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <i className="fa-solid fa-clock"></i>
            {analysis.analysisTime}
          </div>

          {/* 신뢰도 */}
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <i className="fa-solid fa-robot"></i>
            신뢰도 {analysis.confidenceScore}%
          </div>

          {/* 하단 정보 */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400">AI 분석 완료</p>
                   <p className="text-[11px] font-bold">
                     {analysis.warningSigns && analysis.warningSigns.length > 0 
                       ? `${analysis.warningSigns.length}개 주의사항 발견` 
                       : '이상 소견 없음'}
                   </p>
                </div>
             </div>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
               analysis.status === 'normal' ? 'bg-green-100 text-green-600' :
               analysis.status === 'caution' ? 'bg-orange-100 text-orange-600' :
               'bg-red-100 text-red-600'
             }`}>
               <i className={`fa-solid ${analysis.status === 'normal' ? 'fa-check' : 'fa-exclamation'}`}></i>
             </div>
          </div>
        </div>

        {/* 주요 분석 지표 */}
        <div className="grid grid-cols-3 gap-2">
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="w-5 h-5 rounded-full border-2 mx-auto mb-1" style={{backgroundColor: analysis.colorHex}}></div>
              <p className="text-xs font-bold">{analysis.color}</p>
              <p className="text-[9px] text-gray-400">색상</p>
           </div>
           
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <i className="fa-solid fa-droplet text-blue-500 mb-1"></i>
              <p className="text-xs font-bold">{analysis.consistency}</p>
              <p className="text-[9px] text-gray-400">제형</p>
           </div>

           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
              <i className="fa-solid fa-cubes text-purple-500 mb-1"></i>
              <p className="text-xs font-bold">{analysis.amount}</p>
              <p className="text-[9px] text-gray-400">양</p>
           </div>
        </div>

        {/* 상세 분석 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-microscope text-blue-500"></i>
              상세 분석 결과
            </h3>
          </div>
          
          <div className="divide-y divide-gray-50">
            {/* 배변 횟수 */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-clock-rotate-left text-blue-600 text-sm"></i>
                </div>
                <span className="text-sm text-gray-600">오늘 배변 횟수</span>
              </div>
              <span className="text-sm font-bold">{analysis.frequencyToday}회</span>
            </div>
            
            {/* 수분 상태 */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-tint text-cyan-600 text-sm"></i>
                </div>
                <span className="text-sm text-gray-600">수분/탈수 상태</span>
              </div>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                analysis.hydration === '양호' ? 'bg-green-100 text-green-700' :
                analysis.hydration === '주의' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {analysis.hydration}
              </span>
            </div>

            {/* 브리스톨 척도 */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-chart-simple text-amber-600 text-sm"></i>
                </div>
                <span className="text-sm text-gray-600">브리스톨 척도</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5,6,7].map(n => (
                  <div 
                    key={n} 
                    className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold ${
                      n === analysis.bristolType 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 추가 관찰 항목 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-clipboard-check text-green-500"></i>
              추가 관찰 항목
            </h3>
          </div>
          
          <div className="p-4 grid grid-cols-3 gap-3">
            <div className={`p-3 rounded-xl text-center ${analysis.hasMucus ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
              <i className={`fa-solid ${analysis.hasMucus ? 'fa-circle-exclamation text-orange-500' : 'fa-circle-check text-green-500'} text-lg mb-1`}></i>
              <p className="text-[10px] font-bold text-gray-700">점액</p>
              <p className={`text-[10px] ${analysis.hasMucus ? 'text-orange-600' : 'text-green-600'}`}>
                {analysis.hasMucus ? '발견' : '없음'}
              </p>
            </div>
            
            <div className={`p-3 rounded-xl text-center ${analysis.hasBlood ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <i className={`fa-solid ${analysis.hasBlood ? 'fa-circle-exclamation text-red-500' : 'fa-circle-check text-green-500'} text-lg mb-1`}></i>
              <p className="text-[10px] font-bold text-gray-700">혈액</p>
              <p className={`text-[10px] ${analysis.hasBlood ? 'text-red-600' : 'text-green-600'}`}>
                {analysis.hasBlood ? '발견' : '없음'}
              </p>
            </div>
            
            <div className={`p-3 rounded-xl text-center ${analysis.hasUndigested ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              <i className={`fa-solid ${analysis.hasUndigested ? 'fa-circle-exclamation text-yellow-500' : 'fa-circle-check text-green-500'} text-lg mb-1`}></i>
              <p className="text-[10px] font-bold text-gray-700">미소화</p>
              <p className={`text-[10px] ${analysis.hasUndigested ? 'text-yellow-600' : 'text-green-600'}`}>
                {analysis.hasUndigested ? '발견' : '없음'}
              </p>
            </div>
          </div>
        </div>

        {/* 주의 사항 (있는 경우) */}
        {analysis.warningSigns && analysis.warningSigns.length > 0 && (
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa-solid fa-triangle-exclamation text-orange-500"></i>
              <span className="text-sm font-bold text-orange-700">주의 관찰 사항</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.warningSigns.map((sign, idx) => (
                <span key={idx} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                  {sign}
                </span>
              ))}
            </div>
          </div>
        )}

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
