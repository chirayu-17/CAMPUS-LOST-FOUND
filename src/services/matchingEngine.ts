import { Item, MatchBreakdown, MatchPair } from '../types';

// Common stop words to exclude during text tokenization
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'by', 'with', 'for', 'to', 'from', 'of',
  'and', 'or', 'is', 'was', 'left', 'found', 'lost', 'near', 'under', 'desk',
  'table', 'during', 'while', 'my', 'has', 'have', 'had', 'been', 'some', 'very'
]);

// Color family groupings for fuzzy visual similarity
const COLOR_FAMILIES: Record<string, string[]> = {
  black: ['black', 'dark', 'charcoal', 'matte black', 'ebony'],
  gray: ['gray', 'grey', 'silver', 'slate', 'space gray', 'space grey', 'aluminum'],
  blue: ['blue', 'navy', 'royal blue', 'sky blue', 'indigo', 'cyan'],
  brown: ['brown', 'tan', 'beige', 'khaki', 'leather', 'cognac'],
  green: ['green', 'olive', 'lime', 'neon green', 'emerald'],
  red: ['red', 'crimson', 'maroon', 'burgundy', 'scarlet'],
  white: ['white', 'off-white', 'cream', 'ivory']
};

/**
 * Tokenize string into normalized meaningful words
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Calculates Jaccard similarity coefficient between two token lists: |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): { score: number; common: string[] } {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  if (setA.size === 0 && setB.size === 0) return { score: 0, common: [] };

  const intersection: string[] = [];
  setA.forEach(token => {
    if (setB.has(token)) {
      intersection.push(token);
    } else {
      // Check partial substring match (e.g., 'macbook' and 'macbooks', or 'hydro' and 'hydroflask')
      for (const other of setB) {
        if (token.length >= 4 && other.length >= 4) {
          if (token.includes(other) || other.includes(token)) {
            intersection.push(token);
            break;
          }
        }
      }
    }
  });

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  const score = unionSize === 0 ? 0 : Math.min(100, Math.round((intersection.length / unionSize) * 100));
  return { score, common: Array.from(new Set(intersection)) };
}

/**
 * Evaluate color compatibility
 */
function evaluateColorAffinity(c1: string, c2: string): number {
  if (!c1 || !c2) return 50;
  const norm1 = c1.trim().toLowerCase();
  const norm2 = c2.trim().toLowerCase();

  if (norm1 === norm2) return 100;

  for (const family of Object.values(COLOR_FAMILIES)) {
    const has1 = family.some(f => norm1.includes(f));
    const has2 = family.some(f => norm2.includes(f));
    if (has1 && has2) return 80;
  }

  return 20;
}

/**
 * Main algorithmic matching calculator between a lost item and a found item
 */
export function computeMatchScore(lost: Item, found: Item): MatchBreakdown {
  // 1. Category & Subcategory Score (Weight 25%)
  let categoryScore = 0;
  if (lost.category === found.category) {
    categoryScore = 80;
    if (lost.subcategory && found.subcategory) {
      const subLost = lost.subcategory.toLowerCase().trim();
      const subFound = found.subcategory.toLowerCase().trim();
      if (subLost === subFound || subLost.includes(subFound) || subFound.includes(subLost)) {
        categoryScore = 100;
      }
    }
  } else {
    // Cross-category penalty (e.g. electronics vs clothing is almost 0, but wallet vs personal_items could overlap)
    const softOverlap = (lost.category === 'wallets_bags' && found.category === 'personal_items') ||
                        (lost.category === 'personal_items' && found.category === 'wallets_bags') ||
                        (lost.category === 'ids_cards' && found.category === 'wallets_bags');
    categoryScore = softOverlap ? 35 : 5;
  }

  // 2. Text Similarity & Keyword Analysis (Weight 30%)
  const lostTokens = tokenizeText([
    lost.title,
    lost.brand || '',
    lost.description,
    lost.distinctiveFeatures || ''
  ].join(' '));

  const foundTokens = tokenizeText([
    found.title,
    found.brand || '',
    found.description,
    found.distinctiveFeatures || ''
  ].join(' '));

  const { score: jaccardScore, common: matchedKeywords } = calculateJaccardSimilarity(lostTokens, foundTokens);
  
  // Distinctive feature keyword bonus
  let distinctiveBonus = 0;
  if (lost.distinctiveFeatures && found.distinctiveFeatures) {
    const featLost = tokenizeText(lost.distinctiveFeatures);
    const featFound = tokenizeText(found.distinctiveFeatures);
    const featOverlap = featLost.filter(t => featFound.includes(t));
    if (featOverlap.length > 0) {
      distinctiveBonus = Math.min(25, featOverlap.length * 10);
    }
  }
  const textSimilarityScore = Math.min(100, Math.round(jaccardScore * 1.2 + distinctiveBonus));

  // 3. Physical Attributes Score (Weight 20%)
  const primaryColorScore = evaluateColorAffinity(lost.primaryColor, found.primaryColor);
  
  let brandScore = 50;
  if (lost.brand && found.brand) {
    const bLost = lost.brand.toLowerCase().trim();
    const bFound = found.brand.toLowerCase().trim();
    if (bLost === bFound) {
      brandScore = 100;
    } else if (bLost.includes(bFound) || bFound.includes(bLost)) {
      brandScore = 85;
    } else {
      brandScore = 10; // Conflicting declared brands
    }
  } else if (!lost.brand && !found.brand) {
    brandScore = 60;
  } else {
    // One has a brand, one is unknown
    brandScore = 50;
  }

  const attributeScore = Math.round(primaryColorScore * 0.5 + brandScore * 0.5);

  // 4. Spatial Proximity Score (Weight 15%)
  let spatialScore = 0;
  let spatialDistanceEstimateMeters = 0;

  if (lost.location.zoneId === found.location.zoneId) {
    if (lost.location.floor === found.location.floor) {
      spatialScore = 100;
      spatialDistanceEstimateMeters = 20;
    } else {
      spatialScore = 85;
      spatialDistanceEstimateMeters = 75;
    }
  } else {
    // Calculate Euclidean distance on the 100x100 spatial grid
    const dx = lost.location.coordinates.x - found.location.coordinates.x;
    const dy = lost.location.coordinates.y - found.location.coordinates.y;
    const gridDistance = Math.sqrt(dx * dx + dy * dy);
    // Estimated scale: 1 grid unit ≈ 10 meters on campus
    spatialDistanceEstimateMeters = Math.round(gridDistance * 10);

    if (gridDistance <= 15) {
      spatialScore = 75;
    } else if (gridDistance <= 30) {
      spatialScore = 55;
    } else if (gridDistance <= 50) {
      spatialScore = 35;
    } else {
      spatialScore = 15;
    }
  }

  // 5. Temporal Proximity Score (Weight 10%)
  const timeLost = new Date(lost.dateOccurred).getTime();
  const timeFound = new Date(found.dateOccurred).getTime();
  const timeDiffMs = timeFound - timeLost;
  const daysDifference = Math.round(Math.abs(timeDiffMs) / (1000 * 60 * 60 * 24) * 10) / 10;

  let temporalScore = 0;
  if (timeDiffMs >= 0) {
    // Found after lost (normal sequence)
    if (daysDifference <= 1) {
      temporalScore = 100;
    } else if (daysDifference <= 3) {
      temporalScore = 85;
    } else if (daysDifference <= 7) {
      temporalScore = 70;
    } else if (daysDifference <= 14) {
      temporalScore = 50;
    } else {
      temporalScore = 30;
    }
  } else {
    // Found before reported lost (reporter lost track of time or found earlier than realized)
    if (daysDifference <= 1) {
      temporalScore = 65;
    } else if (daysDifference <= 3) {
      temporalScore = 40;
    } else {
      temporalScore = 15;
    }
  }

  // Compute Weighted Composite
  const rawComposite = (
    categoryScore * 0.25 +
    textSimilarityScore * 0.30 +
    attributeScore * 0.20 +
    spatialScore * 0.15 +
    temporalScore * 0.10
  );

  const overallScore = Math.min(100, Math.max(0, Math.round(rawComposite)));

  // Confidence category
  let confidenceLevel: 'high' | 'moderate' | 'low' = 'low';
  if (overallScore >= 75) {
    confidenceLevel = 'high';
  } else if (overallScore >= 50) {
    confidenceLevel = 'moderate';
  }

  // Natural Language Explanatory synthesis for users / evaluators
  const reasons: string[] = [];
  if (categoryScore >= 80) reasons.push(`identical ${lost.category.replace('_', ' ')} category`);
  if (brandScore >= 85 && lost.brand) reasons.push(`matching brand (${lost.brand})`);
  if (primaryColorScore >= 80) reasons.push(`color consistency (${lost.primaryColor})`);
  if (spatialScore >= 80) reasons.push(`localized to same building area`);
  if (daysDifference <= 2) reasons.push(`temporal window within ${daysDifference} day(s)`);
  if (matchedKeywords.length > 0) reasons.push(`shared tokens [${matchedKeywords.slice(0, 3).join(', ')}]`);

  const explanation = reasons.length > 0
    ? `Pair affinity driven by ${reasons.join(', ')}.`
    : `Low alignment across categories and spatial boundaries.`;

  return {
    categoryScore,
    textSimilarityScore,
    attributeScore,
    spatialScore,
    temporalScore,
    overallScore,
    matchedKeywords,
    spatialDistanceEstimateMeters,
    daysDifference,
    confidenceLevel,
    explanation
  };
}

/**
 * Finds all potential match pairings between a list of items
 */
export function computeAllMatches(items: Item[], minThreshold = 45): MatchPair[] {
  const lostItems = items.filter(i => i.type === 'lost' && i.status !== 'returned' && i.status !== 'archived');
  const foundItems = items.filter(i => i.type === 'found' && i.status !== 'returned' && i.status !== 'archived');

  const pairs: MatchPair[] = [];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const breakdown = computeMatchScore(lost, found);
      if (breakdown.overallScore >= minThreshold) {
        pairs.push({
          lostItem: lost,
          foundItem: found,
          breakdown
        });
      }
    }
  }

  // Sort descending by overall affinity score
  return pairs.sort((a, b) => b.breakdown.overallScore - a.breakdown.overallScore);
}

/**
 * Heuristic fallback for AI item parsing when API key is unavailable
 */
export function heuristicItemAnalysis(rawText: string) {
  const lower = rawText.toLowerCase();
  
  // Category inference
  let category = 'personal_items';
  let subcategory = 'General Item';
  if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('ipad') || lower.includes('phone') || lower.includes('airpod') || lower.includes('charger') || lower.includes('earbuds')) {
    category = 'electronics';
    if (lower.includes('laptop') || lower.includes('macbook')) subcategory = 'Laptop';
    else if (lower.includes('phone') || lower.includes('iphone') || lower.includes('samsung')) subcategory = 'Smartphone';
    else if (lower.includes('airpod') || lower.includes('earbuds') || lower.includes('headphone')) subcategory = 'Audio/Earbuds';
  } else if (lower.includes('wallet') || lower.includes('backpack') || lower.includes('purse') || lower.includes('tote') || lower.includes('bag')) {
    category = 'wallets_bags';
    subcategory = lower.includes('backpack') ? 'Backpack' : 'Wallet';
  } else if (lower.includes('card') || lower.includes('id') || lower.includes('license') || lower.includes('passport')) {
    category = 'ids_cards';
    subcategory = 'ID Card';
  } else if (lower.includes('key') || lower.includes('fob')) {
    category = 'keys';
    subcategory = 'Key Set';
  } else if (lower.includes('jacket') || lower.includes('hoodie') || lower.includes('coat') || lower.includes('hat') || lower.includes('scarf')) {
    category = 'clothing';
    subcategory = 'Apparel';
  } else if (lower.includes('bottle') || lower.includes('flask') || lower.includes('mug') || lower.includes('umbrella')) {
    category = 'personal_items';
    subcategory = lower.includes('bottle') || lower.includes('flask') ? 'Water Bottle' : 'Accessory';
  }

  // Brand inference
  const brands = ['Apple', 'Samsung', 'Sony', 'Hydro Flask', 'Fossil', 'Nike', 'North Face', 'Subaru', 'Toyota', 'Casio', 'Dell', 'Lenovo'];
  const brand = brands.find(b => lower.includes(b.toLowerCase())) || 'Unspecified';

  // Color inference
  const colors = ['Black', 'Gray', 'Silver', 'Blue', 'Navy', 'Brown', 'Green', 'Red', 'White', 'Gold', 'Yellow'];
  const primaryColor = colors.find(c => lower.includes(c.toLowerCase())) || 'Unknown';

  // Suggested verification questions
  const verificationQuestions = [
    `What specific scratches, stickers, or distinctive marks does it have?`,
    `Can you specify what is inside or attached to the item?`,
    `What exact brand, serial, or identifier code is associated with it?`
  ];

  return {
    suggestedCategory: category,
    suggestedSubcategory: subcategory,
    suggestedBrand: brand,
    suggestedColor: primaryColor,
    verificationQuestions,
    confidence: 85
  };
}
