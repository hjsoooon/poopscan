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
  
  // AI 분석 결과와 부모 확인 사항 분리
  const aiChecks = analysis.warningChecks.filter(w => w.type === 'ai');
  const parentChecks = analysis.warningChecks.filter(w => w.type === 'parent');
  
  // 부모 확인 체크리스트 상태
  const [checkedParentItems, setCheckedParentItems] = useState<boolean[]>(
    new Array(parentChecks.length).fill(false)
  );

  const toggleParentCheck = (idx: number) => {
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
        const infoHeight = 520;
        
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
        let y = imgHeight + 48;

        // 요약 (크게)
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 32px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        const summaryText = analysis.summaryLine.replace(/[^\w\sㄱ-힣.,!?]/g, '');
        ctx.fillText(summaryText.slice(0, 20), padding, y);
        
        y += 36;
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '22px -apple-system, sans-serif';
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
          <button onClick={onReset} className="w-10 h-10 flex items-center justify-center -ml-2">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <h1 className="flex-1 text-center font-bold text-lg -mr-8">분석 결과</h1>
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
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 text-gray-900 pb-[max(6rem,env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-200">
        <button onClick={onReset} className="w-10 h-10 flex items-center justify-center -ml-2">
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg -mr-8">분석 결과</h1>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="bg-gray-50">
        {/* Demo Banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2">
          <p className="text-[11px] text-amber-700 text-center">
            <i className="fa-solid fa-flask mr-1"></i>
            데모용 임시 데이터입니다
          </p>
        </div>

        <div className="p-4 pb-3 space-y-4">
        
        {/* ========== 사진 (상단 배치) ========== */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm">
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

        {/* ========== 1. 요약 (신호등 + 한줄) ========== */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {/* 신호등 - 레이블 포함 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                analysis.status === 'normal' ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-200'
              }`}>
                {analysis.status === 'normal' && <i className="fa-solid fa-check text-white text-sm"></i>}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${analysis.status === 'normal' ? 'text-green-600' : 'text-gray-400'}`}>좋음</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                analysis.status === 'caution' ? 'bg-yellow-500 ring-4 ring-yellow-100' : 'bg-gray-200'
              }`}>
                {analysis.status === 'caution' && <i className="fa-solid fa-minus text-white text-sm"></i>}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${analysis.status === 'caution' ? 'text-yellow-600' : 'text-gray-400'}`}>관찰</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                analysis.status === 'warning' || analysis.status === 'emergency' ? 'bg-red-500 ring-4 ring-red-100' : 'bg-gray-200'
              }`}>
                {(analysis.status === 'warning' || analysis.status === 'emergency') && <i className="fa-solid fa-exclamation text-white text-sm"></i>}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${analysis.status === 'warning' || analysis.status === 'emergency' ? 'text-red-600' : 'text-gray-400'}`}>주의</span>
            </div>
          </div>

          {/* 한줄 요약 */}
          <p className="text-center text-base font-bold text-gray-800 leading-relaxed">
            {analysis.summaryLine}
          </p>
        </div>

        {/* ========== 2. 분석 (굳기/양/색/특이소견) ========== */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-clipboard-list text-blue-500"></i>
              분석 결과
            </h3>
          </div>
          
          <div className="p-4 space-y-4">
            {/* 굳기 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">굳기</span>
                <span className="text-sm font-bold">{analysis.firmness}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-green-400 to-blue-400 rounded-full transition-all"
                  style={{ width: `${firmnessPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>딱딱</span>
                <span>정상</span>
                <span>묽음</span>
              </div>
            </div>

            {/* 양 & 색상 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">양</p>
                <p className="font-bold text-gray-800">{analysis.amount}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: analysis.colorHex }}></div>
                  <div>
                    <p className="text-xs text-gray-500">색상</p>
                    <p className="font-bold text-gray-800 text-sm">{analysis.colorCategory}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 특이소견 */}
            {analysis.specialFindings.length > 0 ? (
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-xs font-bold text-orange-700 mb-1">
                  <i className="fa-solid fa-magnifying-glass mr-1"></i>
                  특이소견
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.specialFindings.map((finding, idx) => (
                    <span key={idx} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                      {finding}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-xs text-green-700">
                  <i className="fa-solid fa-circle-check mr-1"></i>
                  특이소견 없음
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========== 3-1. AI 분석 결과 ========== */}
        {aiChecks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2 text-blue-800">
                  <i className="fa-solid fa-robot text-blue-500"></i>
                  AI 분석 결과
                </h3>
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
            </div>
            
            <div className="divide-y divide-gray-50">
              {aiChecks.map((check, idx) => (
                <div 
                  key={idx} 
                  className={`px-4 py-3 flex items-start gap-3 ${
                    check.isAlert ? 'bg-red-50' : ''
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    check.isAlert ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    <i className={`fa-solid ${check.isAlert ? 'fa-exclamation' : 'fa-check'} text-white text-[10px]`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${check.isAlert ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                      {check.question}
                    </p>
                    {check.isAlert && check.detail && (
                      <p className="text-xs text-red-500 mt-1">{check.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== 3-2. 부모 확인 체크리스트 ========== */}
        {parentChecks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold flex items-center gap-2 text-yellow-800">
                  <i className="fa-solid fa-clipboard-check text-yellow-600"></i>
                  부모님 확인 사항
                </h3>
                {parentCheckedCount > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {parentCheckedCount}개 해당
                  </span>
                )}
              </div>
              <p className="text-xs text-yellow-700">해당하는 증상이 있으면 체크해 주세요</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {parentChecks.map((check, idx) => {
                const isChecked = checkedParentItems[idx];
                
                return (
                  <button
                    key={idx}
                    onClick={() => toggleParentCheck(idx)}
                    className={`w-full px-4 py-3.5 flex items-start gap-3 text-left transition-colors ${
                      isChecked ? 'bg-red-50' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* 체크박스 */}
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      isChecked 
                        ? 'bg-red-500 border-red-500'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isChecked && (
                        <i className="fa-solid fa-check text-white text-xs"></i>
                      )}
                    </div>
                    
                    {/* 질문 텍스트 */}
                    <div className="flex-1 pt-0.5">
                      <p className={`text-sm ${
                        isChecked ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>
                        {check.question}
                      </p>
                      {isChecked && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <i className="fa-solid fa-circle-info"></i>
                          이 증상이 있다면 주의가 필요해요
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* 결과 안내 */}
            <div className={`px-4 py-3 border-t ${
              parentCheckedCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
            }`}>
              {parentCheckedCount > 0 ? (
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span><strong>{parentCheckedCount}개</strong> 증상이 해당돼요. 주의 깊게 관찰해 주세요.</span>
                </p>
              ) : (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>해당하는 증상이 없어요. 좋아요!</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== 4. 추세 (7일 그래프) ========== */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 text-purple-800">
              <i className="fa-solid fa-chart-simple text-purple-500"></i>
              7일 배변 기록
            </h3>
            <span className="text-xs text-purple-600 font-medium">
              평균 {analysis.weeklyAverage.toFixed(1)}회/일
            </span>
          </div>
          
          <div className="p-4">
            {analysis.weeklyTrend && analysis.weeklyTrend.length > 0 ? (
              <>
                {/* 바 그래프 */}
                <div className="flex items-end justify-between gap-2 h-32 mb-3 px-1">
                  {analysis.weeklyTrend.map((day, idx) => {
                    const maxCount = Math.max(...analysis.weeklyTrend.map(d => d.count), 1);
                    const height = (day.count / maxCount) * 100;
                    const isToday = idx === analysis.weeklyTrend.length - 1;
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        {/* 횟수 표시 */}
                        <span className={`text-xs font-bold mb-1 ${
                          isToday ? 'text-purple-600' : 
                          day.status === 'caution' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {day.count > 0 ? day.count : '-'}
                        </span>
                        {/* 바 */}
                        <div 
                          className={`w-full max-w-[28px] rounded-t-md transition-all ${
                            day.count === 0 ? 'bg-gray-200' :
                            day.status === 'caution' ? 'bg-gradient-to-t from-yellow-500 to-yellow-400' :
                            isToday ? 'bg-gradient-to-t from-purple-600 to-purple-400' : 
                            'bg-gradient-to-t from-purple-400 to-purple-300'
                          }`}
                          style={{ 
                            height: `${day.count === 0 ? 10 : Math.max(height, 20)}%`,
                            minHeight: day.count === 0 ? '8px' : '16px'
                          }}
                        ></div>
                        {/* 요일 */}
                        <span className={`text-[11px] mt-2 ${
                          isToday ? 'text-purple-600 font-bold' : 'text-gray-500'
                        }`}>
                          {isToday ? '오늘' : day.day}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 요약 카드 */}
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{analysis.todayCount}</p>
                    <p className="text-xs text-gray-500 mt-1">오늘 횟수</p>
                  </div>
                  <div className="w-px h-12 bg-purple-200"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{analysis.weeklyAverage.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">주간 평균</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <i className="fa-solid fa-chart-simple text-3xl mb-2"></i>
                <p className="text-sm">아직 기록된 데이터가 없어요</p>
              </div>
            )}
          </div>
        </div>

        {/* ========== 5. 안내 (다음 행동) ========== */}
        <div className="bg-blue-500 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <span className="font-bold">다음에 이렇게 해보세요</span>
          </div>
          
          <div className="space-y-2">
            {analysis.nextActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/10 rounded-lg p-2.5">
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 병원 방문 안내 */}
        {analysis.hospitalAdvice && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <i className="fa-solid fa-hospital text-red-500"></i>
              <span className="text-sm font-bold text-red-700">병원 방문 권고</span>
            </div>
            <p className="text-sm text-red-700 leading-relaxed">{analysis.hospitalAdvice}</p>
          </div>
        )}

        {/* ========== AI 권고 메시지 ========== */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-robot"></i>
            </div>
            <span className="font-bold text-sm">AI 분석 코멘트</span>
          </div>
          <p className="text-sm leading-relaxed opacity-90">
            "{analysis.aiInsight}"
          </p>
        </div>

        {/* 면책 조항 */}
        <p className="text-[10px] text-gray-400 text-center leading-relaxed pt-2">
          본 서비스는 참고용이며 의료 진단을 대신하지 않습니다.<br/>
          이상 증상 시 소아청소년과 전문의와 상담하세요.
        </p>
        </div>
      </div>

      {/* 버튼 */}
      <div className="px-4 pb-4 space-y-2 bg-gray-50">
        <button 
          onClick={handleSaveImage}
          disabled={isSaving}
          className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-download"></i>}
          {isSaving ? '저장 중...' : '리포트 저장'}
        </button>
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className="w-full h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSharing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-share-nodes"></i>}
          {isSharing ? '공유 준비 중...' : '공유하기'}
        </button>
      </div>
    </div>
  );
};

export default ResultView;
