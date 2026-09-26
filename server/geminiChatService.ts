import { GoogleGenAI } from '@google/genai';

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface ChatContextItem {
  id: string;
  title: string;
  category?: string;
  type?: string;
  location?: string;
  date?: string;
  description?: string;
  status?: string;
}

class GeminiChatService {
  private genAI: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    if (!this.genAI) {
      this.genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.genAI;
  }

  /**
   * Generates a multi-turn response using Gemini chat
   */
  public async handleStudentChat(params: {
    messages: ChatMessage[];
    model?: string;
    studentName?: string;
    availableItems?: ChatContextItem[];
  }): Promise<{ reply: string; modelUsed: string; suggestedAction?: string }> {
    const { messages, studentName, availableItems = [] } = params;
    // Follow model selection guidance: gemini-3.5-flash for general tasks, gemini-3.1-flash-lite for fast tasks, gemini-3.1-pro-preview for complex tasks
    const requestedModel = params.model || 'gemini-3.5-flash';
    const validModels = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    const model = validModels.includes(requestedModel) ? requestedModel : 'gemini-3.5-flash';

    if (!messages || messages.length === 0) {
      return {
        reply: "Hello! I am Chiroz, your Campus Lost & Found Assistant. Tell me what you've misplaced or found on campus!",
        modelUsed: model,
      };
    }

    // Build rich, safe inventory digest for context
    const sanitizedInventory = availableItems.slice(0, 30).map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type === 'found' ? 'FOUND (In Custody/Reported)' : 'LOST (Owner Searching)',
      category: item.category || 'General',
      location: item.location || 'Campus Perimeter',
      date: item.date || 'Recent',
      description: item.description || '',
      status: item.status || 'active',
    }));

    const systemInstruction = `You are "Chiroz", the empathetic, highly intelligent AI Campus Lost & Found Assistant for university students, staff, and faculty.
Your mission is to help students recover their lost belongings across campus as quickly and stress-free as possible.

STUDENT PROFILE CONTEXT:
- Interacting student name: ${studentName || 'Student'}

CAMPUS ENVIRONMENT KNOWLEDGE:
- Frequent zones: William Knox Central Library (Floors 1-4, quiet study booths), CC3 Computer Center & Lecture Theaters, Student Activity Center, Campus Dining Commons, North Science Laboratories, Athletic Recreation Pavilion, and Campus Shuttle Bus Stops.
- Zero-Trust Institutional Security: Lost & Found claims require matching distinctive marks or hidden identifiers to prevent theft.
- Where items are turned in: Campus Security Intake Desk (CC3 Ground Level), Library Front Circulation Desk, or Departmental Administrative Offices.

CURRENT LIVE CAMPUS PROPERTY REGISTRY:
${JSON.stringify(sanitizedInventory, null, 2)}

ROLE & BEHAVIOR GUIDELINES:
1. Actively listen and show empathy when a student expresses distress over a misplaced item (laptops, student ID cards, phones, keys, water bottles, umbrellas, notebooks, etc.).
2. Cross-reference what the student describes with the CURRENT LIVE CAMPUS PROPERTY REGISTRY above. If there is a potential match or similar item reported in the registry, mention it proactively with its item details!
3. If no immediate match exists, ask 1-2 focused clarifying questions (e.g. brand, color, stickers/scratch marks, exact lecture hall or desk area, approx time).
4. Provide immediate, practical campus advice (e.g. check the CC3 intake desk, alert the floor custodian, or check the library circulation desk).
5. Encourage the student to use the "Add Item" button in this portal to file an official report so other students and staff get notified in real time.
6. Keep answers structured, friendly, concise, and easy to read on mobile. Use bullet points or bold text where helpful.`;

    const ai = this.getClient();

    if (ai) {
      try {
        // Format history for @google/genai (all messages except the very last one)
        const historyTurns = messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const latestMessage = messages[messages.length - 1].content;

        const chatPromise = (async () => {
          const chat = ai.chats.create({
            model,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
            history: historyTurns,
          });

          const response = await chat.sendMessage({
            message: latestMessage,
          });

          return response.text;
        })();

        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('AI inference timeout')), 5000)
        );

        const replyText = await Promise.race([chatPromise, timeoutPromise]);

        if (replyText) {
          return {
            reply: replyText,
            modelUsed: model,
          };
        }
      } catch (err: any) {
        console.warn('[GeminiChatService] Falling back to campus heuristic assistant:', err?.message || err);
      }
    }

    // Fallback campus heuristic assistant if API key is not configured or error occurs
    return this.generateHeuristicFallback(messages, availableItems, studentName, model);
  }

  private generateHeuristicFallback(
    messages: ChatMessage[],
    availableItems: ChatContextItem[],
    studentName?: string,
    modelUsed = 'gemini-3.5-flash'
  ): { reply: string; modelUsed: string } {
    const latest = messages[messages.length - 1]?.content.toLowerCase() || '';
    const nameGreeting = studentName ? ` ${studentName}` : '';

    // Check if query matches any items in registry
    const matched = availableItems.filter((item) => {
      const q = latest;
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const loc = (item.location || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return (
        (title && q.includes(title)) ||
        (desc && q.includes(desc)) ||
        (cat && q.includes(cat)) ||
        (loc && q.includes(loc))
      );
    });

    if (matched.length > 0) {
      const best = matched[0];
      return {
        reply: `Hi${nameGreeting}! I searched our campus registry and found a related record:\n\n• **${best.title}** (${best.type === 'found' ? 'Found / In Custody' : 'Reported Lost'})\n• **Location**: ${best.location || 'Campus'}\n• **Docket ID**: ${best.id}\n\nDoes this match your item? If yes, click on the item card on the main dashboard to view its details or file a claim!`,
        modelUsed,
      };
    }

    if (latest.includes('id card') || latest.includes('identity')) {
      return {
        reply: `Hi${nameGreeting}! Lost student ID cards are typically turned in to **Campus Security Intake at CC3** or the **William Knox Library front desk** within 2-4 hours. \n\n**Recommended steps:**\n1. Check the CC3 intake desk right away.\n2. Submit a report using the **"Add Item"** button on top so campus staff can cross-reference it if found.\n3. Keep your student roll number ready for verification!`,
        modelUsed,
      };
    }

    if (latest.includes('bottle') || latest.includes('flask')) {
      return {
        reply: `Water bottles and flasks are frequently misplaced in lecture halls (CC1–CC4) and library cubicles. Custodial staff deposit them in the **CC3 Lost & Found racks** at the end of each shift.\n\nCould you tell me the **color, brand, and any stickers or scratch marks** on your bottle?`,
        modelUsed,
      };
    }

    if (latest.includes('umbrella')) {
      return {
        reply: `Umbrellas left on rainy days are usually collected by building custodians at entrance umbrella stands. \n\nPlease share the **color, handle style, and building** you were in, and consider posting a "Lost" report via the **"Add Item"** button so anyone who spots it can notify you immediately!`,
        modelUsed,
      };
    }

    return {
      reply: `Hi${nameGreeting}! I am Chiroz, your Campus Lost & Found Assistant.\n\nI can help you search our live campus inventory, tell you where items are deposited, and guide you through claiming your property.\n\nCould you describe **what item you lost, approximately when, and which campus building or room** you were in?`,
      modelUsed,
    };
  }
}

export const geminiChatService = new GeminiChatService();
