export interface PortalItem {
  id: string;
  title: string;
  category: 'bottle' | 'umbrella' | 'headphones' | 'glasses' | 'id_card' | 'keys' | 'phone' | 'cable';
  location: string;
  type: 'found' | 'lost';
  imageUrl: string;
  date: string;
  description: string;
  hidden_identifier: string;
  match_confidence?: number;
  matched_id?: string;
  status: 'active' | 'verified' | 'claimed';
  verification_challenge?: string;
  reporterName?: string;
  reporterContact?: string;
}

// Default items are completely cleared; only real user posts are stored and displayed
export const INITIAL_PORTAL_ITEMS: PortalItem[] = [];

// Aesthetic fallback images for categories if user doesn't upload a photo
export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  bottle: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
  umbrella: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  glasses: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=500&q=80',
  id_card: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
  keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&q=80',
  phone: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&q=80',
  cable: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80',
};

