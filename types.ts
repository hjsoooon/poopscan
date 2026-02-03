export type AnalysisStatus = 'normal' | 'caution' | 'warning' | 'emergency' | 'invalid';

export type AmountLevel = '소량' | '보통' | '많음';
export type HydrationLevel = '양호' | '보통' | '주의';

export interface PoopAnalysisResult {
  status: AnalysisStatus;
  statusLabel: string;
  description: string;
  
  // 친절한 헤드라인 (엄마 친화적)
  friendlyHeadline: string;         // "오늘 장이 아주 튼튼해요!"
  friendlyEmoji: string;            // ☀️, 💧, ⚠️
  
  // 기본 분석
  color: string;
  colorHex: string;
  colorFriendly: string;            // 황금변, 녹변 등 엄마들이 쓰는 용어
  consistency: string;
  frequencyToday: number;
  
  // 변 모양 (브리스톨 대체)
  poopShape: string;                // 🍌 바나나, 🐰 토끼똥, 🍚 묽은 죽 등
  poopShapeDesc: string;            // 건강해요, 변비 기운, 설사 기운 등
  
  // 추가 의학 지표
  amount: AmountLevel;              // 양
  hasMucus: boolean;                // 점액 유무
  hasBlood: boolean;                // 혈액 유무
  hasUndigested: boolean;           // 소화되지 않은 음식
  hydration: HydrationLevel;        // 수분/탈수 상태
  bristolType: number;              // 브리스톨 척도 (1-7)
  
  // 육아 솔루션 (행동 가이드)
  hydrationAdvice: string;          // 수분 코칭
  careAdvice: string[];             // 식이/케어 제안
  hospitalAdvice: string | null;    // 병원 방문 신호
  
  // AI 인사이트
  insight: string;
  recommendations: string[];
  warningSigns: string[];           // 감지된 주의 사항
  
  // 메타 정보
  analysisTime: string;             // 분석 시간
  confidenceScore: number;          // 신뢰도 (0-100)
}

export interface AppState {
  view: 'camera' | 'analyzing' | 'result';
  capturedImage: string | null;
  analysis: PoopAnalysisResult | null;
}
