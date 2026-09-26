export type TicketType = 'lost' | 'found';

export type TicketCategory =
  | 'electronics'
  | 'credentials_ids'
  | 'valuables_wallets'
  | 'keys_access'
  | 'apparel'
  | 'stationery_books'
  | 'personal_belongings';

export type TicketStatus =
  | 'active'
  | 'potential_match'
  | 'in_custody'
  | 'under_interrogation'
  | 'restituted'
  | 'flagged';

export interface InterrogationChallenge {
  id: string;
  question: string;
  expectedGroundTruth: string; // From the hidden_identifier or verified features
  rationale: string;
}

export interface CustodyLogRecord {
  id: string;
  timestamp: string;
  officerBadge: string;
  action: string;
  notes: string;
}

export interface Ticket {
  id: string;
  type: TicketType;
  category: TicketCategory;
  date: string; // ISO date or format YYYY-MM-DD
  timeReported: string;
  location_zone: string;
  specific_area: string;
  public_description: string;
  
  // SENSITIVE ATTRIBUTES - Masked for public, visible for Admin
  hidden_identifier: string; // e.g. "Serial: C02G9012MD6R; Holographic sticker on battery base; $45 cash inside hidden fold"
  match_confidence: number | null; // 0-100 composite score
  matched_ticket_id?: string | null;
  
  status: TicketStatus;
  claimant_name?: string | null;
  claimant_contact?: string | null;
  custody_officer?: string | null;
  interrogation_challenges: InterrogationChallenge[];
  custody_audit_log: CustodyLogRecord[];
}

export interface PublicTicket {
  id: string;
  type: TicketType;
  category: TicketCategory;
  date: string;
  timeReported: string;
  location_zone: string;
  public_description: string;
  status: TicketStatus;
  // hidden_identifier and match_confidence are explicitly omitted or masked
}

export interface AuthSession {
  isAuthenticated: boolean;
  isAdmin: boolean;
  officerBadge: string | null;
  officerEmail: string | null;
  clearanceLevel: 'TIER_1_PUBLIC' | 'TIER_4_INSTITUTIONAL_ADMIN';
  token: string | null;
}
