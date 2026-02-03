export type AnalysisStatus = 'normal' | 'caution' | 'warning' | 'emergency' | 'invalid';

export type AmountLevel = '소량' | '보통' | '많음';
export type FirmnessLevel = '딱딱함' | '단단함' | '정상' | '무름' | '묽음';
export type HydrationLevel = '양호' | '보통' | '주의';

// 주의 신호 질문 및 결과
export interface WarningCheck {
  question: string;
  isAlert: boolean;
  detail?: string;
}

// 7일 추세 데이터
export interface TrendData {
  day: string;          // 요일 (월, 화, 수...)
  count: number;        // 배변 횟수
  status: 'normal' | 'caution' | 'warning' | 'none';  // 상태
}

export interface PoopAnalysisResult {
  status: AnalysisStatus;
  statusLabel: string;
  
  // 1. 요약 (신호등 + 한줄)
  summaryLine: string;              // "건강한 변이에요!"
  
  // 2. 분석 (굳기/양/색/특이소견)
  firmness: FirmnessLevel;          // 굳기
  firmnessScore: number;            // 1-5 (1:딱딱함 ~ 5:묽음)
  amount: AmountLevel;              // 양
  amountScore: number;              // 1-3 (1:소량, 2:보통, 3:많음)
  color: string;                    // 색상 설명
  colorHex: string;                 // 색상 코드
  colorCategory: string;            // 황금변, 녹변, 갈색변 등
  specialFindings: string[];        // 특이소견 (점액, 혈흔, 미소화 등)
  
  // 3. 주의 신호 (질문 3~5개 + 결과)
  warningChecks: WarningCheck[];
  
  // 4. 추세 (7일 그래프/카운트)
  weeklyTrend: TrendData[];         // 최근 7일 추세
  weeklyAverage: number;            // 주간 평균 횟수
  todayCount: number;               // 오늘 횟수
  
  // 5. 안내 (다음 행동)
  nextActions: string[];            // 다음 할 일
  hospitalAdvice: string | null;    // 병원 방문 권고 (있을 경우만)
  
  // 메타 정보
  analysisTime: string;
  confidenceScore: number;
}

export interface AppState {
  view: 'camera' | 'analyzing' | 'result';
  capturedImage: string | null;
  analysis: PoopAnalysisResult | null;
}
