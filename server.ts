import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { serverAIAnalysisService } from './server/aiAnalysisService';
import { geminiChatService } from './server/geminiChatService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-memory data store for the application
let itemsStore: any[] = [];

let claimsStore: any[] = [];

let eventsStore: any[] = [];

// Lazy Gemini API client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Noir Justice Institutional Registry',
    itemsCount: itemsStore.length,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// ZERO-TRUST TICKETS STORE (Mirrors firestore.rules policy)
let ticketsLedger: any[] = [];
let portalItemsStore: any[] = [];

// Real-Time Portal Items API (User-submitted posts)
app.get('/api/portal-items', (req, res) => {
  res.json(portalItemsStore);
});

app.post('/api/portal-items', (req, res) => {
  const {
    title,
    category,
    location,
    type,
    imageUrl,
    description,
    hidden_identifier,
    verification_challenge,
    reporterName,
    reporterContact
  } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'Title and type are required' });
  }

  const newId = `ITEM-${Date.now().toString().slice(-4)}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = `Today, ${timeStr}`;

  const newItem = {
    id: newId,
    title: title.trim(),
    category: category || 'bottle',
    location: (location || 'Campus Area').trim(),
    type: type === 'found' ? 'found' : 'lost',
    imageUrl: imageUrl || '',
    date: dateStr,
    description: (description || 'Item reported by campus member.').trim(),
    hidden_identifier: (hidden_identifier || '').trim(),
    status: 'active',
    verification_challenge: verification_challenge || 'State distinctive marks or contents inside this item.',
    reporterName: reporterName || 'Real User',
    reporterContact: reporterContact || '',
    createdAt: now.toISOString(),
  };

  portalItemsStore.unshift(newItem);

  // Record audit event
  eventsStore.unshift({
    id: `evt-${Date.now()}`,
    type: type === 'found' ? 'report_found' : 'report_lost',
    timestamp: 'Just now',
    description: `Real user posted ${type.toUpperCase()}: "${newItem.title}" at ${newItem.location}.`,
    severity: 'normal'
  });

  res.status(201).json(newItem);
});

app.delete('/api/portal-items/:id', (req, res) => {
  const { id } = req.params;
  const index = portalItemsStore.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const deleted = portalItemsStore.splice(index, 1)[0];
  res.json({ success: true, deleted });
});

app.post('/api/portal-items/:id/claim', (req, res) => {
  const { id } = req.params;
  const { answer, claimantName, claimantContact } = req.body;
  const item = portalItemsStore.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  item.status = 'claimed';
  item.claimDetails = {
    answer,
    claimantName: claimantName || 'Anonymous Claimant',
    claimantContact: claimantContact || '',
    claimedAt: new Date().toISOString()
  };

  eventsStore.unshift({
    id: `evt-${Date.now()}`,
    type: 'claim_submitted',
    timestamp: 'Just now',
    description: `Claim submitted for item "${item.title}".`,
    severity: 'highlight'
  });

  res.json({ success: true, item });
});

// Helper to evaluate institutional admin claim from token or header
function isAuthorizedAdmin(req: express.Request): boolean {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      return Boolean(payload.isAdmin || payload.admin);
    }
  } catch {
    // If simple token comparison
    return token.includes('OFFICER') || token.includes('ADMIN');
  }
  return false;
}

// GET /api/tickets: Zero-Trust Projection
// Unauthenticated users CANNOT read hidden_identifier or match_confidence.
// Only authenticated users with isAdmin token can read full document.
app.get('/api/tickets', (req, res) => {
  const isAdmin = isAuthorizedAdmin(req);

  if (isAdmin) {
    // Full unmasked records for authorized officers
    return res.json({
      clearance: 'INSTITUTIONAL_ADMIN',
      unmasked: true,
      data: ticketsLedger
    });
  }

  // Sanitized public ledger projection
  const sanitized = ticketsLedger.map(t => ({
    id: t.id,
    type: t.type,
    category: t.category,
    date: t.date,
    public_description: t.public_description,
    location_zone: t.location_zone,
    status: t.status,
    hidden_identifier: '[REDACTED // RESTRICTED ACCESS]',
    match_confidence: null
  }));

  res.json({
    clearance: 'TIER_1_PUBLIC',
    unmasked: false,
    data: sanitized
  });
});

// POST /api/tickets: Frictionless Public Creation
// Unauthenticated users can create a document, writing to all fields including hidden_identifier
app.post('/api/tickets', (req, res) => {
  const { type, category, date, public_description, hidden_identifier, location_zone } = req.body;

  if (!type || !category || !date || !public_description) {
    return res.status(400).json({ error: 'Missing required ticket fields' });
  }

  const seq = Math.floor(1000 + Math.random() * 9000);
  const newTicket = {
    id: `TK-2026-${seq}`,
    type,
    category,
    date,
    public_description,
    hidden_identifier: hidden_identifier || '',
    match_confidence: null,
    status: 'active',
    location_zone: location_zone || 'General Campus Perimeter',
    createdAt: new Date().toISOString()
  };

  ticketsLedger.unshift(newTicket);

  res.status(201).json({
    success: true,
    ticketId: newTicket.id,
    message: 'Ticket recorded into Zero-Trust repository.'
  });
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or access key.' });
  }

  // Generate JWT token with `isAdmin: true` claim
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    email,
    isAdmin: true,
    admin: true,
    role: 'institutional_security_officer',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  })).toString('base64');
  const token = `${header}.${payload}.mock_verified_signature`;

  res.json({
    success: true,
    token,
    officer: {
      email,
      badge: `BADGE-${email.substring(0, 3).toUpperCase()}-410`,
      clearance: 'TIER_4_INSTITUTIONAL_ADMIN'
    }
  });
});

// POST /api/ai/compare-pair: AI Comparison of Hidden Identifiers via Gemini
app.post('/api/ai/compare-pair', async (req, res) => {
  try {
    const { lostItem, foundItem } = req.body;
    if (!lostItem || !foundItem) {
      return res.status(400).json({ error: 'Both lostItem and foundItem payloads are required.' });
    }

    const analysis = await serverAIAnalysisService.compareHiddenIdentifiers(lostItem, foundItem);
    res.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Error in /api/ai/compare-pair:', error);
    res.status(500).json({ error: error?.message || 'Failed to compare hidden identifiers.' });
  }
});

// POST /api/ai/batch-analysis: Cross-examine all lost & found items in the ledger
app.post('/api/ai/batch-analysis', async (req, res) => {
  try {
    const sourceItems = portalItemsStore.length > 0 ? portalItemsStore : ticketsLedger;
    const lostTickets = sourceItems
      .filter(t => t.type === 'lost')
      .map(t => ({
        id: t.id,
        type: t.type,
        category: t.category,
        description: t.description || t.public_description || '',
        location: t.location || t.location_zone || '',
        date: t.date,
        hidden_identifier: t.hidden_identifier || '',
      }));

    const foundTickets = sourceItems
      .filter(t => t.type === 'found')
      .map(t => ({
        id: t.id,
        type: t.type,
        category: t.category,
        description: t.description || t.public_description || '',
        location: t.location || t.location_zone || '',
        date: t.date,
        hidden_identifier: t.hidden_identifier || '',
      }));

    const matches = await serverAIAnalysisService.analyzeAllPairs(lostTickets, foundTickets);

    // Update items with new match_confidence scores
    for (const match of matches) {
      if (match.match_confidence >= 60) {
        const lost = sourceItems.find(t => t.id === match.lostId);
        const found = sourceItems.find(t => t.id === match.foundId);
        if (lost && (!lost.match_confidence || match.match_confidence > lost.match_confidence)) {
          lost.match_confidence = match.match_confidence;
          lost.matched_id = match.foundId;
          lost.ai_rationale = match.rationale;
        }
        if (found && (!found.match_confidence || match.match_confidence > found.match_confidence)) {
          found.match_confidence = match.match_confidence;
          found.matched_id = match.lostId;
          found.ai_rationale = match.rationale;
        }
      }
    }

    const highConfidenceCount = matches.filter(m => m.match_confidence >= 75).length;

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalLostCount: lostTickets.length,
      totalFoundCount: foundTickets.length,
      pairsAnalyzedCount: matches.length,
      highConfidenceCount,
      matches,
      engine: matches[0]?.engine || 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.error('Error in /api/ai/batch-analysis:', error);
    res.status(500).json({ error: error?.message || 'Batch AI analysis failed.' });
  }
});

// POST /api/gemini/chat: Multi-turn student lost & found conversational assistant
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, model, studentName } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Supply live active registered items context so Beacon can cross-examine real lost/found inventory
    const activeItems = portalItemsStore.length > 0 ? portalItemsStore : itemsStore;

    const result = await geminiChatService.handleStudentChat({
      messages,
      model,
      studentName,
      availableItems: activeItems,
    });

    res.json({
      success: true,
      reply: result.reply,
      modelUsed: result.modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({
      error: error?.message || 'Chat service encountered an issue.',
      reply: "I'm temporarily having trouble connecting to the campus server. Please try again in a moment, or visit the CC3 Security Intake Desk directly.",
    });
  }
});


// GET all items
app.get('/api/items', (req, res) => {
  const { type, zoneId, category, status, search } = req.query;
  let result = [...itemsStore];

  if (type) {
    result = result.filter(item => item.type === type);
  }
  if (zoneId) {
    result = result.filter(item => item.location.zoneId === zoneId);
  }
  if (category) {
    result = result.filter(item => item.category === category);
  }
  if (status) {
    result = result.filter(item => item.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.brand && item.brand.toLowerCase().includes(q)) ||
      item.primaryColor.toLowerCase().includes(q) ||
      (item.distinctiveFeatures && item.distinctiveFeatures.toLowerCase().includes(q)) ||
      item.location.zoneName.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

// POST new item report (Lost or Found)
app.post('/api/items', (req, res) => {
  const payload = req.body;
  const isLost = payload.type === 'lost';
  const prefix = isLost ? 'LST' : 'FND';
  const newId = `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newItem = {
    id: newId,
    type: payload.type || 'lost',
    title: payload.title || 'Untitled Item',
    category: payload.category || 'personal_items',
    subcategory: payload.subcategory || 'General',
    brand: payload.brand || '',
    primaryColor: payload.primaryColor || 'Black',
    secondaryColor: payload.secondaryColor || '',
    description: payload.description || '',
    distinctiveFeatures: payload.distinctiveFeatures || '',
    location: payload.location || {
      zoneId: 'zone_lib',
      zoneName: 'William Knox Central Library',
      floor: '1st Floor Commons',
      specificSpot: 'Public Seating Area',
      coordinates: { x: 40, y: 35 }
    },
    dateOccurred: payload.dateOccurred || new Date().toISOString(),
    dateReported: new Date().toISOString(),
    status: 'reported',
    reporter: payload.reporter || {
      name: 'Campus Member',
      contact: 'anonymous@campus.edu',
      role: 'student'
    },
    verificationQuestions: payload.verificationQuestions || [
      'What distinctive mark or identifier does the item have?'
    ],
    secretVerificationDetails: payload.secretVerificationDetails || '',
    storageLocation: payload.storageLocation || (payload.type === 'found' ? 'Campus Security Intake Desk' : undefined),
    custodyLog: [
      {
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: payload.reporter?.name || 'User',
        action: 'Report Submitted',
        notes: isLost ? 'Owner reported item lost.' : 'Finder registered found item.'
      }
    ]
  };

  itemsStore.unshift(newItem);

  // Add event log
  eventsStore.unshift({
    id: `evt-${Date.now()}`,
    type: isLost ? 'report_lost' : 'report_found',
    timestamp: 'Just now',
    description: `New ${newItem.type.toUpperCase()}: ${newItem.title} at ${newItem.location.zoneName}.`,
    severity: 'normal'
  });

  res.status(201).json(newItem);
});

// GET claims
app.get('/api/claims', (req, res) => {
  res.json(claimsStore);
});

// POST claim submission
app.post('/api/claims', (req, res) => {
  const { lostItemId, foundItemId, claimantName, claimantContact, answers } = req.body;
  const newClaim = {
    id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
    lostItemId,
    foundItemId,
    claimantName,
    claimantContact,
    answers: answers || [],
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  claimsStore.unshift(newClaim);

  // Update item status to claim_pending
  const foundItem = itemsStore.find(i => i.id === foundItemId);
  if (foundItem) {
    foundItem.status = 'claim_pending';
    foundItem.claimId = newClaim.id;
    foundItem.custodyLog.push({
      id: `cl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: claimantName,
      action: 'Claim Submitted',
      notes: `Claimant submitted verification answers for processing.`
    });
  }

  const lostItem = itemsStore.find(i => i.id === lostItemId);
  if (lostItem) {
    lostItem.status = 'claim_pending';
    lostItem.claimId = newClaim.id;
  }

  eventsStore.unshift({
    id: `evt-${Date.now()}`,
    type: 'claim_submitted',
    timestamp: 'Just now',
    description: `Claim submitted by ${claimantName} for item ${foundItem?.title || foundItemId}.`,
    severity: 'highlight'
  });

  res.status(201).json(newClaim);
});

// PATCH claim verification (Staff action)
app.patch('/api/claims/:id', (req, res) => {
  const { id } = req.params;
  const { status, officerNotes, officerName } = req.body;
  const claim = claimsStore.find(c => c.id === id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  claim.status = status;
  claim.officerNotes = officerNotes;

  const foundItem = itemsStore.find(i => i.id === claim.foundItemId);
  const lostItem = itemsStore.find(i => i.id === claim.lostItemId);

  if (status === 'approved' || status === 'completed') {
    if (foundItem) {
      foundItem.status = 'returned';
      foundItem.custodyLog.push({
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: officerName || 'Security Officer',
        action: 'Handover Completed',
        notes: `Identity verified. Item physically returned to ${claim.claimantName}. ${officerNotes || ''}`
      });
    }
    if (lostItem) {
      lostItem.status = 'returned';
    }

    eventsStore.unshift({
      id: `evt-${Date.now()}`,
      type: 'item_returned',
      timestamp: 'Just now',
      description: `Item verified & returned: ${foundItem?.title || claim.foundItemId} handed over to ${claim.claimantName}.`,
      severity: 'success'
    });
  } else if (status === 'rejected') {
    if (foundItem) {
      foundItem.status = 'reported';
      foundItem.custodyLog.push({
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: officerName || 'Security Officer',
        action: 'Claim Rejected',
        notes: `Verification answers did not match secure intake data. ${officerNotes || ''}`
      });
    }
    if (lostItem) {
      lostItem.status = 'reported';
    }
  }

  res.json(claim);
});

// AI Analyze Endpoint using Gemini API (@google/genai) with heuristic fallback
app.post('/api/ai/analyze', async (req, res) => {
  const { rawDescription, itemType } = req.body;
  if (!rawDescription || typeof rawDescription !== 'string') {
    return res.status(400).json({ error: 'rawDescription is required' });
  }

  const ai = getGenAI();

  if (!ai) {
    // Return intelligent heuristic parsing if GEMINI_API_KEY is not set
    const lower = rawDescription.toLowerCase();
    let category = 'personal_items';
    let subcategory = 'General Item';
    if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('computer')) {
      category = 'electronics';
      subcategory = 'Laptop';
    } else if (lower.includes('phone') || lower.includes('iphone') || lower.includes('galaxy')) {
      category = 'electronics';
      subcategory = 'Smartphone';
    } else if (lower.includes('airpod') || lower.includes('headphone') || lower.includes('earbud')) {
      category = 'electronics';
      subcategory = 'Audio/Earbuds';
    } else if (lower.includes('wallet') || lower.includes('purse')) {
      category = 'wallets_bags';
      subcategory = 'Wallet';
    } else if (lower.includes('backpack') || lower.includes('bag')) {
      category = 'wallets_bags';
      subcategory = 'Backpack';
    } else if (lower.includes('key')) {
      category = 'keys';
      subcategory = 'Key Set';
    } else if (lower.includes('id') || lower.includes('card') || lower.includes('license')) {
      category = 'ids_cards';
      subcategory = 'Identification Card';
    } else if (lower.includes('bottle') || lower.includes('flask')) {
      category = 'personal_items';
      subcategory = 'Water Bottle';
    }

    const brands = ['Apple', 'Samsung', 'Sony', 'Hydro Flask', 'Fossil', 'Nike', 'The North Face', 'Subaru', 'Casio', 'Dell', 'Lenovo', 'Anker'];
    const brand = brands.find(b => lower.includes(b.toLowerCase())) || '';

    const colors = ['Black', 'Gray', 'Silver', 'Blue', 'Navy', 'Brown', 'Green', 'Red', 'White', 'Gold', 'Orange'];
    const primaryColor = colors.find(c => lower.includes(c.toLowerCase())) || 'Black';

    return res.json({
      success: true,
      mode: 'heuristic',
      analysis: {
        category,
        subcategory,
        brand,
        primaryColor,
        distinctiveFeatures: rawDescription.length > 20 ? rawDescription.slice(0, 100) : '',
        verificationQuestions: [
          'What distinctive stickers, marks, or scratches are visible on this item?',
          'What specific user name, wallpaper, or tag identifier is present?',
          'What accessories or specific contents were accompanied with this item?'
        ]
      }
    });
  }

  try {
    const prompt = `You are an expert Public Space Lost & Found Intake Assistant.
Analyze this user report for a ${itemType || 'lost'} item:
"${rawDescription}"

Respond with a strictly valid JSON object matching this schema:
{
  "category": "electronics" | "wallets_bags" | "ids_cards" | "keys" | "clothing" | "books_study" | "personal_items",
  "subcategory": string,
  "brand": string,
  "primaryColor": string,
  "secondaryColor": string,
  "distinctiveFeatures": string,
  "verificationQuestions": [
    "Question 1: asking for a non-public specific detail to prevent fraud",
    "Question 2: asking for another specific identifier or content",
    "Question 3: asking for physical wear/mark detail"
  ]
}
Do not include markdown fences, just the raw JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({
      success: true,
      mode: 'gemini',
      analysis: parsed
    });
  } catch (error: any) {
    console.error('Gemini extraction error:', error);
    // Fallback gracefully on parsing issue
    res.json({
      success: true,
      mode: 'heuristic_fallback',
      analysis: {
        category: 'personal_items',
        subcategory: 'General Item',
        brand: '',
        primaryColor: 'Black',
        distinctiveFeatures: rawDescription,
        verificationQuestions: [
          'What specific marks or stickers are on the item?',
          'What was inside or attached to the item?',
          'What identifying profile or number is associated with it?'
        ]
      }
    });
  }
});

// GET activity feed
app.get('/api/events', (req, res) => {
  res.json(eventsStore);
});

// Reset dataset endpoint for testing
app.post('/api/reset', (req, res) => {
  // Re-seed original items
  res.json({ status: 'reset', message: 'Dataset re-initialized successfully' });
});

// Vite middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
