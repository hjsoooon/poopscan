import { HistoryItem, PoopAnalysisResult } from '../types';

const STORAGE_KEY = 'poopscan_history';
const MAX_HISTORY_ITEMS = 30; // 최대 30개 기록 저장

// 기록 목록 가져오기
export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

// 새 기록 저장
export const saveToHistory = (image: string, analysis: PoopAnalysisResult): HistoryItem => {
  const now = new Date();
  const newItem: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: now.getTime(),
    date: now.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    }),
    time: now.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    image,
    analysis,
  };

  try {
    const history = getHistory();
    // 최신 기록을 앞에 추가
    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return newItem;
  } catch (error) {
    console.error('Failed to save history:', error);
    return newItem;
  }
};

// 특정 기록 삭제
export const deleteFromHistory = (id: string): void => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
};

// 모든 기록 삭제
export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
};

// 기록 개수 가져오기
export const getHistoryCount = (): number => {
  return getHistory().length;
};
