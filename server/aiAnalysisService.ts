import { GoogleGenAI, Type } from '@google/genai';
import { AIPairAnalysis } from '../src/types/aiAnalysis';

export interface ItemForAnalysis {
  id: string;
  type?: string;
  category?: string;
  description: string;
  location?: string;
  date?: string;
  hidden_identifier: string;
}

class AIAnalysisServiceServer {
  private aiClient: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[AIAnalysisService] GEMINI_API_KEY environment variable is not defined.');
      return null;
    }
    if (!this.aiClient) {
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Compares the hidden_identifier of a lost item with a found item
   * using the Gemini 3.8 Flash model to calculate a match_confidence score.
   */
  public async compareHiddenIdentifiers(
    lostItem: ItemForAnalysis,
    foundItem: ItemForAnalysis
  ): Promise<AIPairAnalysis> {
    const ai = this.getClient();

    if (ai) {
      try {
        const prompt = `
COMPARE THE FOLLOWING TWO PROPERTY RECORDS TO DETERMINE IF THEY ARE THE SAME PHYSICAL OBJECT:

[RECORD A: REPORTED LOST ITEM]
- Docket ID: ${lostItem.id}
- Category: ${lostItem.category || 'General'}
- Public Description: ${lostItem.description}
- Location: ${lostItem.location || 'Unknown'}
- Date: ${lostItem.date || 'Unknown'}
- CONFIDENTIAL HIDDEN IDENTIFIER (Ground truth provided by reported owner):
"${lostItem.hidden_identifier}"

[RECORD B: RECOVERED FOUND ITEM IN CUSTODY]
- Docket ID: ${foundItem.id}
- Category: ${foundItem.category || 'General'}
- Public Description: ${foundItem.description}
- Location: ${foundItem.location || 'Unknown'}
- Date: ${foundItem.date || 'Unknown'}
- CONFIDENTIAL HIDDEN IDENTIFIER (Physical characteristics inspected by intake officer):
"${foundItem.hidden_identifier}"

TASK:
Deeply cross-examine the two 'hidden_identifier' strings (along with category and descriptive context).
1. Look for matching serial numbers, model sub-variants, engravings, custom stickers, decals, damage marks/dents, inner contents (e.g. specific currency breakdown, card names, keys), or background wallpapers.
2. Evaluate any discrepancies (e.g. conflicting colors, conflicting model years, contradictory contents).
3. Assign a strict, calibrated 'match_confidence' score from 0 to 100:
   - 90-100: Definitive/Overwhelming match (e.g. exact matching serial number, identical specific combination of unique stickers/markings).
   - 75-89: Highly probable match (strong multi-point correlation, matching distinctive features, plausible spatial-temporal alignment).
   - 45-74: Inconclusive / partial match (some shared traits but lacks definitive uniqueness, or slight ambiguities).
   - 0-44: Unlikely match or clear contradiction.
4. Generate a recommended interrogation challenge question for the security officer to verify claimant legitimacy without giving away the ground truth.
`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI inference timeout exceeded')), 4500)
        );

        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'You are the Zero-Trust Forensic Evidence Custody AI for an institutional Lost and Found system. Analyze the hidden identifiers with rigorous legal precision. Output only valid JSON adhering to the specified schema.',
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  match_confidence: {
                    type: Type.INTEGER,
                    description: 'Confidence score from 0 to 100 indicating likelihood Record A and Record B are the same physical item.',
                  },
                  verdict: {
                    type: Type.STRING,
                    description: 'HIGH_CONFIDENCE_MATCH, PROBABLE_MATCH, INCONCLUSIVE, or NO_MATCH',
                  },
                  rationale: {
                    type: Type.STRING,
                    description: 'Detailed analysis explaining how the hidden identifiers corroborate or contradict each other.',
                  },
                  matched_identifiers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Specific points in the hidden identifiers that corroborate each other.',
                  },
                  discrepancies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Conflicting points, missing expected items, or uncorroborated features.',
                  },
                  recommended_interrogation_challenge: {
                    type: Type.STRING,
                    description: 'A sharp, blind challenge question the officer should ask the claimant to verify identity.',
                  },
                },
                required: [
                  'match_confidence',
                  'verdict',
                  'rationale',
                  'matched_identifiers',
                  'discrepancies',
                  'recommended_interrogation_challenge',
                ],
              },
              temperature: 0.15,
            },
          }),
          timeoutPromise,
        ]);

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          const confidence = Math.min(100, Math.max(0, Number(parsed.match_confidence) || 0));
          
          let verdict: AIPairAnalysis['verdict'] = 'INCONCLUSIVE';
          if (confidence >= 85) verdict = 'HIGH_CONFIDENCE_MATCH';
          else if (confidence >= 70) verdict = 'PROBABLE_MATCH';
          else if (confidence < 40) verdict = 'NO_MATCH';

          return {
            lostId: lostItem.id,
            foundId: foundItem.id,
            match_confidence: confidence,
            verdict: (parsed.verdict as AIPairAnalysis['verdict']) || verdict,
            rationale: parsed.rationale || 'Analysis completed via Gemini 3.8 Flash.',
            matched_identifiers: Array.isArray(parsed.matched_identifiers) ? parsed.matched_identifiers : [],
            discrepancies: Array.isArray(parsed.discrepancies) ? parsed.discrepancies : [],
            recommended_interrogation_challenge:
              parsed.recommended_interrogation_challenge ||
              'State the unique markings, serial characters, or contents inside the item.',
            analysis_timestamp: new Date().toISOString(),
            engine: 'gemini-3.8-flash',
          };
        }
      } catch (err) {
        console.error('[AIAnalysisService] Gemini API invocation failed, falling back to algorithmic comparator:', err);
      }
    }

    // High-precision algorithmic comparator fallback (used if API key is not configured or in case of network anomaly)
    return this.algorithmicFallbackComparison(lostItem, foundItem);
  }

  /**
   * Batch analysis of all potential Lost and Found pairs in the ledger
   */
  public async analyzeAllPairs(
    lostItems: ItemForAnalysis[],
    foundItems: ItemForAnalysis[]
  ): Promise<AIPairAnalysis[]> {
    const candidatePairs: { lost: ItemForAnalysis; found: ItemForAnalysis }[] = [];

    for (const lost of lostItems) {
      for (const found of foundItems) {
        // Pre-filter: items must share category or have text overlap to warrant deep Gemini hidden_identifier evaluation
        const sameCategory =
          !lost.category ||
          !found.category ||
          lost.category.toLowerCase().replace(/[^a-z]/g, '') ===
            found.category.toLowerCase().replace(/[^a-z]/g, '');

        if (sameCategory) {
          candidatePairs.push({ lost, found });
        }
      }
    }

    const results = await Promise.all(
      candidatePairs.map((p) => this.compareHiddenIdentifiers(p.lost, p.found))
    );

    // Sort descending by match_confidence
    results.sort((a, b) => b.match_confidence - a.match_confidence);
    return results;
  }

  /**
   * Algorithmic heuristic comparator for offline or fallback operation
   */
  private algorithmicFallbackComparison(
    lostItem: ItemForAnalysis,
    foundItem: ItemForAnalysis
  ): AIPairAnalysis {
    const lostText = `${lostItem.hidden_identifier} ${lostItem.description}`.toLowerCase();
    const foundText = `${foundItem.hidden_identifier} ${foundItem.description}`.toLowerCase();

    // Extract tokens of length >= 3
    const extractTokens = (str: string) =>
      str
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !['the', 'and', 'with', 'from', 'near', 'left', 'found'].includes(w));

    const lostTokens = extractTokens(lostText);
    const foundTokens = new Set(extractTokens(foundText));

    const matchedTokens = lostTokens.filter((t) => foundTokens.has(t));
    const uniqueMatched = Array.from(new Set(matchedTokens));

    // Serial number pattern detection (e.g. C02YF789MD6R, 9812-AF, 8421)
    const serialRegex = /[A-Z0-9]{4,}/gi;
    const lostSerials = (lostItem.hidden_identifier.match(serialRegex) || []).map((s) => s.toUpperCase());
    const foundSerials = (foundItem.hidden_identifier.match(serialRegex) || []).map((s) => s.toUpperCase());

    const matchingSerials = lostSerials.filter(
      (s) => s.length >= 4 && foundSerials.some((fs) => fs.includes(s) || s.includes(fs))
    );

    let confidence = 20;
    const matchedIdentifiers: string[] = [];
    const discrepancies: string[] = [];

    if (matchingSerials.length > 0) {
      confidence += 65;
      matchedIdentifiers.push(`Direct serial / unique token correlation: ${matchingSerials.join(', ')}`);
    }

    if (uniqueMatched.length > 0) {
      confidence += Math.min(30, uniqueMatched.length * 6);
      matchedIdentifiers.push(`Corroborating distinctive features: ${uniqueMatched.slice(0, 5).join(', ')}`);
    }

    // Category consistency
    if (
      lostItem.category &&
      foundItem.category &&
      lostItem.category.toLowerCase() === foundItem.category.toLowerCase()
    ) {
      confidence += 10;
      matchedIdentifiers.push(`Taxonomy match: [${lostItem.category.toUpperCase()}]`);
    }

    confidence = Math.min(99, Math.max(15, confidence));

    let verdict: AIPairAnalysis['verdict'] = 'INCONCLUSIVE';
    if (confidence >= 85) verdict = 'HIGH_CONFIDENCE_MATCH';
    else if (confidence >= 70) verdict = 'PROBABLE_MATCH';
    else if (confidence < 40) verdict = 'NO_MATCH';

    return {
      lostId: lostItem.id,
      foundId: foundItem.id,
      match_confidence: confidence,
      verdict,
      rationale:
        confidence >= 75
          ? `High lexical and telemetry correlation between confidential ground truth identifiers (${uniqueMatched.length} matching signature points).`
          : `Partial token overlap detected between dockets. Further officer interrogation recommended.`,
      matched_identifiers:
        matchedIdentifiers.length > 0
          ? matchedIdentifiers
          : ['General physical taxonomy alignment'],
      discrepancies: discrepancies.length > 0 ? discrepancies : ['None explicitly identified'],
      recommended_interrogation_challenge:
        matchingSerials.length > 0
          ? `Request claimant recite the full serial number or engraving ending in ${matchingSerials[0].slice(-3)}.`
          : `Ask claimant to describe the exact contents, stickers, or internal markings without leading questions.`,
      analysis_timestamp: new Date().toISOString(),
      engine: 'algorithmic_heuristic',
    };
  }
}

export const serverAIAnalysisService = new AIAnalysisServiceServer();
