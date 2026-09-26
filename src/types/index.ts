export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'electronics'
  | 'wallets_bags'
  | 'ids_cards'
  | 'keys'
  | 'clothing'
  | 'books_study'
  | 'personal_items';

export type ItemStatus =
  | 'reported'
  | 'potential_match'
  | 'claim_pending'
  | 'verified'
  | 'returned'
  | 'archived';

export interface LocationZone {
  id: string;
  name: string;
  code: string;
  category: 'library' | 'academic' | 'student_center' | 'athletics' | 'transit' | 'dining';
  floors: string[];
  coordinates: { x: number; y: number }; // 0-100% position on campus map
  hotspotRisk: 'high' | 'medium' | 'low';
}

export interface ItemLocation {
  zoneId: string;
  zoneName: string;
  floor: string;
  specificSpot: string;
  coordinates: { x: number; y: number };
}

export interface ReporterInfo {
  name: string;
  contact: string;
  role: 'student' | 'visitor' | 'staff' | 'security';
  anonymous?: boolean;
}

export interface CustodyLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  notes: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  subcategory: string;
  brand?: string;
  primaryColor: string;
  secondaryColor?: string;
  description: string;
  distinctiveFeatures?: string;
  location: ItemLocation;
  dateOccurred: string;
  dateReported: string;
  status: ItemStatus;
  reporter: ReporterInfo;
  verificationQuestions: string[];
  secretVerificationDetails?: string;
  storageLocation?: string;
  matchedItemId?: string;
  matchScore?: number;
  custodyLog: CustodyLogEntry[];
  claimId?: string;
  imagePlaceholderColor?: string;
}

export interface MatchBreakdown {
  categoryScore: number;       // Weight 25%
  textSimilarityScore: number; // Weight 30%
  attributeScore: number;      // Weight 20%
  spatialScore: number;        // Weight 15%
  temporalScore: number;       // Weight 10%
  overallScore: number;        // Composite 0 - 100
  matchedKeywords: string[];
  spatialDistanceEstimateMeters: number;
  daysDifference: number;
  confidenceLevel: 'high' | 'moderate' | 'low';
  explanation: string;
}

export interface MatchPair {
  lostItem: Item;
  foundItem: Item;
  breakdown: MatchBreakdown;
}

export interface ClaimVerificationAnswer {
  question: string;
  answer: string;
}

export interface Claim {
  id: string;
  lostItemId: string;
  foundItemId: string;
  claimantName: string;
  claimantContact: string;
  answers: ClaimVerificationAnswer[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  officerNotes?: string;
  timestamp: string;
  returnedAt?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'report_lost' | 'report_found' | 'match_detected' | 'claim_submitted' | 'item_returned';
  timestamp: string;
  description: string;
  itemId?: string;
  severity?: 'normal' | 'highlight' | 'success';
}
