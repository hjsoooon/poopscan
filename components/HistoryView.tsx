import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { deleteFromHistory, clearHistory } from '../services/historyStorage';

interface HistoryViewProps {
  history: HistoryItem[];
  onBack: () => void;
  onSelectItem: (item: HistoryItem) => void;
  onHistoryChange: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ 
  history, 
  onBack, 
  onSelectItem,
  onHistoryChange 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'caution': return 'bg-yellow-500';
      case 'warning': return 'bg-orange-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-50 border-green-200';
      case 'caution': return 'bg-yellow-50 border-yellow-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'emergency': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    onHistoryChange();
    setShowDeleteConfirm(null);
  };

  const handleClearAll = () => {
    clearHistory();
    onHistoryChange();
    setShowClearConfirm(false);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center text-amber-700 hover:bg-amber-100 rounded-full transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <h1 className="font-bold text-lg text-amber-800 flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}로고.png`} alt="푸스캔" className="w-6 h-6" />
          분석 기록
        </h1>
        {history.length > 0 ? (
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="w-10 h-10 flex items-center justify-center text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
          >
            <i className="fa-solid fa-trash-can text-sm"></i>
          </button>
        ) : (
          <div className="w-10 h-10"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-clock-rotate-left text-3xl text-amber-400"></i>
            </div>
            <p className="text-amber-800 font-medium mb-2">아직 분석 기록이 없어요</p>
            <p className="text-amber-600 text-sm">사진을 찍어 분석을 시작해 보세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id}
                className={`relative rounded-2xl border overflow-hidden shadow-sm ${getStatusBgColor(item.analysis.status)}`}
              >
                <button
                  onClick={() => onSelectItem(item)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm">
                    <img 
                      src={item.image} 
                      alt="분석 이미지" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(item.analysis.status)}`}></span>
                      <span className="font-semibold text-amber-900">{item.analysis.statusLabel}</span>
                    </div>
                    <p className="text-sm text-amber-700 truncate mb-1">
                      {item.analysis.summaryLine.replace(/[🌟💚✨💛⚠️🚨]/g, '').trim()}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-amber-500">
                      <span>{item.date}</span>
                      <span>·</span>
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <i className="fa-solid fa-chevron-right text-amber-400 text-sm"></i>
                </button>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(item.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-amber-400 hover:text-red-500 hover:bg-white/50 rounded-full transition-colors"
                >
                  <i className="fa-solid fa-xmark text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-trash-can text-red-500"></i>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">기록 삭제</h3>
              <p className="text-sm text-gray-500">이 기록을 삭제하시겠어요?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirm Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fa-solid fa-trash-can text-red-500"></i>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">전체 삭제</h3>
              <p className="text-sm text-gray-500">모든 기록을 삭제하시겠어요?<br/>이 작업은 되돌릴 수 없어요.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium"
              >
                전체 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
