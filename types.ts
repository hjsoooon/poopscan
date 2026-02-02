export type AnalysisStatus = 'normal' | 'caution' | 'warning' | 'emergency' | 'invalid';

export type AmountLevel = '소량' | '보통' | '많음';
export type SmellLevel = '무취' | '정상' | '시큼함' | '악취';
export type HydrationLevel = '양호' | '보통' | '주의';

export interface PoopAnalysisResult {
  status: AnalysisStatus;
  statusLabel: string;
  description: string;
  
  // 기본 분석
  color: string;
  colorHex: string;
  consistency: string;
  frequencyToday: number;
  
  // 추가 의학 지표
  amount: AmountLevel;              // 양
  smell: SmellLevel;                // 냄새
  hasMucus: boolean;                // 점액 유무
  hasBlood: boolean;                // 혈액 유무
  hasUndigested: boolean;           // 소화되지 않은 음식
  hydration: HydrationLevel;        // 수분/탈수 상태
  bristolType: number;              // 브리스톨 척도 (1-7)
  
  // AI 인사이트
  insight: string;
  recommendations: string[];
  warningSignsdetected: string[];     // 감지된 주의 사항
  
  // 메타 정보
  analysisTime: string;             // 분석 시간
  confidenceScore: number;          // 신뢰도 (0-100)
}

export interface AppState {
  view: 'camera' | 'analyzing' | 'result';
  capturedImage: string | null;
  analysis: PoopAnalysisResult | null;
}
