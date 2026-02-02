export type AnalysisStatus = 'normal' | 'caution' | 'warning' | 'emergency' | 'invalid';

export interface PoopAnalysisResult {
  status: AnalysisStatus;
  statusLabel: string;
  description: string;
  color: string;
  colorHex: string;
  consistency: string;
  frequencyToday: number;
  insight: string;
  recommendations: string[];
}

export interface AppState {
  view: 'camera' | 'analyzing' | 'result';
  capturedImage: string | null;
  analysis: PoopAnalysisResult | null;
}
