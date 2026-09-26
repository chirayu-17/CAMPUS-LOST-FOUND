import { AIPairAnalysis, BatchAnalysisResponse, CompareItemsPayload } from '../types/aiAnalysis';

class ClientAIAnalysisService {
  /**
   * Compares the hidden_identifier of a lost item and a found item
   * using the Gemini API through the secure server backend.
   */
  public async comparePair(
    lostItem: CompareItemsPayload['lostItem'],
    foundItem: CompareItemsPayload['foundItem']
  ): Promise<AIPairAnalysis> {
    const response = await fetch('/api/ai/compare-pair', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lostItem, foundItem }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Analysis failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.analysis as AIPairAnalysis;
  }

  /**
   * Runs an algorithmic and Gemini analysis across all active lost & found records
   * in the ledger to assign match_confidence scores.
   */
  public async runBatchAnalysis(token?: string): Promise<BatchAnalysisResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/ai/batch-analysis', {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Batch AI Analysis failed: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as BatchAnalysisResponse;
  }
}

export const AIAnalysisService = new ClientAIAnalysisService();
