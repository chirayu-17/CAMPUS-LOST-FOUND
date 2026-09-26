export interface AIPairAnalysis {
  lostId: string;
  foundId: string;
  match_confidence: number; // Integer score from 0 to 100
  verdict: 'HIGH_CONFIDENCE_MATCH' | 'PROBABLE_MATCH' | 'INCONCLUSIVE' | 'NO_MATCH';
  rationale: string;
  matched_identifiers: string[];
  discrepancies: string[];
  recommended_interrogation_challenge: string;
  analysis_timestamp: string;
  engine: string;
}

export interface CompareItemsPayload {
  lostItem: {
    id: string;
    category?: string;
    description: string;
    location?: string;
    date?: string;
    hidden_identifier: string;
  };
  foundItem: {
    id: string;
    category?: string;
    description: string;
    location?: string;
    date?: string;
    hidden_identifier: string;
  };
}

export interface BatchAnalysisResponse {
  success: boolean;
  timestamp: string;
  totalLostCount: number;
  totalFoundCount: number;
  pairsAnalyzedCount: number;
  highConfidenceCount: number;
  matches: AIPairAnalysis[];
  engine: string;
}
