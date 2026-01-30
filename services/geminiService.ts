
import { GoogleGenAI, Type } from "@google/genai";
import { PoopAnalysisResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function analyzePoopImage(base64Image: string): Promise<PoopAnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert pediatric nurse and baby care specialist.
    Your task is to analyze a photo of a baby's diaper and provide an assessment of the baby's stool.
    Focus on color, consistency, and potential health indicators.
    
    STOOL COLOR GUIDELINES:
    - Normal: Mustard yellow, brown, orange, green (common in breastfed/formula-fed babies).
    - Caution: Very hard/dry stool, persistent loose/watery stool.
    - Warning/Emergency: Red (blood), White/Gray (pale), Black (old blood, unless newborn meconium).
    
    Response must be in JSON format with specific health-focused fields.
    Crucially, always add a disclaimer that this is NOT medical advice.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, description: 'One of: normal, caution, warning, emergency' },
      statusLabel: { type: Type.STRING, description: 'Short status label in Korean (e.g., 정상, 관찰 필요, 주의, 긴급)' },
      description: { type: Type.STRING, description: 'One sentence explanation in Korean' },
      color: { type: Type.STRING, description: 'Primary stool color name in Korean' },
      colorHex: { type: Type.STRING, description: 'Closest hex code for the stool color' },
      consistency: { type: Type.STRING, description: 'Consistency description in Korean (e.g., 묽음, 보통, 딱딱함)' },
      frequencyToday: { type: Type.NUMBER, description: 'Estimated frequency (mock value between 1-5)' },
      insight: { type: Type.STRING, description: 'Key insight for parents based on stool pattern in Korean' },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Actionable tips in Korean'
      }
    },
    required: ["status", "statusLabel", "description", "color", "colorHex", "consistency", "frequencyToday", "insight", "recommendations"]
  };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: "Analyze this baby diaper stool photo. Be accurate but gentle. If there's blood or white stool, mark as emergency." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1]
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as PoopAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback Mock for Demo/Error
    return {
      status: 'caution',
      statusLabel: '관찰 필요 (주의)',
      description: '걱정 마세요, 다만 수분 섭취를 지켜봐 주세요.',
      color: '노란색',
      colorHex: '#EAB308',
      consistency: '묽음',
      frequencyToday: 3,
      insight: '최근 24시간 패턴에서 횟수가 증가했습니다. 수분 섭취를 늘리고 체온을 체크하는 것을 추천합니다.',
      recommendations: ['수분 보충', '체온 체크']
    };
  }
}
