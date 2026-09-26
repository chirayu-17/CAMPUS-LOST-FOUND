import { Ticket, TicketCategory, TicketType, TicketStatus, InterrogationChallenge, AuthSession } from '../types/ticket';

// Initial institutional registry data
const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TK-2026-0801',
    type: 'lost',
    category: 'electronics',
    date: '2026-09-01',
    timeReported: '2026-09-01T14:15:00Z',
    location_zone: 'Central Library - Quiet Floor 3',
    specific_area: 'Desk Cluster 12 near South Atrium',
    public_description: 'Space Gray 14-inch laptop in dark neoprene sleeve left momentarily at study carrel.',
    hidden_identifier: 'SERIAL: C02YF789MD6R. Underneath chassis: holographic NASA sticker with silver edge tear. Lock screen display name: "E. Vance // Physics Lab".',
    match_confidence: 94,
    matched_ticket_id: 'TK-2026-0802',
    status: 'potential_match',
    claimant_name: 'Elena Vance',
    claimant_contact: 'e.vance@campus.edu',
    custody_officer: null,
    interrogation_challenges: [
      {
        id: 'ic-1',
        question: 'What distinctive sticker or mark is affixed to the underside chassis?',
        expectedGroundTruth: 'Holographic NASA sticker with a silver edge tear on the top corner.',
        rationale: 'Physical artifact hidden from public view; only verified owner can identify without lifting device.'
      },
      {
        id: 'ic-2',
        question: 'What specific username or lab affiliation appears on the initial login screen?',
        expectedGroundTruth: '"E. Vance // Physics Lab"',
        rationale: 'Software identity parameter inaccessible while machine is locked.'
      },
      {
        id: 'ic-3',
        question: 'What are the first three and last three characters of the device serial code?',
        expectedGroundTruth: 'Prefix "C02", Suffix "D6R"',
        rationale: 'Official purchase invoice or Apple ID hardware profile verification.'
      }
    ],
    custody_audit_log: [
      {
        id: 'log-1',
        timestamp: '2026-09-01T14:15:00Z',
        officerBadge: 'PUBLIC_PORTAL',
        action: 'TICKET_LODGED',
        notes: 'Unauthenticated public submission received via unified portal.'
      }
    ]
  },
  {
    id: 'TK-2026-0802',
    type: 'found',
    category: 'electronics',
    date: '2026-09-01',
    timeReported: '2026-09-01T14:50:00Z',
    location_zone: 'Central Library - Ground Circulation',
    specific_area: 'Turned in to custodial security desk from 3rd floor',
    public_description: 'Space Gray Apple MacBook recovered from study area. Preserved in secure locker.',
    hidden_identifier: 'SERIAL: C02YF789MD6R. Sticker on bottom is NASA insignia. Incase sleeve zipper pull has orange paracord.',
    match_confidence: 94,
    matched_ticket_id: 'TK-2026-0801',
    status: 'in_custody',
    custody_officer: 'OFCR-HARRIS-410',
    interrogation_challenges: [
      {
        id: 'ic-4',
        question: 'Describe the zipper pull modification on the protective sleeve.',
        expectedGroundTruth: 'Orange paracord loop knotted through the zipper slider.',
        rationale: 'Specific user customization not stated in the public description.'
      },
      {
        id: 'ic-5',
        question: 'State the hardware serial number recorded during evidence intake.',
        expectedGroundTruth: 'C02YF789MD6R',
        rationale: 'Absolute definitive cryptographic match.'
      }
    ],
    custody_audit_log: [
      {
        id: 'log-2',
        timestamp: '2026-09-01T14:50:00Z',
        officerBadge: 'OFCR-HARRIS-410',
        action: 'INTAKE_LOGGED',
        notes: 'Device placed into Institutional Evidence Locker #04. Battery isolated.'
      },
      {
        id: 'log-3',
        timestamp: '2026-09-01T15:00:00Z',
        officerBadge: 'SYSTEM_ALGORITHM',
        action: 'MATCH_FLAGGED',
        notes: 'Algorithmic correlation identified TK-2026-0801 at 94% composite confidence.'
      }
    ]
  },
  {
    id: 'TK-2026-0803',
    type: 'lost',
    category: 'valuables_wallets',
    date: '2026-09-02',
    timeReported: '2026-09-02T11:20:00Z',
    location_zone: 'Student Union Food Atrium',
    specific_area: 'Table row between noodle bar and coffee counter',
    public_description: 'Brown weathered leather bi-fold wallet. Contains identification cards and transit voucher.',
    hidden_identifier: 'Inside lining holds $40 in cash (two $20 bills). Student card ID ending in 9412. Expired metro card tucked behind driver license.',
    match_confidence: 88,
    matched_ticket_id: 'TK-2026-0804',
    status: 'under_interrogation',
    claimant_name: 'Marcus Brody',
    claimant_contact: 'm.brody@campus.edu',
    custody_officer: 'OFCR-VASQUEZ-809',
    interrogation_challenges: [
      {
        id: 'ic-6',
        question: 'State the exact cash denominations and total bill count inside the currency sleeve.',
        expectedGroundTruth: 'Two $20 bills ($40 total)',
        rationale: 'Blind challenge - unobservable without physical examination by intake officer.'
      },
      {
        id: 'ic-7',
        question: 'Provide the terminal four digits of the student ID card seated in the primary slot.',
        expectedGroundTruth: '9412',
        rationale: 'Legal institutional identity verification.'
      },
      {
        id: 'ic-8',
        question: 'What auxiliary card is concealed behind the official state driver license?',
        expectedGroundTruth: 'Expired municipal metro transit card.',
        rationale: 'Secondary possession challenge.'
      }
    ],
    custody_audit_log: [
      {
        id: 'log-4',
        timestamp: '2026-09-02T11:20:00Z',
        officerBadge: 'PUBLIC_PORTAL',
        action: 'TICKET_LODGED',
        notes: 'Urgent lost ticket reported by claimant.'
      },
      {
        id: 'log-5',
        timestamp: '2026-09-02T13:00:00Z',
        officerBadge: 'OFCR-VASQUEZ-809',
        action: 'CUSTODY_INTERROGATION_OPENED',
        notes: 'Claimant appeared in precinct. Verification protocol initiated.'
      }
    ]
  },
  {
    id: 'TK-2026-0804',
    type: 'found',
    category: 'valuables_wallets',
    date: '2026-09-02',
    timeReported: '2026-09-02T11:45:00Z',
    location_zone: 'Student Union Food Atrium',
    specific_area: 'Handed to information kiosk by dining maintenance staff',
    public_description: 'Brown leather men\'s wallet recovered from dining hall floor. Secured in safe.',
    hidden_identifier: 'Currency inventory: $40.00 (two twenties). Card names match Marcus B. Brody.',
    match_confidence: 88,
    matched_ticket_id: 'TK-2026-0803',
    status: 'in_custody',
    custody_officer: 'OFCR-VASQUEZ-809',
    interrogation_challenges: [
      {
        id: 'ic-9',
        question: 'Confirm full legal name on the identity credential inside.',
        expectedGroundTruth: 'Marcus B. Brody',
        rationale: 'Direct institutional credential confirmation.'
      }
    ],
    custody_audit_log: [
      {
        id: 'log-6',
        timestamp: '2026-09-02T11:45:00Z',
        officerBadge: 'OFCR-VASQUEZ-809',
        action: 'EVIDENCE_CATALOGUED',
        notes: 'Sealed in tamper-evident bag #EV-9921.'
      }
    ]
  },
  {
    id: 'TK-2026-0805',
    type: 'found',
    category: 'keys_access',
    date: '2026-09-03',
    timeReported: '2026-09-03T08:30:00Z',
    location_zone: 'Science & Engineering Complex',
    specific_area: 'Stairwell B between Floors 2 and 3',
    public_description: 'Brass keyring with automotive remote fob and multiple laboratory access keys.',
    hidden_identifier: 'Key fob brand: Subaru. Blue plastic tag stamped "CHEM-304 / HAZMAT". Bottle opener tool shaped like a guitar.',
    match_confidence: null,
    status: 'in_custody',
    custody_officer: 'OFCR-HARRIS-410',
    interrogation_challenges: [
      {
        id: 'ic-10',
        question: 'What specific room code and warning label is stamped on the blue plastic tag?',
        expectedGroundTruth: '"CHEM-304 / HAZMAT"',
        rationale: 'Security-critical facility access validation.'
      },
      {
        id: 'ic-11',
        question: 'Describe the decorative metal tool or charm attached to the main ring.',
        expectedGroundTruth: 'Guitar-shaped bottle opener.',
        rationale: 'Personal accessory confirmation.'
      }
    ],
    custody_audit_log: [
      {
        id: 'log-7',
        timestamp: '2026-09-03T08:30:00Z',
        officerBadge: 'OFCR-HARRIS-410',
        action: 'INTAKE_LOGGED',
        notes: 'Secured in key cabinet vault row 3.'
      }
    ]
  },
  {
    id: 'TK-2026-0806',
    type: 'lost',
    category: 'credentials_ids',
    date: '2026-09-03',
    timeReported: '2026-09-03T09:10:00Z',
    location_zone: 'Recreation & Athletics Center',
    specific_area: 'Locker room bench area',
    public_description: 'Institutional faculty badge with black lanyard and NFC door sensor token.',
    hidden_identifier: 'Badge holder contains RFID sticker 9081-A. Back side of badge has parking gate bar code ending in 0021.',
    match_confidence: null,
    status: 'active',
    claimant_name: 'Dr. Arthur Sterling',
    claimant_contact: 'a.sterling@dept.edu',
    custody_officer: null,
    interrogation_challenges: [
      {
        id: 'ic-12',
        question: 'State the four terminal digits of the reverse parking permit barcode.',
        expectedGroundTruth: '0021',
        rationale: 'Unique institutional credential validation.'
      }
    ],
    custody_audit_log: [
      {
        id: 'log-8',
        timestamp: '2026-09-03T09:10:00Z',
        officerBadge: 'PUBLIC_PORTAL',
        action: 'TICKET_LODGED',
        notes: 'Submitted online via public report form.'
      }
    ]
  }
];

const STORAGE_KEY = 'noir_justice_tickets_v1';

class TicketStoreService {
  private tickets: Ticket[];

  constructor() {
    this.tickets = this.loadFromStorage();
  }

  private loadFromStorage(): Ticket[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage, defaulting to initial dataset', e);
    }
    return INITIAL_TICKETS;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tickets));
    } catch (e) {
      console.error('Failed to persist tickets', e);
    }
  }

  /**
   * ZERO-TRUST PUBLIC PROJECTION
   * Strictly enforces redaction:
   * - `hidden_identifier` is replaced with standard redaction stamp
   * - `match_confidence` is nullified for unauthenticated users
   */
  public getPublicLedger(): Ticket[] {
    return this.tickets.map(t => ({
      ...t,
      hidden_identifier: '[REDACTED // RESTRICTED ACCESS]',
      match_confidence: null,
      claimant_contact: t.claimant_contact ? '[PROTECTED CLASSIFIED DATA]' : null,
      interrogation_challenges: [] // Redacted from public inspection
    }));
  }

  /**
   * SECURE ADMIN RETRIEVAL
   * Reveals full unmasked `hidden_identifier` and computed algorithmic `match_confidence`
   */
  public getAdminTickets(session: AuthSession): Ticket[] {
    if (!session.isAdmin) {
      throw new Error('SECURITY_BREACH: Insufficient institutional clearance.');
    }
    return [...this.tickets];
  }

  public getTicketById(id: string, session?: AuthSession): Ticket | null {
    const ticket = this.tickets.find(t => t.id === id);
    if (!ticket) return null;

    if (!session || !session.isAdmin) {
      // Return public sanitized projection
      return {
        ...ticket,
        hidden_identifier: '[REDACTED // RESTRICTED ACCESS]',
        match_confidence: null,
        claimant_contact: ticket.claimant_contact ? '[PROTECTED CLASSIFIED DATA]' : null,
        interrogation_challenges: []
      };
    }

    return ticket;
  }

  /**
   * PUBLIC UNRESTRICTED CREATION
   * Anyone can submit a ticket without authentication, writing to all fields including `hidden_identifier`.
   * Automatically executes the algorithmic scoring engine against reciprocal tickets.
   */
  public createTicket(payload: {
    type: TicketType;
    category: TicketCategory;
    date: string;
    location_zone: string;
    specific_area?: string;
    public_description: string;
    hidden_identifier: string;
    claimant_name?: string;
    claimant_contact?: string;
  }): Ticket {
    const seq = Math.floor(1000 + Math.random() * 9000);
    const newId = `TK-2026-${seq}`;
    const nowIso = new Date().toISOString();

    // Auto-generate blind interrogation questions from hidden identifier
    const interrogationChallenges = this.generateChallenges(payload.hidden_identifier, payload.category);

    const newTicket: Ticket = {
      id: newId,
      type: payload.type,
      category: payload.category,
      date: payload.date || nowIso.split('T')[0],
      timeReported: nowIso,
      location_zone: payload.location_zone || 'General Campus Perimeter',
      specific_area: payload.specific_area || 'Specific location undisclosed',
      public_description: payload.public_description,
      hidden_identifier: payload.hidden_identifier,
      match_confidence: null,
      status: 'active',
      claimant_name: payload.claimant_name || null,
      claimant_contact: payload.claimant_contact || null,
      custody_officer: null,
      interrogation_challenges: interrogationChallenges,
      custody_audit_log: [
        {
          id: `log-${Date.now()}`,
          timestamp: nowIso,
          officerBadge: 'PUBLIC_PORTAL',
          action: 'TICKET_LODGED',
          notes: `Public entry logged into institutional registry with hidden identifier (${payload.hidden_identifier.length} chars).`
        }
      ]
    };

    // Calculate algorithmic match confidence against complementary items
    const match = this.calculateBestMatch(newTicket, this.tickets);
    if (match) {
      newTicket.match_confidence = match.score;
      newTicket.matched_ticket_id = match.matchedId;
      newTicket.status = match.score >= 70 ? 'potential_match' : 'active';

      // Update complementary ticket if higher
      const complementary = this.tickets.find(t => t.id === match.matchedId);
      if (complementary && (!complementary.match_confidence || complementary.match_confidence < match.score)) {
        complementary.match_confidence = match.score;
        complementary.matched_ticket_id = newTicket.id;
        if (complementary.status === 'active') {
          complementary.status = 'potential_match';
        }
      }
    }

    this.tickets.unshift(newTicket);
    this.saveToStorage();
    return newTicket;
  }

  /**
   * Generates blind question challenges for institutional interrogation
   */
  private generateChallenges(hiddenIdentifier: string, category: TicketCategory): InterrogationChallenge[] {
    const challenges: InterrogationChallenge[] = [];

    challenges.push({
      id: `ic-gen-1-${Date.now()}`,
      question: 'State any unique serial number, alphanumeric ID, or receipt reference attached to this item.',
      expectedGroundTruth: hiddenIdentifier,
      rationale: 'Hardware or cryptographic proof of possession.'
    });

    if (category === 'valuables_wallets') {
      challenges.push({
        id: `ic-gen-2-${Date.now()}`,
        question: 'Identify the exact internal contents, cash denominations, or membership cards tucked inside.',
        expectedGroundTruth: hiddenIdentifier,
        rationale: 'Blind verification - details not disclosed to public spectators.'
      });
    } else if (category === 'electronics') {
      challenges.push({
        id: `ic-gen-3-${Date.now()}`,
        question: 'Describe lock screen credentials, personalized cosmetic stickers, or casing defects.',
        expectedGroundTruth: hiddenIdentifier,
        rationale: 'Physical telemetry and proprietary hardware personalization.'
      });
    } else {
      challenges.push({
        id: `ic-gen-4-${Date.now()}`,
        question: 'Describe any specific cosmetic wear, internal markings, or personal modifications.',
        expectedGroundTruth: hiddenIdentifier,
        rationale: 'Ground-truth comparison against physical evidence in custody.'
      });
    }

    return challenges;
  }

  /**
   * Multi-vector heuristic matching engine
   */
  private calculateBestMatch(target: Ticket, candidates: Ticket[]): { score: number; matchedId: string } | null {
    const oppositeType = target.type === 'lost' ? 'found' : 'lost';
    const eligible = candidates.filter(c => c.type === oppositeType);

    if (eligible.length === 0) return null;

    let bestScore = 0;
    let bestId = '';

    for (const candidate of eligible) {
      let score = 0;

      // 1. Category match (Weight 30%)
      if (candidate.category === target.category) {
        score += 30;
      }

      // 2. Lexical keyword intersection in public description (Weight 35%)
      const targetWords = new Set(
        target.public_description.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
      );
      const candWords = candidate.public_description.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
      let commonWords = 0;
      for (const w of candWords) {
        if (targetWords.has(w)) commonWords++;
      }
      const lexicalFraction = targetWords.size > 0 ? Math.min(1, commonWords / Math.min(targetWords.size, 6)) : 0;
      score += Math.round(lexicalFraction * 35);

      // 3. Location Zone proximity (Weight 20%)
      if (target.location_zone && candidate.location_zone) {
        if (target.location_zone.toLowerCase() === candidate.location_zone.toLowerCase()) {
          score += 20;
        } else if (
          target.location_zone.toLowerCase().includes('library') && candidate.location_zone.toLowerCase().includes('library') ||
          target.location_zone.toLowerCase().includes('union') && candidate.location_zone.toLowerCase().includes('union') ||
          target.location_zone.toLowerCase().includes('science') && candidate.location_zone.toLowerCase().includes('science')
        ) {
          score += 15;
        }
      }

      // 4. Temporal proximity (Weight 15%)
      try {
        const d1 = new Date(target.date).getTime();
        const d2 = new Date(candidate.date).getTime();
        const dayDiff = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
        if (dayDiff <= 1) score += 15;
        else if (dayDiff <= 3) score += 10;
        else if (dayDiff <= 7) score += 5;
      } catch {
        score += 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestId = candidate.id;
      }
    }

    if (bestScore >= 50) {
      return { score: Math.min(bestScore, 98), matchedId: bestId };
    }
    return null;
  }

  /**
   * Record custody adjudication from interrogation room
   */
  public adjudicateHandover(
    ticketId: string,
    decision: 'APPROVED_RESTITUTION' | 'REJECTED_DISCREPANCY' | 'FRAUD_FLAGGED',
    officerNotes: string,
    session: AuthSession
  ): Ticket {
    if (!session.isAdmin) {
      throw new Error('SECURITY_BREACH: Only authenticated officers can adjudicate custody.');
    }

    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found.');

    const timestamp = new Date().toISOString();
    let newStatus: TicketStatus = ticket.status;

    if (decision === 'APPROVED_RESTITUTION') {
      newStatus = 'restituted';
    } else if (decision === 'REJECTED_DISCREPANCY') {
      newStatus = 'in_custody';
    } else if (decision === 'FRAUD_FLAGGED') {
      newStatus = 'flagged';
    }

    ticket.status = newStatus;
    ticket.custody_officer = session.officerBadge || 'SEC-OFFICER';
    ticket.custody_audit_log.push({
      id: `adjudicate-${Date.now()}`,
      timestamp,
      officerBadge: session.officerBadge || 'OFFICER_COMMAND',
      action: decision,
      notes: officerNotes
    });

    this.saveToStorage();
    return ticket;
  }

  public resetToFactorySeed(): void {
    this.tickets = JSON.parse(JSON.stringify(INITIAL_TICKETS));
    this.saveToStorage();
  }
}

export const ticketService = new TicketStoreService();
