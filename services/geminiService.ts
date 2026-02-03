import { PoopAnalysisResult, WarningCheck, TrendData } from "../types";

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

// 요일 배열 생성 (최근 7일)
const getWeekDays = (): string[] => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const result: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(days[d.getDay()]);
  }
  return result;
};

// 랜덤 주간 트렌드 생성
const generateWeeklyTrend = (baseCount: number, status: 'normal' | 'caution'): TrendData[] => {
  const days = getWeekDays();
  return days.map((day, idx) => {
    const variation = Math.floor(Math.random() * 3) - 1;
    const count = Math.max(0, baseCount + variation);
    const isToday = idx === 6;
    return {
      day,
      count: isToday ? baseCount : count,
      status: count === 0 ? 'none' : (count > 5 ? 'caution' : 'normal')
    };
  });
};

// 랜덤 결과 데이터
const mockResults: PoopAnalysisResult[] = [
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '오늘도 건강한 변이에요! 잘 먹고 잘 싸고 있어요 👍',
    firmness: '정상',
    firmnessScore: 3,
    amount: '보통',
    amountScore: 2,
    color: '황금빛 노란색',
    colorHex: '#DAA520',
    colorCategory: '황금변',
    specialFindings: [],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: false },
      { question: '점액(끈적한 것)이 보이나요?', isAlert: false },
      { question: '평소보다 냄새가 심한가요?', isAlert: false },
      { question: '아기가 배변 시 울거나 힘들어하나요?', isAlert: false },
    ],
    weeklyTrend: generateWeeklyTrend(3, 'normal'),
    weeklyAverage: 3.2,
    todayCount: 3,
    nextActions: [
      '현재 수유/이유식 패턴을 유지하세요',
      '하루 2-4회 배변은 건강한 범위예요',
    ],
    hospitalAdvice: null,
    aiInsight: '황금빛 노란색의 부드러운 변은 소화가 잘 되고 있다는 신호예요. 장 건강이 아주 좋은 상태입니다. 현재 수유 패턴을 유지하시면 됩니다.',
    analysisTime: getCurrentTime(),
    confidenceScore: 94
  },
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '모유 수유 아기의 전형적인 건강 변이에요! ✨',
    firmness: '무름',
    firmnessScore: 4,
    amount: '보통',
    amountScore: 2,
    color: '겨자빛 노란색',
    colorHex: '#E1AD01',
    colorCategory: '겨자변',
    specialFindings: [],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: false },
      { question: '점액(끈적한 것)이 보이나요?', isAlert: false },
      { question: '하루 8회 이상 묽은 변을 보나요?', isAlert: false },
      { question: '아기가 처지거나 기운이 없나요?', isAlert: false },
    ],
    weeklyTrend: generateWeeklyTrend(4, 'normal'),
    weeklyAverage: 4.1,
    todayCount: 4,
    nextActions: [
      '모유 수유 아기는 무른 변이 정상이에요',
      '수유 패턴을 잘 유지하고 있어요',
    ],
    hospitalAdvice: null,
    aiInsight: '겨자색 크림형 변은 모유 수유 아기의 전형적인 건강 변이에요. 엄마 젖이 아기에게 잘 맞고, 소화도 원활하게 되고 있어요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 91
  },
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '녹변이지만 정상이에요! 걱정 마세요 🌿',
    firmness: '정상',
    firmnessScore: 3,
    amount: '보통',
    amountScore: 2,
    color: '녹황빛 색상',
    colorHex: '#9ACD32',
    colorCategory: '녹변',
    specialFindings: [],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: false },
      { question: '점액(끈적한 것)이 보이나요?', isAlert: false },
      { question: '발열(38도 이상)이 있나요?', isAlert: false },
      { question: '구토를 동반하나요?', isAlert: false },
    ],
    weeklyTrend: generateWeeklyTrend(2, 'normal'),
    weeklyAverage: 2.3,
    todayCount: 2,
    nextActions: [
      '녹색 변은 담즙 색소로 정상이에요',
      '한쪽 젖을 충분히 먹인 후 바꿔주세요',
    ],
    hospitalAdvice: null,
    aiInsight: '녹색빛은 담즙 색소 때문이며 정상이에요. 전유(foremilk)를 많이 먹거나 장 통과 시간이 빠를 때 나타날 수 있어요. 한쪽 젖을 충분히 먹인 후 바꿔주시면 됩니다.',
    analysisTime: getCurrentTime(),
    confidenceScore: 88
  },
  {
    status: 'caution',
    statusLabel: '관찰필요',
    summaryLine: '설사 기운이 있어요. 수분 섭취에 신경 써주세요 💧',
    firmness: '묽음',
    firmnessScore: 5,
    amount: '많음',
    amountScore: 3,
    color: '옅은 노란색',
    colorHex: '#EAB308',
    colorCategory: '물변',
    specialFindings: ['점액 소량 발견'],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: false },
      { question: '점액(끈적한 것)이 보이나요?', isAlert: true, detail: '소량의 점액이 관찰됩니다' },
      { question: '하루 8회 이상 묽은 변을 보나요?', isAlert: false },
      { question: '아기가 처지거나 기운이 없나요?', isAlert: false },
      { question: '탈수 증상(소변 감소, 입술 마름)이 있나요?', isAlert: false },
    ],
    weeklyTrend: generateWeeklyTrend(6, 'caution'),
    weeklyAverage: 5.4,
    todayCount: 6,
    nextActions: [
      '모유/분유를 조금씩 자주 먹여주세요',
      '전해질 용액(페디라이트)을 고려해 보세요',
      '기저귀 발진 예방에 신경 써주세요',
    ],
    hospitalAdvice: '탈수 증상(눈물 없이 울기, 소변 감소, 입술 마름)이 나타나면 소아과를 방문하세요',
    aiInsight: '배변 횟수가 평소보다 많고 묽은 편이에요. 점액이 소량 관찰되며 장이 예민한 상태일 수 있어요. 탈수 예방을 위해 수분 섭취에 신경 써주세요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 85
  },
  {
    status: 'caution',
    statusLabel: '관찰필요',
    summaryLine: '변비 기운이 있어요. 수분과 섬유질을 늘려주세요 🐰',
    firmness: '딱딱함',
    firmnessScore: 1,
    amount: '소량',
    amountScore: 1,
    color: '진한 갈색',
    colorHex: '#8B4513',
    colorCategory: '갈색변',
    specialFindings: ['딱딱한 덩어리 형태', '덜 소화된 음식물 조금'],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: false },
      { question: '3일 이상 변을 보지 못했나요?', isAlert: false },
      { question: '배가 빵빵하게 부풀어 있나요?', isAlert: false },
      { question: '배변 시 울거나 힘들어하나요?', isAlert: true, detail: '변비로 인한 불편감이 있을 수 있어요' },
    ],
    weeklyTrend: generateWeeklyTrend(1, 'caution'),
    weeklyAverage: 1.1,
    todayCount: 1,
    nextActions: [
      '물 섭취량을 늘려주세요',
      '배 마사지를 시계 방향으로 3분간 해주세요',
      '다리를 자전거 타듯 움직여 주세요',
    ],
    hospitalAdvice: '3일 이상 변을 못 보거나 배가 많이 빵빵하면 소아과를 방문하세요',
    aiInsight: '변이 딱딱하고 작게 나왔어요. 변비 가능성이 있으니 수분 섭취를 늘리고, 배 마사지와 자전거 운동을 해주시면 도움이 됩니다.',
    analysisTime: getCurrentTime(),
    confidenceScore: 82
  },
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '이유식 시작 후 정상적인 변화예요! 🥄',
    firmness: '단단함',
    firmnessScore: 2,
    amount: '보통',
    amountScore: 2,
    color: '연한 갈색',
    colorHex: '#D2691E',
    colorCategory: '갈색변',
    specialFindings: ['덜 소화된 음식물 일부 (정상)'],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: false },
      { question: '특정 음식 후 피부 발진이 있나요?', isAlert: false },
      { question: '구토나 심한 보챔이 있나요?', isAlert: false },
      { question: '설사가 지속되나요?', isAlert: false },
    ],
    weeklyTrend: generateWeeklyTrend(2, 'normal'),
    weeklyAverage: 2.0,
    todayCount: 2,
    nextActions: [
      '새 음식은 3일 간격으로 한 가지씩 시도하세요',
      '음식 조각이 보이는 건 이 시기에 정상이에요',
      '알레르기 반응(발진, 구토)을 관찰하세요',
    ],
    hospitalAdvice: null,
    aiInsight: '이유식 시작 후 대변 색과 질감이 변하는 것은 자연스러운 현상이에요. 일부 소화되지 않은 음식 입자는 6-12개월 아기에게 흔히 관찰되니 걱정 마세요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 90
  },
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '분유가 아기에게 잘 맞고 있어요! 🍼',
    firmness: '정상',
    firmnessScore: 3,
    amount: '보통',
    amountScore: 2,
    color: '황갈색',
    colorHex: '#C4A35A',
    colorCategory: '황갈변',
    specialFindings: [],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: false },
      { question: '점액(끈적한 것)이 보이나요?', isAlert: false },
      { question: '분유 교체 후 변화가 있나요?', isAlert: false },
      { question: '구토나 심한 보챔이 있나요?', isAlert: false },
    ],
    weeklyTrend: generateWeeklyTrend(2, 'normal'),
    weeklyAverage: 2.1,
    todayCount: 2,
    nextActions: [
      '현재 분유를 계속 유지하세요',
      '수유 후 트림을 잘 시켜주세요',
      '분유 수유 아기는 1-2회/일도 정상이에요',
    ],
    hospitalAdvice: null,
    aiInsight: '분유 수유 아기에게 나타나는 정상적인 대변이에요. 황갈색의 페이스트 형태는 분유가 잘 소화되고 있다는 신호입니다.',
    analysisTime: getCurrentTime(),
    confidenceScore: 92
  },
  {
    status: 'warning',
    statusLabel: '주의',
    summaryLine: '혈흔이 발견되었어요. 관찰이 필요합니다 ⚠️',
    firmness: '정상',
    firmnessScore: 3,
    amount: '보통',
    amountScore: 2,
    color: '갈색 (붉은 점 포함)',
    colorHex: '#8B4513',
    colorCategory: '혈변',
    specialFindings: ['미세 혈흔 관찰', '점액 동반'],
    warningChecks: [
      { question: '변에 피가 섞여 있나요?', isAlert: true, detail: '소량의 혈흔이 관찰됩니다' },
      { question: '점액(끈적한 것)이 보이나요?', isAlert: true, detail: '점액이 동반되어 있습니다' },
      { question: '발열(38도 이상)이 있나요?', isAlert: false },
      { question: '아기가 처지거나 기운이 없나요?', isAlert: false },
      { question: '복통이나 심한 보챔이 있나요?', isAlert: false },
    ],
    weeklyTrend: generateWeeklyTrend(3, 'caution'),
    weeklyAverage: 3.0,
    todayCount: 3,
    nextActions: [
      '다음 변도 관찰하고 사진을 찍어두세요',
      '아기의 컨디션을 주의 깊게 관찰하세요',
      '수유/이유식 후 반응을 체크하세요',
    ],
    hospitalAdvice: '혈변이 2회 이상 반복되거나, 양이 많아지면 사진을 가지고 소아과를 방문하세요',
    aiInsight: '혈흔이 소량 관찰되었어요. 항문 주변 상처나 알레르기 반응일 수 있어요. 다음 변을 관찰하시고, 반복되면 소아과 방문을 권해드려요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 78
  }
];

// 기저귀가 아닌 경우 결과
const invalidResult: PoopAnalysisResult = {
  status: 'invalid',
  statusLabel: '인식불가',
  summaryLine: '기저귀 사진이 필요해요',
  firmness: '정상',
  firmnessScore: 3,
  amount: '보통',
  amountScore: 2,
  color: '-',
  colorHex: '#CCCCCC',
  colorCategory: '-',
  specialFindings: [],
  warningChecks: [],
  weeklyTrend: [],
  weeklyAverage: 0,
  todayCount: 0,
  nextActions: ['기저귀 사진을 다시 촬영해 주세요'],
  hospitalAdvice: null,
  aiInsight: '기저귀 사진을 업로드해 주세요. 배변이 보이는 기저귀를 선명하게 촬영해 주시면 정확한 분석이 가능합니다.',
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
  const result = mockResults[randomIndex];
  
  // 주간 트렌드 새로 생성 (매번 다르게)
  return { 
    ...result, 
    analysisTime: getCurrentTime(),
    weeklyTrend: generateWeeklyTrend(result.todayCount, result.status === 'normal' ? 'normal' : 'caution')
  };
}
