import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { PoopAnalysisResult } from '../types';

interface ResultViewProps {
  image: string;
  analysis: PoopAnalysisResult;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ image, analysis, onReset }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // 화면 그대로 캡처
  const createResultImage = async (): Promise<Blob> => {
    if (!reportRef.current) {
      throw new Error('Report element not found');
    }

    const canvas = await html2canvas(reportRef.current, {
      scale: 2, // 고화질을 위해 2배 스케일
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#F9FAFB',
      logging: false,
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });
  };

  const handleSaveImage = async () => {
    setIsSaving(true);
    try {
      const blob = await createResultImage();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `poopscan_${timestamp}.png`;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' });
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
      const filename = `poopscan_${timestamp}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

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
        alert('분석 결과가 다운로드되었습니다!');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
        alert('공유에 실패했습니다.');
      }
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
  
  // 경고 체크 중 alert가 있는 것의 개수
  const alertCount = analysis.warningChecks.filter(w => w.isAlert).length;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-50 text-gray-900 pb-[max(6rem,env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center border-b border-gray-200">
        <button onClick={onReset} className="w-10 h-10 flex items-center justify-center -ml-2">
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg -mr-8">분석 결과</h1>
      </div>

      {/* 캡처 영역 시작 */}
      <div ref={reportRef} className="bg-gray-50">
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
          {/* 신호등 */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <div className={`w-5 h-5 rounded-full ${analysis.status === 'normal' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`w-5 h-5 rounded-full ${analysis.status === 'caution' ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
              <div className={`w-5 h-5 rounded-full ${analysis.status === 'warning' || analysis.status === 'emergency' ? 'bg-red-500' : 'bg-gray-200'}`}></div>
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

        {/* ========== 3. 주의 신호 (질문 체크리스트) ========== */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-yellow-500"></i>
              주의 신호 체크
            </h3>
            {alertCount > 0 ? (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {alertCount}개 주의
              </span>
            ) : (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                모두 양호
              </span>
            )}
          </div>
          
          <div className="divide-y divide-gray-50">
            {analysis.warningChecks.map((check, idx) => (
              <div key={idx} className="px-4 py-3 flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  check.isAlert ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <i className={`fa-solid ${check.isAlert ? 'fa-exclamation text-red-500' : 'fa-check text-green-500'} text-[10px]`}></i>
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${check.isAlert ? 'text-red-700 font-medium' : 'text-gray-600'}`}>
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

        {/* ========== 4. 추세 (7일 그래프) ========== */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-purple-500"></i>
              7일 추세
            </h3>
            <span className="text-xs text-gray-500">
              평균 {analysis.weeklyAverage.toFixed(1)}회/일
            </span>
          </div>
          
          <div className="p-4">
            {/* 바 그래프 */}
            <div className="flex items-end justify-between gap-1 h-24 mb-2">
              {analysis.weeklyTrend.map((day, idx) => {
                const maxCount = Math.max(...analysis.weeklyTrend.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                const isToday = idx === analysis.weeklyTrend.length - 1;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 mb-1">{day.count > 0 ? day.count : '-'}</span>
                    <div 
                      className={`w-full rounded-t-sm transition-all ${
                        day.count === 0 ? 'bg-gray-100' :
                        day.status === 'caution' ? 'bg-yellow-400' :
                        isToday ? 'bg-blue-500' : 'bg-blue-300'
                      }`}
                      style={{ height: `${day.count === 0 ? 8 : Math.max(height, 15)}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
            
            {/* 요일 레이블 */}
            <div className="flex justify-between">
              {analysis.weeklyTrend.map((day, idx) => {
                const isToday = idx === analysis.weeklyTrend.length - 1;
                return (
                  <div key={idx} className="flex-1 text-center">
                    <span className={`text-[10px] ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                      {isToday ? '오늘' : day.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 요약 */}
            <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-blue-600">{analysis.todayCount}</p>
                <p className="text-[10px] text-gray-500">오늘</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-gray-700">{analysis.weeklyAverage.toFixed(1)}</p>
                <p className="text-[10px] text-gray-500">주간 평균</p>
              </div>
            </div>
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
      {/* 캡처 영역 끝 */}

      {/* 버튼 (캡처 영역 외부) */}
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
