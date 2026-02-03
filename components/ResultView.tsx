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

  // 분석 결과가 포함된 이미지 생성
  const createResultImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        const imgWidth = Math.min(img.width, 1080);
        const imgHeight = (img.height / img.width) * imgWidth;
        const infoHeight = 350;
        
        canvas.width = imgWidth;
        canvas.height = imgHeight + infoHeight;

        ctx.fillStyle = '#FDFCFB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

        // 상태 배지
        const statusColors: Record<string, string> = {
          normal: '#22C55E',
          caution: '#F97316',
          warning: '#EF4444',
          emergency: '#000000'
        };
        
        ctx.fillStyle = statusColors[analysis.status] || '#374151';
        ctx.beginPath();
        ctx.roundRect(imgWidth / 2 - 80, 20, 160, 40, 20);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${analysis.friendlyEmoji} ${analysis.statusLabel}`, imgWidth / 2, 48);

        const infoY = imgHeight + 30;
        ctx.textAlign = 'left';

        // 헤드라인
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 22px Pretendard, sans-serif';
        ctx.fillText(analysis.friendlyHeadline, 24, infoY);
        
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '13px Pretendard, sans-serif';
        ctx.fillText(analysis.analysisTime, 24, infoY + 25);

        // 구분선
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(24, infoY + 45);
        ctx.lineTo(imgWidth - 24, infoY + 45);
        ctx.stroke();

        // 분석 요약
        const gridY = infoY + 70;
        const items = [
          { label: '변 모양', value: analysis.poopShape },
          { label: '색상', value: analysis.colorFriendly },
          { label: '수분상태', value: analysis.hydration },
        ];

        const colWidth = (imgWidth - 48) / 3;
        items.forEach((item, idx) => {
          const x = 24 + idx * colWidth;
          ctx.fillStyle = '#9CA3AF';
          ctx.font = '12px Pretendard, sans-serif';
          ctx.fillText(item.label, x, gridY);
          ctx.fillStyle = '#1E293B';
          ctx.font = 'bold 15px Pretendard, sans-serif';
          ctx.fillText(item.value, x, gridY + 22);
        });

        // 케어 가이드
        const careY = gridY + 60;
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 14px Pretendard, sans-serif';
        ctx.fillText('💡 오늘의 케어 가이드', 24, careY);
        
        ctx.fillStyle = '#4B5563';
        ctx.font = '13px Pretendard, sans-serif';
        
        const maxWidth = imgWidth - 48;
        let lineY = careY + 24;
        
        analysis.careAdvice.slice(0, 2).forEach(advice => {
          const words = ('• ' + advice).split(' ');
          let line = '';
          for (const word of words) {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > maxWidth && line !== '') {
              ctx.fillText(line.trim(), 24, lineY);
              line = word + ' ';
              lineY += 18;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line.trim(), 24, lineY);
          lineY += 22;
        });

        // 면책 조항
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '10px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ 참고용 정보이며, 정확한 진단은 전문의와 상담하세요.', imgWidth / 2, canvas.height - 15);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = image;
    });
  };

  const handleSaveImage = async () => {
    setIsSaving(true);
    try {
      const blob = await createResultImage();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `poopscan_${timestamp}_${analysis.statusLabel}.jpg`;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'PoopScan AI 분석 결과' });
          setIsSaving(false);
          return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('분석 결과 이미지가 저장되었습니다!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장에 실패했습니다. 다시 시도해 주세요.');
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const blob = await createResultImage();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `poopscan_${timestamp}_${analysis.statusLabel}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('분석 결과 이미지가 다운로드되었습니다!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        alert('공유에 실패했습니다. 다시 시도해 주세요.');
      }
    }
    setIsSharing(false);
  };

  // 신호등 색상
  const getTrafficLight = () => {
    switch(analysis.status) {
      case 'normal': return { color: 'bg-green-500', icon: '🟢', text: '좋음' };
      case 'caution': return { color: 'bg-yellow-500', icon: '🟡', text: '관찰 필요' };
      case 'warning': 
      case 'emergency': return { color: 'bg-red-500', icon: '🔴', text: '병원 권장' };
      default: return { color: 'bg-gray-500', icon: '⚪', text: '-' };
    }
  };

  const trafficLight = getTrafficLight();

  // 기저귀가 아닌 경우 별도 UI
  if (analysis.status === 'invalid') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#FDFCFB] text-gray-900 pb-[max(5rem,env(safe-area-inset-bottom))] flex flex-col">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-100">
          <button onClick={onReset} className="w-10 h-10 flex items-center justify-center -ml-2">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <h1 className="flex-1 text-center font-bold text-lg -mr-8">분석 결과</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-image text-4xl text-gray-400"></i>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">기저귀 사진이 아니에요</h2>
          <p className="text-gray-500 text-center mb-8 leading-relaxed">
            기저귀 사진을 업로드해 주세요.<br/>
            배변이 보이는 기저귀를 선명하게 촬영해 주세요.
          </p>

          <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200 mb-8">
            <img src={image} className="w-full h-full object-cover" alt="Uploaded" />
          </div>

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

  // 특이사항 체크
  const hasAnyIssue = analysis.hasMucus || analysis.hasBlood || analysis.hasUndigested;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#FDFCFB] text-gray-900 pb-[max(5rem,env(safe-area-inset-bottom))] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-100">
        <button onClick={onReset} className="w-10 h-10 flex items-center justify-center -ml-2">
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg -mr-8">분석 결과</h1>
      </div>

      {/* Demo Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <p className="text-[11px] text-amber-700 text-center">
          <i className="fa-solid fa-flask mr-1"></i>
          데모용 임시 데이터입니다
        </p>
      </div>

      <div className="p-4 space-y-5">
        
        {/* ===== 1. 상태 요약 (헤드라인) ===== */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          {/* 신호등 */}
          <div className="flex justify-center mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              analysis.status === 'normal' ? 'bg-green-100 text-green-700' :
              analysis.status === 'caution' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              <span className="text-lg">{trafficLight.icon}</span>
              <span className="font-bold text-sm">{trafficLight.text}</span>
            </div>
          </div>

          {/* 친절한 헤드라인 */}
          <div className="text-center">
            <span className="text-4xl mb-3 block">{analysis.friendlyEmoji}</span>
            <h2 className="text-xl font-bold text-gray-800 leading-snug">
              {analysis.friendlyHeadline}
            </h2>
            <p className="text-gray-500 text-sm mt-2">{analysis.analysisTime}</p>
          </div>
        </div>

        {/* 사진 미리보기 */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md">
          <img src={image} className="w-full h-full object-cover" alt="Diaper scan" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: analysis.colorHex}}></div>
              {analysis.colorFriendly}
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
              {analysis.poopShape}
            </div>
          </div>
        </div>

        {/* ===== 2. 상세 분석 (쉬운 용어) ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-blue-500"></i>
              오늘의 변 분석
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* 변 모양 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">
                {analysis.poopShape.split(' ')[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{analysis.poopShape}</p>
                <p className="text-sm text-gray-500">{analysis.poopShapeDesc}</p>
              </div>
            </div>

            {/* 색상 */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{backgroundColor: analysis.colorHex + '30'}}>
                <div className="w-6 h-6 rounded-full" style={{backgroundColor: analysis.colorHex}}></div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{analysis.colorFriendly}</p>
                <p className="text-sm text-gray-500">{analysis.color}</p>
              </div>
            </div>

            {/* 수분 상태 */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                analysis.hydration === '양호' ? 'bg-blue-100' :
                analysis.hydration === '주의' ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                💧
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">수분 상태: {analysis.hydration}</p>
                <p className="text-sm text-gray-500">{analysis.hydrationAdvice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 특이사항 스캔 */}
        {hasAnyIssue ? (
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa-solid fa-triangle-exclamation text-orange-500"></i>
              <span className="text-sm font-bold text-orange-700">특이사항 발견</span>
            </div>
            <div className="space-y-2">
              {analysis.hasMucus && (
                <div className="flex items-center gap-2 text-sm text-orange-700">
                  <span className="w-5 h-5 bg-orange-200 rounded-full flex items-center justify-center text-xs">!</span>
                  점액이 조금 보여요 (코변)
                </div>
              )}
              {analysis.hasBlood && (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <span className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center text-xs">!</span>
                  혈액이 발견되었어요 - 병원 방문을 권해요
                </div>
              )}
              {analysis.hasUndigested && (
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <span className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-xs">!</span>
                  소화 안 된 음식이 보여요 (정상일 수 있어요)
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="text-sm font-bold text-green-700">특이사항 없음 - 깨끗해요!</span>
            </div>
          </div>
        )}

        {/* ===== 3. 육아 솔루션 (행동 가이드) ===== */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <span className="font-bold">오늘의 케어 가이드</span>
          </div>
          
          <div className="space-y-3">
            {analysis.careAdvice.map((advice, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm leading-relaxed">{advice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 병원 방문 신호 (있는 경우만) */}
        {analysis.hospitalAdvice && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-hospital text-red-500"></i>
              <span className="text-sm font-bold text-red-700">닥터 코멘트</span>
            </div>
            <p className="text-sm text-red-700 leading-relaxed">
              {analysis.hospitalAdvice}
            </p>
          </div>
        )}

        {/* AI 인사이트 */}
        <div className="bg-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-robot text-gray-500"></i>
            <span className="text-xs font-bold text-gray-500">AI 분석 코멘트</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            "{analysis.insight}"
          </p>
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
                 리포트 저장하기
               </>
             )}
           </button>
           <button 
             onClick={handleShare}
             disabled={isSharing}
             className="w-full h-14 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-base active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
        </div>

        {/* Disclaimer */}
        <div className="text-[10px] text-gray-400 text-center px-4 pt-2 leading-relaxed">
          본 서비스는 참고용이며 의료 진단을 대신하지 않습니다. 
          이상 증상 발견 시 소아청소년과 전문의와 상담하세요.
        </div>
      </div>
    </div>
  );
};

export default ResultView;
