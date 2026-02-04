import React, { useState } from 'react';
import { PoopAnalysisResult } from '../types';
import { setHash } from '../App';

interface ResultViewProps {
  image: string;
  analysis: PoopAnalysisResult;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ image, analysis, onReset }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // AI 분석 결과와 부모 확인 사항 분리
  const aiChecks = analysis.warningChecks.filter(w => w.type === 'ai');
  const parentChecks = analysis.warningChecks.filter(w => w.type === 'parent');
  
  // 부모 확인 체크리스트 상태
  const [checkedParentItems, setCheckedParentItems] = useState<boolean[]>(
    new Array(parentChecks.length).fill(false)
  );

  const toggleParentCheck = (idx: number) => {
    // 체크리스트 상호작용 해시 업데이트
    setHash('result-checklist');
    setCheckedParentItems(prev => {
      const newChecked = [...prev];
      newChecked[idx] = !newChecked[idx];
      return newChecked;
    });
  };

  // AI 분석에서 주의가 필요한 항목 개수
  const aiAlertCount = aiChecks.filter(w => w.isAlert).length;
  
  // 부모 체크에서 체크된 항목 개수 (체크 = "네, 이 증상이 있어요" = 주의 필요)
  const parentCheckedCount = checkedParentItems.filter(c => c).length;

  // 캔버스로 리포트 이미지 생성 (큰 텍스트)
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

        // 캔버스 크기 설정
        const canvasWidth = 720;
        const imgHeight = (img.height / img.width) * canvasWidth;
        const infoHeight = 560;
        
        canvas.width = canvasWidth;
        canvas.height = imgHeight + infoHeight;

        // 배경
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 이미지
        ctx.drawImage(img, 0, 0, canvasWidth, imgHeight);

        // 상태 배지 (이미지 위에 크게)
        const statusColors: Record<string, string> = {
          normal: '#22C55E',
          caution: '#EAB308',
          warning: '#EF4444',
        };
        const statusLabels: Record<string, string> = {
          normal: '좋음 ✓',
          caution: '관찰 −',
          warning: '주의 !',
        };
        
        ctx.fillStyle = statusColors[analysis.status] || '#6B7280';
        ctx.beginPath();
        ctx.roundRect(canvasWidth / 2 - 75, 16, 150, 50, 25);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(statusLabels[analysis.status] || analysis.statusLabel, canvasWidth / 2, 50);

        // 정보 영역
        const padding = 32;
        let y = imgHeight + 44;

        // 요약 (줄바꿈 지원)
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 28px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        const summaryText = analysis.summaryLine.replace(/[^\w\sㄱ-힣.,!?]/g, '');
        
        // 텍스트 줄바꿈 처리
        const maxWidth = canvasWidth - padding * 2;
        const words = summaryText.split('');
        let line = '';
        let lineCount = 0;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, padding, y);
            line = words[i];
            y += 34;
            lineCount++;
            if (lineCount >= 2) break; // 최대 2줄
          } else {
            line = testLine;
          }
        }
        if (line && lineCount < 2) {
          ctx.fillText(line, padding, y);
          y += 34;
        }
        
        y += 4;
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '20px -apple-system, sans-serif';
        ctx.fillText(analysis.analysisTime, padding, y);

        // 구분선
        y += 32;
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvasWidth - padding, y);
        ctx.stroke();

        // 분석 결과 (크게)
        y += 42;
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 26px -apple-system, sans-serif';
        ctx.fillText('📋 분석 결과', padding, y);

        y += 40;
        const metrics = [
          { label: '굳기', value: analysis.firmness },
          { label: '양', value: analysis.amount },
          { label: '색상', value: analysis.colorCategory },
        ];
        const colWidth = (canvasWidth - padding * 2) / 3;
        
        metrics.forEach((item, idx) => {
          const x = padding + idx * colWidth;
          ctx.fillStyle = '#6B7280';
          ctx.font = '20px -apple-system, sans-serif';
          ctx.fillText(item.label, x, y);
          ctx.fillStyle = '#1F2937';
          ctx.font = 'bold 28px -apple-system, sans-serif';
          ctx.fillText(item.value, x, y + 36);
        });

        // 특이소견 (크게)
        y += 90;
        if (analysis.specialFindings.length > 0) {
          ctx.fillStyle = '#EA580C';
          ctx.font = 'bold 24px -apple-system, sans-serif';
          ctx.fillText('⚠️ ' + analysis.specialFindings.join(', '), padding, y);
        } else {
          ctx.fillStyle = '#22C55E';
          ctx.font = 'bold 24px -apple-system, sans-serif';
          ctx.fillText('✅ 특이소견 없음', padding, y);
        }

        // 케어 가이드 (크게)
        y += 46;
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 26px -apple-system, sans-serif';
        ctx.fillText('💡 케어 가이드', padding, y);
        
        y += 38;
        ctx.font = '22px -apple-system, sans-serif';
        ctx.fillStyle = '#4B5563';
        
        analysis.nextActions.slice(0, 2).forEach(action => {
          const shortAction = action.length > 28 ? action.slice(0, 28) + '...' : action;
          ctx.fillText('• ' + shortAction, padding, y);
          y += 34;
        });

        // 면책 조항
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '18px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ 참고용 정보이며, 정확한 진단은 전문의와 상담하세요', canvasWidth / 2, canvas.height - 24);

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
    // 저장하기 해시 업데이트
    setHash('result-save');
    setIsSaving(true);
    try {
      const blob = await createResultImage();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `poopscan_${timestamp}.jpg`;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
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
      alert('분석 결과가 저장되었습니다!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('저장에 실패했습니다.');
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
    // 공유하기 해시 업데이트
    setHash('result-share');
    setIsSharing(true);
    try {
      const blob = await createResultImage();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `poopscan_${timestamp}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      // Web Share API로 이미지만 공유
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          setIsSharing(false);
          return;
        } catch (shareError) {
          if ((shareError as Error).name === 'AbortError') {
            setIsSharing(false);
            return;
          }
        }
      }
      
      // 폴백: 다운로드
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('이미지가 다운로드되었습니다.');
    } catch (error) {
      console.error('Share failed:', error);
      alert('이미지 생성에 실패했습니다. 다시 시도해 주세요.');
    }
    setIsSharing(false);
  };

  // 신호등 색상
  const getStatusStyle = () => {
    switch(analysis.status) {
      case 'normal': return { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700', icon: '🟢' };
      case 'caution': return { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700', icon: '🟡' };
      case 'warning': 
      case 'emergency': return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700', icon: '🔴' };
      default: return { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-700', icon: '⚪' };
    }
  };

  const statusStyle = getStatusStyle();

  // 기저귀가 아닌 경우
  if (analysis.status === 'invalid') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gray-50 text-gray-900 pb-safe flex flex-col">
        <div className="sticky top-0 z-20 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-200">
          <button onClick={onReset} className="w-10 h-10 flex items-center justify-center">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-10">분석 결과</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-image text-3xl text-gray-400"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">기저귀 사진이 아니에요</h2>
          <p className="text-gray-500 text-center mb-6 text-sm">배변이 보이는 기저귀를 선명하게 촬영해 주세요</p>
          
          <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 mb-8">
            <img src={image} className="w-full h-full object-cover" alt="Uploaded" />
          </div>

          <button 
            onClick={onReset}
            className="w-full max-w-xs h-12 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-camera"></i>
            다시 촬영하기
          </button>
        </div>
      </div>
    );
  }

  // 굳기 바 계산 (1-5)
  const firmnessPercent = (analysis.firmnessScore / 5) * 100;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-100 text-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-200">
        <button onClick={onReset} className="w-10 h-10 flex items-center justify-center">
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg pr-10">분석 결과</h1>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="overflow-x-hidden">
        {/* Demo Banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-3 py-2">
          <p className="text-[11px] text-amber-700 text-center">
            <i className="fa-solid fa-flask mr-1"></i>
            데모용 임시 데이터입니다
          </p>
        </div>

        <div className="px-3 py-3 space-y-3 pb-[max(6rem,env(safe-area-inset-bottom))]">
        
        {/* ========== 사진 + 상태 요약 ========== */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {/* 사진 */}
          <div className="relative aspect-[4/3]">
            <img src={image} className="w-full h-full object-cover" alt="Diaper" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* 상태 배지 */}
            <div className="absolute top-3 left-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusStyle.bg} text-white text-sm font-bold`}>
                <span>{statusStyle.icon}</span>
                <span>{analysis.statusLabel}</span>
              </div>
            </div>
            
            {/* 신뢰도 */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
              신뢰도 {analysis.confidenceScore}%
            </div>
            
            {/* 하단 정보 */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white text-xs opacity-80">{analysis.analysisTime}</p>
            </div>
          </div>

          {/* 요약 섹션 */}
          <div className="p-4">
            {/* 신호등 */}
            <div className="flex items-center justify-center gap-6 mb-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  analysis.status === 'normal' ? 'bg-green-500 ring-2 ring-green-200' : 'bg-gray-200'
                }`}>
                  {analysis.status === 'normal' && <i className="fa-solid fa-check text-white text-xs"></i>}
                </div>
                <span className={`text-[10px] mt-1 ${analysis.status === 'normal' ? 'text-green-600 font-bold' : 'text-gray-400'}`}>좋음</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  analysis.status === 'caution' ? 'bg-yellow-500 ring-2 ring-yellow-200' : 'bg-gray-200'
                }`}>
                  {analysis.status === 'caution' && <i className="fa-solid fa-minus text-white text-xs"></i>}
                </div>
                <span className={`text-[10px] mt-1 ${analysis.status === 'caution' ? 'text-yellow-600 font-bold' : 'text-gray-400'}`}>관찰</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  analysis.status === 'warning' || analysis.status === 'emergency' ? 'bg-red-500 ring-2 ring-red-200' : 'bg-gray-200'
                }`}>
                  {(analysis.status === 'warning' || analysis.status === 'emergency') && <i className="fa-solid fa-exclamation text-white text-xs"></i>}
                </div>
                <span className={`text-[10px] mt-1 ${analysis.status === 'warning' || analysis.status === 'emergency' ? 'text-red-600 font-bold' : 'text-gray-400'}`}>주의</span>
              </div>
            </div>

            {/* 한줄 요약 */}
            <p className="text-center text-base font-bold text-gray-800">
              {analysis.summaryLine}
            </p>
          </div>
        </div>

        {/* ========== 2. 분석 결과 (통합) ========== */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-robot text-blue-500"></i>
              <h3 className="text-sm font-bold text-gray-800">AI 분석 결과</h3>
            </div>
            {aiAlertCount > 0 ? (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {aiAlertCount}개 주의
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                이상 없음
              </span>
            )}
          </div>
          
          <div className="p-3 space-y-3">
            {/* 굳기 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-gray-600">굳기</span>
                <span className="text-sm font-bold text-gray-800">{analysis.firmness}</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-green-400 to-blue-400 rounded-full transition-all"
                  style={{ width: `${firmnessPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>딱딱</span>
                <span>정상</span>
                <span>묽음</span>
              </div>
            </div>

            {/* 양 & 색상 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">양</p>
                <p className="font-bold text-gray-800 text-base">{analysis.amount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">색상</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: analysis.colorHex }}></div>
                  <p className="font-bold text-gray-800 text-base">{analysis.colorCategory}</p>
                </div>
              </div>
            </div>

            {/* AI 체크 항목 */}
            {aiChecks.length > 0 && (
              <div className="space-y-1.5">
                {aiChecks.map((check, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${
                      check.isAlert ? 'bg-red-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      check.isAlert ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      <i className={`fa-solid ${check.isAlert ? 'fa-exclamation' : 'fa-check'} text-white text-[10px]`}></i>
                    </div>
                    <p className={`text-sm flex-1 ${check.isAlert ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                      {check.question}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 특이소견 */}
            {analysis.specialFindings.length > 0 ? (
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs font-bold text-orange-700 mb-1">
                  <i className="fa-solid fa-magnifying-glass mr-1"></i>
                  특이소견
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.specialFindings.map((finding, idx) => (
                    <span key={idx} className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-sm">
                      {finding}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  <i className="fa-solid fa-circle-check mr-1"></i>
                  특이소견 없음
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========== 3-2. 부모 확인 체크리스트 ========== */}
        {parentChecks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-3 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check text-yellow-500"></i>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">엄마, 아빠 체크리스트</h3>
                  <p className="text-xs text-gray-500">해당 증상이 있다면, 체크해 주세요</p>
                </div>
              </div>
              {parentCheckedCount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {parentCheckedCount}개 해당
                </span>
              )}
            </div>
            
            <div className="divide-y divide-gray-100">
              {parentChecks.map((check, idx) => {
                const isChecked = checkedParentItems[idx];
                
                return (
                  <button
                    key={idx}
                    onClick={() => toggleParentCheck(idx)}
                    className={`w-full px-3 py-3 flex items-center gap-3 text-left transition-colors ${
                      isChecked ? 'bg-red-50' : 'bg-white active:bg-gray-50'
                    }`}
                  >
                    {/* 체크박스 */}
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      isChecked 
                        ? 'bg-red-500 border-red-500'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && (
                        <i className="fa-solid fa-check text-white text-xs"></i>
                      )}
                    </div>
                    
                    {/* 질문 텍스트 */}
                    <p className={`flex-1 text-sm ${
                      isChecked ? 'text-red-700 font-medium' : 'text-gray-700'
                    }`}>
                      {check.question}
                    </p>
                  </button>
                );
              })}
            </div>
            
            {/* 결과 안내 */}
            <div className={`px-3 py-3 border-t ${
              parentCheckedCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
            }`}>
              {parentCheckedCount > 0 ? (
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span><strong>{parentCheckedCount}개</strong> 증상 해당. 관찰이 필요해요.</span>
                </p>
              ) : (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>해당 증상 없음. 좋아요!</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== 4. 추세 (7일 그래프) ========== */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-chart-simple text-purple-500"></i>
              <h3 className="text-sm font-bold text-gray-800">7일 기록</h3>
            </div>
            <span className="text-xs text-gray-500">
              평균 {analysis.weeklyAverage.toFixed(1)}회/일
            </span>
          </div>
          
          <div className="p-3">
            {analysis.weeklyTrend && analysis.weeklyTrend.length > 0 ? (
              <>
                {/* 바 그래프 */}
                {(() => {
                  const maxCount = Math.max(...analysis.weeklyTrend.map(d => d.count), 1);
                  const barMaxHeight = 80; // 최대 바 높이 (px)
                  
                  return (
                    <div className="flex items-end justify-between gap-2 mb-2" style={{ height: '120px' }}>
                      {analysis.weeklyTrend.map((day, idx) => {
                        const isToday = idx === analysis.weeklyTrend.length - 1;
                        // 횟수에 비례한 높이 계산 (최소 8px, 최대 80px)
                        const barHeight = day.count === 0 
                          ? 8 
                          : Math.max(16, (day.count / maxCount) * barMaxHeight);
                        
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                            {/* 횟수 표시 */}
                            <span className={`text-xs font-bold mb-1 ${
                              isToday ? 'text-purple-600' : 
                              day.status === 'caution' ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              {day.count > 0 ? day.count : '-'}
                            </span>
                            {/* 바 */}
                            <div 
                              className={`w-full max-w-[28px] rounded-t transition-all ${
                                day.count === 0 ? 'bg-gray-200' :
                                day.status === 'caution' ? 'bg-yellow-400' :
                                isToday ? 'bg-purple-500' : 'bg-purple-300'
                              }`}
                              style={{ height: `${barHeight}px` }}
                            ></div>
                            {/* 요일 */}
                            <span className={`text-xs mt-2 ${
                              isToday ? 'text-purple-600 font-bold' : 'text-gray-400'
                            }`}>
                              {isToday ? '오늘' : day.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* 요약 */}
                <div className="mt-3 bg-gray-50 rounded-lg p-3 flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{analysis.todayCount}</p>
                    <p className="text-xs text-gray-500">오늘</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-700">{analysis.weeklyAverage.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">주간 평균</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <i className="fa-solid fa-chart-simple text-2xl mb-1"></i>
                <p className="text-sm">기록된 데이터가 없어요</p>
              </div>
            )}
          </div>
        </div>

        {/* ========== 5. 안내 (다음 행동) ========== */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 bg-white border-b border-gray-100 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-green-500"></i>
            <h3 className="text-sm font-bold text-gray-800">이렇게 해보세요</h3>
          </div>
          
          <div className="p-3 space-y-2">
            {analysis.nextActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-green-50 rounded-lg p-3">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 병원 방문 안내 */}
        {analysis.hospitalAdvice && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-3 py-2.5 bg-red-500 flex items-center gap-2">
              <i className="fa-solid fa-hospital text-white"></i>
              <h3 className="text-sm font-bold text-white">병원 방문 권고</h3>
            </div>
            <div className="p-3">
              <p className="text-sm text-red-700 leading-relaxed">{analysis.hospitalAdvice}</p>
            </div>
          </div>
        )}

        {/* ========== AI 권고 메시지 ========== */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-3 py-2.5 bg-white border-b border-gray-100 flex items-center gap-2">
            <i className="fa-solid fa-comment-dots text-slate-500"></i>
            <h3 className="text-sm font-bold text-gray-800">AI 코멘트</h3>
          </div>
          <div className="p-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              {analysis.aiInsight}
            </p>
          </div>
        </div>

        {/* 면책 조항 */}
        <p className="text-[10px] text-gray-400 text-center leading-relaxed py-2">
          본 서비스는 참고용이며 의료 진단을 대신하지 않습니다.<br/>
          이상 증상 시 소아청소년과 전문의와 상담하세요.
        </p>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button 
            onClick={handleSaveImage}
            disabled={isSaving}
            className="flex-1 h-11 bg-gray-900 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-download"></i>}
            {isSaving ? '저장 중' : '저장'}
          </button>
          <button 
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 h-11 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSharing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-share-nodes"></i>}
            {isSharing ? '준비 중' : '공유'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
