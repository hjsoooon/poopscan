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
  // ===== 정상 케이스들 =====
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
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '점액(끈적한 것)이 없어요', isAlert: false, type: 'ai' },
      { question: '아기가 배변 시 울거나 힘들어하나요?', isAlert: false, type: 'parent' },
      { question: '아기가 처지거나 기운이 없나요?', isAlert: false, type: 'parent' },
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
    summaryLine: '신생아 태변이에요. 정상적인 첫 변입니다 🌟',
    firmness: '정상',
    firmnessScore: 3,
    amount: '보통',
    amountScore: 2,
    color: '검녹색',
    colorHex: '#1A3A2F',
    colorCategory: '태변',
    specialFindings: ['신생아 첫 변 (태변)'],
    warningChecks: [
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '태변 특유의 검녹색 확인', isAlert: false, type: 'ai' },
      { question: '출생 후 24시간 내 첫 변을 봤나요?', isAlert: false, type: 'parent' },
      { question: '수유 후 잘 먹나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(2, 'normal'),
    weeklyAverage: 2.0,
    todayCount: 2,
    nextActions: [
      '태변은 2-3일 내 황금색으로 변해요',
      '수유를 규칙적으로 해주세요',
      '기저귀를 자주 확인해 주세요',
    ],
    hospitalAdvice: null,
    aiInsight: '신생아의 첫 변인 태변이에요. 검녹색의 끈적한 변은 완전히 정상이며, 며칠 내에 노란색 변으로 바뀔 거예요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 96
  },
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '철분제 복용 중이시군요! 정상적인 색 변화예요 💊',
    firmness: '정상',
    firmnessScore: 3,
    amount: '보통',
    amountScore: 2,
    color: '검은빛 갈색',
    colorHex: '#2C1810',
    colorCategory: '흑색변',
    specialFindings: ['철분 보충제로 인한 색 변화'],
    warningChecks: [
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '철분제 복용으로 인한 정상 변색', isAlert: false, type: 'ai' },
      { question: '철분제나 철분 강화 분유를 먹이고 있나요?', isAlert: false, type: 'parent' },
      { question: '배변 시 불편해하나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(2, 'normal'),
    weeklyAverage: 2.0,
    todayCount: 2,
    nextActions: [
      '철분제 복용 중에는 검은 변이 정상이에요',
      '변비가 생기면 수분 섭취를 늘려주세요',
    ],
    hospitalAdvice: null,
    aiInsight: '검은빛 변은 철분 보충제나 철분 강화 분유 때문이에요. 완전히 정상적인 반응이니 걱정하지 마세요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 91
  },
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '배변 횟수가 많지만 정상 범위예요! 🌈',
    firmness: '무름',
    firmnessScore: 4,
    amount: '많음',
    amountScore: 3,
    color: '밝은 노란색',
    colorHex: '#FFD700',
    colorCategory: '황금변',
    specialFindings: [],
    warningChecks: [
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '점액(끈적한 것)이 없어요', isAlert: false, type: 'ai' },
      { question: '아기가 잘 먹고 기운이 있나요?', isAlert: false, type: 'parent' },
      { question: '체중이 잘 늘고 있나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(7, 'normal'),
    weeklyAverage: 7.5,
    todayCount: 8,
    nextActions: [
      '모유 수유 아기는 하루 8-10회도 정상이에요',
      '기저귀 발진 예방에 신경 써주세요',
      '아기가 잘 먹고 잘 자면 걱정 없어요',
    ],
    hospitalAdvice: null,
    aiInsight: '모유 수유 아기는 하루에 여러 번 변을 볼 수 있어요. 변의 색과 질감이 좋고, 아기가 건강하게 잘 먹는다면 완전히 정상입니다.',
    analysisTime: getCurrentTime(),
    confidenceScore: 89
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
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '점액(끈적한 것)이 없어요', isAlert: false, type: 'ai' },
      { question: '하루 8회 이상 묽은 변을 보나요?', isAlert: false, type: 'parent' },
      { question: '아기가 처지거나 기운이 없나요?', isAlert: false, type: 'parent' },
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
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '점액(끈적한 것)이 없어요', isAlert: false, type: 'ai' },
      { question: '발열(38도 이상)이 있나요?', isAlert: false, type: 'parent' },
      { question: '구토를 동반하나요?', isAlert: false, type: 'parent' },
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
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '점액(끈적한 것)이 발견됨', isAlert: true, detail: '소량의 점액이 관찰됩니다', type: 'ai' },
      { question: '하루 8회 이상 묽은 변을 보나요?', isAlert: false, type: 'parent' },
      { question: '아기가 처지거나 기운이 없나요?', isAlert: false, type: 'parent' },
      { question: '탈수 증상(소변 감소, 입술 마름)이 있나요?', isAlert: false, type: 'parent' },
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
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '딱딱한 덩어리 형태가 보여요', isAlert: true, detail: '변비 가능성이 있어요', type: 'ai' },
      { question: '3일 이상 변을 보지 못했나요?', isAlert: false, type: 'parent' },
      { question: '배가 빵빵하게 부풀어 있나요?', isAlert: false, type: 'parent' },
      { question: '배변 시 울거나 힘들어하나요?', isAlert: false, type: 'parent' },
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
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '덜 소화된 음식물 일부 (정상)', isAlert: false, type: 'ai' },
      { question: '특정 음식 후 피부 발진이 있나요?', isAlert: false, type: 'parent' },
      { question: '구토나 심한 보챔이 있나요?', isAlert: false, type: 'parent' },
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
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '점액(끈적한 것)이 없어요', isAlert: false, type: 'ai' },
      { question: '분유 교체 후 변화가 있나요?', isAlert: false, type: 'parent' },
      { question: '구토나 심한 보챔이 있나요?', isAlert: false, type: 'parent' },
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
      { question: '소량의 혈흔이 발견됨', isAlert: true, detail: '혈액이 관찰되어 주의가 필요해요', type: 'ai' },
      { question: '점액(끈적한 것)이 발견됨', isAlert: true, detail: '점액이 동반되어 있습니다', type: 'ai' },
      { question: '발열(38도 이상)이 있나요?', isAlert: false, type: 'parent' },
      { question: '아기가 처지거나 기운이 없나요?', isAlert: false, type: 'parent' },
      { question: '복통이나 심한 보챔이 있나요?', isAlert: false, type: 'parent' },
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
  },

  // ===== 추가 관찰필요 케이스들 =====
  {
    status: 'caution',
    statusLabel: '관찰필요',
    summaryLine: '거품이 많이 보여요. 유당 소화를 확인해 보세요 🫧',
    firmness: '묽음',
    firmnessScore: 5,
    amount: '보통',
    amountScore: 2,
    color: '녹색빛 노란색',
    colorHex: '#ADFF2F',
    colorCategory: '거품변',
    specialFindings: ['거품 다량 관찰', '녹색빛'],
    warningChecks: [
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '거품이 많이 관찰됨', isAlert: true, detail: '유당 불내증 가능성 체크 필요', type: 'ai' },
      { question: '수유 후 배에 가스가 많이 차나요?', isAlert: false, type: 'parent' },
      { question: '배앓이 증상이 있나요?', isAlert: false, type: 'parent' },
      { question: '모유 전유만 먹고 있지는 않나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(4, 'caution'),
    weeklyAverage: 4.2,
    todayCount: 4,
    nextActions: [
      '한쪽 젖을 충분히 비운 후 바꿔주세요',
      '수유 후 트림을 충분히 시켜주세요',
      '배 마사지로 가스 배출을 도와주세요',
    ],
    hospitalAdvice: '거품 변이 2주 이상 지속되면 소아과 상담을 권해요',
    aiInsight: '거품이 많은 변은 유당을 충분히 소화하지 못할 때 나타날 수 있어요. 모유 수유 시 한쪽 젖을 충분히 먹인 후 바꿔주시면 도움이 됩니다.',
    analysisTime: getCurrentTime(),
    confidenceScore: 83
  },
  {
    status: 'caution',
    statusLabel: '관찰필요',
    summaryLine: '우유 단백 알레르기 가능성이 있어요 🥛',
    firmness: '묽음',
    firmnessScore: 5,
    amount: '많음',
    amountScore: 3,
    color: '녹색',
    colorHex: '#228B22',
    colorCategory: '녹변',
    specialFindings: ['점액 다량', '혈사 소량'],
    warningChecks: [
      { question: '점액이 많이 발견됨', isAlert: true, detail: '장 점막 자극 가능성', type: 'ai' },
      { question: '미세 혈사 관찰', isAlert: true, detail: '알레르기 반응 가능성', type: 'ai' },
      { question: '피부에 습진이나 발진이 있나요?', isAlert: false, type: 'parent' },
      { question: '분유나 유제품 섭취 후 증상이 심해지나요?', isAlert: false, type: 'parent' },
      { question: '구토나 역류가 자주 있나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(5, 'caution'),
    weeklyAverage: 5.3,
    todayCount: 5,
    nextActions: [
      '분유 종류를 기록해 두세요',
      '엄마가 유제품 섭취를 줄여보세요 (모유수유 시)',
      '변 사진을 찍어 기록해 두세요',
    ],
    hospitalAdvice: '소아과에서 우유 단백 알레르기 검사를 받아보세요',
    aiInsight: '점액과 소량의 혈사가 관찰되어 우유 단백 알레르기 가능성이 있어요. 소아과 상담을 통해 정확한 원인을 확인하시길 권해드려요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 76
  },
  {
    status: 'caution',
    statusLabel: '관찰필요',
    summaryLine: '장염 초기 증상일 수 있어요. 수분 공급이 중요해요 🚰',
    firmness: '묽음',
    firmnessScore: 5,
    amount: '많음',
    amountScore: 3,
    color: '황록색',
    colorHex: '#9ACD32',
    colorCategory: '물변',
    specialFindings: ['악취', '물 같은 변'],
    warningChecks: [
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '물처럼 묽은 변', isAlert: true, detail: '설사 증상이 관찰됩니다', type: 'ai' },
      { question: '발열(38도 이상)이 있나요?', isAlert: false, type: 'parent' },
      { question: '구토를 동반하나요?', isAlert: false, type: 'parent' },
      { question: '하루 10회 이상 설사를 하나요?', isAlert: false, type: 'parent' },
      { question: '보채거나 힘들어하나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(8, 'caution'),
    weeklyAverage: 7.8,
    todayCount: 9,
    nextActions: [
      '수분 섭취를 자주 해주세요',
      '전해질 용액(ORS)을 준비하세요',
      '손 씻기를 철저히 해주세요',
      '아기 상태를 자주 확인하세요',
    ],
    hospitalAdvice: '24시간 내 호전되지 않거나 탈수 증상 보이면 즉시 소아과 방문',
    aiInsight: '잦은 묽은 변은 장염 초기 증상일 수 있어요. 탈수 예방이 가장 중요하니 수분 섭취에 신경 쓰시고, 상태가 악화되면 바로 병원에 가세요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 80
  },
  {
    status: 'caution',
    statusLabel: '관찰필요',
    summaryLine: '오랜 변비예요. 적극적인 관리가 필요해요 💪',
    firmness: '딱딱함',
    firmnessScore: 1,
    amount: '소량',
    amountScore: 1,
    color: '아주 진한 갈색',
    colorHex: '#3D2314',
    colorCategory: '갈색변',
    specialFindings: ['토끼똥 형태', '매우 딱딱함', '항문 출혈 가능성'],
    warningChecks: [
      { question: '항문 주변 출혈 가능성', isAlert: true, detail: '딱딱한 변으로 인한 상처', type: 'ai' },
      { question: '토끼똥처럼 딱딱한 형태', isAlert: true, detail: '심한 변비 상태', type: 'ai' },
      { question: '5일 이상 변을 보지 못했나요?', isAlert: false, type: 'parent' },
      { question: '배변 시 많이 힘들어하고 우나요?', isAlert: false, type: 'parent' },
      { question: '배가 많이 빵빵한가요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(0, 'caution'),
    weeklyAverage: 0.5,
    todayCount: 1,
    nextActions: [
      '수분 섭취를 2배로 늘려주세요',
      '섬유질이 풍부한 이유식을 먹여주세요',
      '배 마사지를 하루 3번 해주세요',
      '다리 운동을 자주 시켜주세요',
    ],
    hospitalAdvice: '변비가 1주일 이상 지속되면 소아과에서 처방 받으세요',
    aiInsight: '변비가 심한 상태예요. 수분과 섬유질 섭취를 늘리고, 배 마사지와 다리 운동을 해주세요. 호전되지 않으면 소아과 상담을 권해드려요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 85
  },

  // ===== 추가 주의 케이스들 =====
  {
    status: 'warning',
    statusLabel: '주의',
    summaryLine: '백색/회색 변이에요. 빠른 확인이 필요해요 🏥',
    firmness: '정상',
    firmnessScore: 3,
    amount: '보통',
    amountScore: 2,
    color: '회백색',
    colorHex: '#D3D3D3',
    colorCategory: '백색변',
    specialFindings: ['담즙 색소 부족', '회백색 변'],
    warningChecks: [
      { question: '백색/회색 변 발견', isAlert: true, detail: '담도 문제 가능성 확인 필요', type: 'ai' },
      { question: '황달이 없어요', isAlert: false, type: 'ai' },
      { question: '피부나 눈이 노랗게 변했나요?', isAlert: false, type: 'parent' },
      { question: '소변 색이 진한 갈색인가요?', isAlert: false, type: 'parent' },
      { question: '잘 먹고 있나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(2, 'caution'),
    weeklyAverage: 2.0,
    todayCount: 2,
    nextActions: [
      '변 사진을 바로 찍어두세요',
      '소변 색도 확인해 주세요',
      '가능한 빨리 소아과에 방문하세요',
    ],
    hospitalAdvice: '백색/회색 변은 담도 질환 가능성이 있어 빠른 소아과 진료가 필요합니다',
    aiInsight: '백색이나 회색 변은 담즙이 제대로 분비되지 않을 때 나타날 수 있어요. 담도 질환 가능성이 있으니 가능한 빨리 소아과 진료를 받으세요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 72
  },
  {
    status: 'warning',
    statusLabel: '주의',
    summaryLine: '젤리 같은 점액변이에요. 확인이 필요해요 ⚠️',
    firmness: '무름',
    firmnessScore: 4,
    amount: '소량',
    amountScore: 1,
    color: '투명/흰색 점액',
    colorHex: '#F5F5DC',
    colorCategory: '점액변',
    specialFindings: ['젤리 같은 점액 다량', '변 없이 점액만'],
    warningChecks: [
      { question: '점액만 대량 배출됨', isAlert: true, detail: '장 점막 이상 가능성', type: 'ai' },
      { question: '변이 거의 없음', isAlert: true, detail: '장 기능 확인 필요', type: 'ai' },
      { question: '복통이나 심하게 보채나요?', isAlert: false, type: 'parent' },
      { question: '구토나 발열이 있나요?', isAlert: false, type: 'parent' },
      { question: '지난 며칠간 변을 잘 봤나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(1, 'caution'),
    weeklyAverage: 1.5,
    todayCount: 1,
    nextActions: [
      '다음 변을 주의 깊게 관찰하세요',
      '변 사진을 기록해 두세요',
      '아기의 컨디션을 수시로 확인하세요',
    ],
    hospitalAdvice: '점액만 나오는 것이 반복되면 소아과 진료를 받으세요',
    aiInsight: '젤리 같은 점액만 나오는 것은 장이 예민하거나 감염 초기일 수 있어요. 계속 관찰하시고 반복되면 소아과에 방문해 주세요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 74
  },

  // ===== 회복 중 케이스 =====
  {
    status: 'normal',
    statusLabel: '정상',
    summaryLine: '설사 후 회복 중이에요! 좋아지고 있어요 🌱',
    firmness: '무름',
    firmnessScore: 4,
    amount: '보통',
    amountScore: 2,
    color: '연한 노란색',
    colorHex: '#F0E68C',
    colorCategory: '황금변',
    specialFindings: ['회복 중 (변 굳기 개선됨)'],
    warningChecks: [
      { question: '피가 섞여 있지 않아요', isAlert: false, type: 'ai' },
      { question: '점액이 줄어들었어요', isAlert: false, type: 'ai' },
      { question: '하루 배변 횟수가 줄었나요?', isAlert: false, type: 'parent' },
      { question: '아기가 잘 먹기 시작했나요?', isAlert: false, type: 'parent' },
    ],
    weeklyTrend: generateWeeklyTrend(4, 'normal'),
    weeklyAverage: 4.5,
    todayCount: 4,
    nextActions: [
      '소화하기 쉬운 음식을 주세요',
      '유제품은 며칠 더 피해주세요',
      '수분 섭취를 계속 유지하세요',
    ],
    hospitalAdvice: null,
    aiInsight: '설사 후 장이 회복되고 있는 좋은 신호예요. 며칠 더 소화하기 쉬운 음식을 먹이시고, 완전히 정상 변으로 돌아올 때까지 관찰해 주세요.',
    analysisTime: getCurrentTime(),
    confidenceScore: 87
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
