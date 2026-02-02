import { PoopAnalysisResult } from "../types";

// 현재 시간 포맷팅
const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleString('ko-KR', { 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 랜덤 결과 데이터
const mockResults: PoopAnalysisResult[] = [
  {
    status: 'normal',
    statusLabel: '정상',
    description: '건강한 상태의 대변입니다. 걱정하지 않으셔도 됩니다.',
    color: '황금색',
    colorHex: '#DAA520',
    consistency: '부드러움',
    frequencyToday: 3,
    amount: '보통',
    smell: '정상',
    hasMucus: false,
    hasBlood: false,
    hasUndigested: false,
    hydration: '양호',
    bristolType: 4,
    insight: '모유 수유 아기에게 흔히 보이는 건강한 대변입니다. 황금색의 부드러운 변은 소화가 잘 되고 있다는 신호입니다.',
    recommendations: ['현재 수유 패턴 유지', '충분한 수분 섭취', '규칙적인 배변 기록'],
    warningSigns: [],
    analysisTime: getCurrentTime(),
    confidenceScore: 94
  },
  {
    status: 'normal',
    statusLabel: '정상',
    description: '정상적인 대변 색상과 농도입니다.',
    color: '겨자색',
    colorHex: '#E1AD01',
    consistency: '크림형',
    frequencyToday: 4,
    amount: '보통',
    smell: '정상',
    hasMucus: false,
    hasBlood: false,
    hasUndigested: false,
    hydration: '양호',
    bristolType: 5,
    insight: '아기의 소화 상태가 양호합니다. 겨자색 크림형 변은 모유 수유 아기의 전형적인 건강한 변입니다.',
    recommendations: ['규칙적인 수유 시간 유지', '아기 컨디션 관찰', '배변 일지 작성'],
    warningSigns: [],
    analysisTime: getCurrentTime(),
    confidenceScore: 91
  },
  {
    status: 'normal',
    statusLabel: '정상',
    description: '녹색빛이 약간 있지만 정상 범위입니다.',
    color: '녹황색',
    colorHex: '#9ACD32',
    consistency: '보통',
    frequencyToday: 2,
    amount: '보통',
    smell: '정상',
    hasMucus: false,
    hasBlood: false,
    hasUndigested: false,
    hydration: '양호',
    bristolType: 4,
    insight: '녹색빛은 담즙 색소 때문이며 정상입니다. 전유(foremilk)를 많이 먹거나 장 통과 시간이 빠를 때 나타날 수 있습니다.',
    recommendations: ['현재 분유 유지', '수유 시간 충분히', '배변 횟수 기록'],
    warningSigns: [],
    analysisTime: getCurrentTime(),
    confidenceScore: 88
  },
  {
    status: 'caution',
    statusLabel: '관찰 필요',
    description: '약간 묽은 편이니 수분 섭취와 탈수 증상에 주의해 주세요.',
    color: '노란색',
    colorHex: '#EAB308',
    consistency: '묽음',
    frequencyToday: 6,
    amount: '많음',
    smell: '시큼함',
    hasMucus: true,
    hasBlood: false,
    hasUndigested: false,
    hydration: '주의',
    bristolType: 6,
    insight: '배변 횟수가 평소보다 많고 묽은 편입니다. 점액이 소량 관찰되며 장이 예민한 상태일 수 있습니다. 탈수 증상(눈물 없이 울기, 소변량 감소)을 주의 깊게 관찰해 주세요.',
    recommendations: ['모유/분유 자주 소량씩', '수분 보충 (전해질 용액)', '체온 모니터링', '기저귀 발진 예방'],
    warningSigns: ['점액 발견', '배변 횟수 증가', '묽은 변'],
    analysisTime: getCurrentTime(),
    confidenceScore: 85
  },
  {
    status: 'caution',
    statusLabel: '관찰 필요',
    description: '단단한 편이니 수분 섭취를 늘려주세요.',
    color: '진갈색',
    colorHex: '#8B4513',
    consistency: '딱딱함',
    frequencyToday: 1,
    amount: '소량',
    smell: '정상',
    hasMucus: false,
    hasBlood: false,
    hasUndigested: true,
    hydration: '보통',
    bristolType: 2,
    insight: '변비 가능성이 있습니다. 소화되지 않은 음식 입자가 일부 관찰됩니다. 이유식 중이라면 섬유질을 적절히 조절하고 수분 섭취를 늘려주세요.',
    recommendations: ['물 섭취량 늘리기', '배 마사지 (시계 방향)', '섬유질 적정량 섭취', '자전거 타기 운동'],
    warningSigns: ['변비 징후', '소화 불완전'],
    analysisTime: getCurrentTime(),
    confidenceScore: 82
  },
  {
    status: 'normal',
    statusLabel: '정상',
    description: '갈색 대변은 이유식을 시작한 아기에게 정상입니다.',
    color: '연갈색',
    colorHex: '#D2691E',
    consistency: '성형됨',
    frequencyToday: 2,
    amount: '보통',
    smell: '정상',
    hasMucus: false,
    hasBlood: false,
    hasUndigested: true,
    hydration: '양호',
    bristolType: 4,
    insight: '이유식 시작 후 대변 색과 질감이 변하는 것은 자연스러운 현상입니다. 일부 소화되지 않은 음식 입자는 6-12개월 아기에게 흔히 관찰됩니다.',
    recommendations: ['다양한 이유식 시도', '알레르기 반응 관찰', '새 음식은 3일 간격으로'],
    warningSigns: [],
    analysisTime: getCurrentTime(),
    confidenceScore: 90
  },
  {
    status: 'normal',
    statusLabel: '정상',
    description: '분유 수유 아기의 전형적인 건강한 대변입니다.',
    color: '황갈색',
    colorHex: '#C4A35A',
    consistency: '페이스트형',
    frequencyToday: 2,
    amount: '보통',
    smell: '정상',
    hasMucus: false,
    hasBlood: false,
    hasUndigested: false,
    hydration: '양호',
    bristolType: 4,
    insight: '분유 수유 아기에게 나타나는 정상적인 대변입니다. 황갈색의 페이스트 형태는 분유가 잘 소화되고 있음을 나타냅니다.',
    recommendations: ['현재 분유 유지', '적정 온도로 수유', '트림 잘 시키기'],
    warningSigns: [],
    analysisTime: getCurrentTime(),
    confidenceScore: 92
  },
  {
    status: 'caution',
    statusLabel: '관찰 필요',
    description: '거품이 섞인 변이 관찰됩니다. 유당 불내증 가능성을 확인해 보세요.',
    color: '연노랑',
    colorHex: '#F0E68C',
    consistency: '거품형',
    frequencyToday: 5,
    amount: '많음',
    smell: '시큼함',
    hasMucus: false,
    hasBlood: false,
    hasUndigested: false,
    hydration: '보통',
    bristolType: 6,
    insight: '거품이 섞인 시큼한 냄새의 변은 유당 불내증이나 전유-후유 불균형의 신호일 수 있습니다. 한쪽 가슴을 충분히 비운 후 다른 쪽으로 바꿔보세요.',
    recommendations: ['한쪽 가슴 충분히 수유', '수유 자세 확인', '소아과 상담 권장'],
    warningSigns: ['거품 변', '시큼한 냄새', '잦은 배변'],
    analysisTime: getCurrentTime(),
    confidenceScore: 78
  }
];

// 기저귀가 아닌 경우 결과
const invalidResult: PoopAnalysisResult = {
  status: 'invalid',
  statusLabel: '인식 불가',
  description: '기저귀 사진이 아닙니다.',
  color: '-',
  colorHex: '#CCCCCC',
  consistency: '-',
  frequencyToday: 0,
  amount: '보통',
  smell: '정상',
  hasMucus: false,
  hasBlood: false,
  hasUndigested: false,
  hydration: '보통',
  bristolType: 0,
  insight: '기저귀 사진을 업로드해 주세요. 배변이 보이는 기저귀를 선명하게 촬영해 주시면 더 정확한 분석이 가능합니다.',
  recommendations: ['기저귀 사진 다시 촬영', '밝은 곳에서 촬영', '배변 부분이 잘 보이게 촬영'],
  warningSigns: [],
  analysisTime: getCurrentTime(),
  confidenceScore: 0
};

export async function analyzePoopImage(base64Image: string): Promise<PoopAnalysisResult> {
  // 분석하는 것처럼 1~2초 딜레이
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // 15% 확률로 "기저귀가 아님" 결과 반환 (데모용)
  if (Math.random() < 0.15) {
    return { ...invalidResult, analysisTime: getCurrentTime() };
  }
  
  // 랜덤 결과 반환 (시간 업데이트)
  const randomIndex = Math.floor(Math.random() * mockResults.length);
  return { ...mockResults[randomIndex], analysisTime: getCurrentTime() };
}
