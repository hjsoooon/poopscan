import { PoopAnalysisResult } from "../types";

// 랜덤 결과 데이터
const mockResults: PoopAnalysisResult[] = [
  {
    status: 'normal',
    statusLabel: '정상',
    description: '건강한 상태의 대변입니다. 걱정하지 않으셔도 됩니다.',
    color: '황금색',
    colorHex: '#DAA520',
    consistency: '보통',
    frequencyToday: 3,
    insight: '모유 수유 아기에게 흔히 보이는 건강한 대변입니다. 현재 식이 패턴을 유지해 주세요.',
    recommendations: ['현재 수유 패턴 유지', '충분한 수분 섭취']
  },
  {
    status: 'normal',
    statusLabel: '정상',
    description: '정상적인 대변 색상과 농도입니다.',
    color: '겨자색',
    colorHex: '#E1AD01',
    consistency: '부드러움',
    frequencyToday: 4,
    insight: '아기의 소화 상태가 양호합니다. 규칙적인 배변 활동이 이루어지고 있어요.',
    recommendations: ['규칙적인 수유 시간 유지', '아기 컨디션 관찰']
  },
  {
    status: 'normal',
    statusLabel: '정상',
    description: '녹색빛이 약간 있지만 정상 범위입니다.',
    color: '녹황색',
    colorHex: '#9ACD32',
    consistency: '보통',
    frequencyToday: 2,
    insight: '녹색빛은 담즙 때문이며 정상입니다. 분유 수유 아기에게 자주 나타납니다.',
    recommendations: ['현재 분유 유지', '배변 횟수 기록']
  },
  {
    status: 'caution',
    statusLabel: '관찰 필요',
    description: '약간 묽은 편이니 수분 섭취에 주의해 주세요.',
    color: '노란색',
    colorHex: '#EAB308',
    consistency: '묽음',
    frequencyToday: 5,
    insight: '배변 횟수가 평소보다 많습니다. 탈수 증상이 없는지 확인해 주세요.',
    recommendations: ['수분 보충', '체온 체크', '기저귀 발진 예방']
  },
  {
    status: 'caution',
    statusLabel: '관찰 필요',
    description: '단단한 편이니 수분 섭취를 늘려주세요.',
    color: '갈색',
    colorHex: '#8B4513',
    consistency: '딱딱함',
    frequencyToday: 1,
    insight: '변비 가능성이 있습니다. 수분과 섬유질 섭취를 확인해 주세요.',
    recommendations: ['물 섭취량 늘리기', '배 마사지', '이유식 중이라면 섬유질 추가']
  },
  {
    status: 'normal',
    statusLabel: '정상',
    description: '갈색 대변은 이유식을 시작한 아기에게 정상입니다.',
    color: '연갈색',
    colorHex: '#D2691E',
    consistency: '보통',
    frequencyToday: 2,
    insight: '이유식 시작 후 대변 색이 변하는 것은 자연스러운 현상입니다.',
    recommendations: ['다양한 이유식 시도', '알레르기 반응 관찰']
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
  insight: '기저귀 사진을 업로드해 주세요. 배변이 보이는 기저귀를 선명하게 촬영해 주시면 더 정확한 분석이 가능합니다.',
  recommendations: ['기저귀 사진 다시 촬영', '밝은 곳에서 촬영', '배변 부분이 잘 보이게 촬영']
};

export async function analyzePoopImage(base64Image: string): Promise<PoopAnalysisResult> {
  // 분석하는 것처럼 1~2초 딜레이
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // 15% 확률로 "기저귀가 아님" 결과 반환 (데모용)
  if (Math.random() < 0.15) {
    return invalidResult;
  }
  
  // 랜덤 결과 반환
  const randomIndex = Math.floor(Math.random() * mockResults.length);
  return mockResults[randomIndex];
}
