import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  BottleWine,
  Umbrella,
  Headphones,
  Glasses,
  IdCard,
  KeyRound,
  Smartphone,
  Cable,
  MapPin,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  Check,
  Tag,
  Radio,
  Trash2,
  Upload,
  Camera,
  Image as ImageIcon,
  FileImage,
  Maximize2,
  Share2,
  AlertCircle,
  User,
  Moon,
  Sun,
  Bot
} from 'lucide-react';
import { PortalItem, INITIAL_PORTAL_ITEMS, CATEGORY_DEFAULT_IMAGES } from './data/portalItems';
import { AIAnalysisService } from './services/aiAnalysisService';
import { AIPairAnalysis } from './types/aiAnalysis';
import { UserProfileModal, UserProfileData } from './components/UserProfileModal';
import { LogoCustomizerModal, LogoPreset, renderPresetLogoSvg } from './components/LogoCustomizerModal';
import { playClickClackFeedback } from './utils/audioFeedback';
import { triggerHapticFeedback } from './utils/haptics';
import { StudentChatBot } from './components/StudentChatBot';
import { ItemImageWithFallback } from './components/ItemImageWithFallback';

// Helper to resize and compress photos client-side for smooth uploads
function processAndResizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = 1280;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        } else {
          resolve(typeof e.target?.result === 'string' ? e.target.result : '');
        }
      };
      img.src = typeof e.target?.result === 'string' ? e.target.result : '';
    };
    reader.readAsDataURL(file);
  });
}

type CategoryType = 'bottle' | 'umbrella' | 'headphones' | 'glasses' | 'id_card' | 'keys' | 'phone' | 'cable';

interface CategoryItem {
  id: CategoryType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'bottle', name: 'Water Bottle', icon: BottleWine },
  { id: 'umbrella', name: 'Umbrella', icon: Umbrella },
  { id: 'headphones', name: 'Headphones', icon: Headphones },
  { id: 'glasses', name: 'Eyeglasses', icon: Glasses },
  { id: 'id_card', name: 'ID Card', icon: IdCard },
  { id: 'keys', name: 'Keys', icon: KeyRound },
  { id: 'phone', name: 'Smartphone', icon: Smartphone },
  { id: 'cable', name: 'Cables', icon: Cable },
];

export default function App() {
  const [items, setItems] = useState<PortalItem[]>(INITIAL_PORTAL_ITEMS);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('app_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('app_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [notification, setNotification] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'found' | 'lost'>('all');
  const [sortAscending, setSortAscending] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<PortalItem | null>(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  // User Profile State (including Roll No, Year/Std, Div, Faculty, Photo)
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    return {
      name: localStorage.getItem('campus_user_name') || '',
      email: localStorage.getItem('campus_user_email') || '',
      rollNo: localStorage.getItem('campus_user_roll_no') || '',
      faculty: localStorage.getItem('campus_user_faculty') || '',
      year: localStorage.getItem('campus_user_year') || '',
      division: localStorage.getItem('campus_user_div') || '',
      photoUrl: localStorage.getItem('campus_user_photo') || '',
    };
  });
  const userName = userProfile.name;
  const userEmail = userProfile.email;
  // Campus Logo Customization State (Preset or custom image upload)
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(() => {
    return localStorage.getItem('campus_custom_logo') || '';
  });
  const [selectedLogoPreset, setSelectedLogoPreset] = useState<LogoPreset>(() => {
    return (localStorage.getItem('campus_logo_preset') as LogoPreset) || 'shield';
  });
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleUpdateLogo = (newUrl: string, preset: LogoPreset) => {
    setCustomLogoUrl(newUrl);
    setSelectedLogoPreset(preset);
    if (newUrl) {
      localStorage.setItem('campus_custom_logo', newUrl);
    } else {
      localStorage.removeItem('campus_custom_logo');
    }
    localStorage.setItem('campus_logo_preset', preset);
    showToast('Campus logo updated successfully!');
  };

  const [userPostedItemIds, setUserPostedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('campus_user_posted_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [userClaimedItemIds, setUserClaimedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('campus_user_claimed_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New Item Form State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<'lost' | 'found'>('lost');
  const [newItemCategory, setNewItemCategory] = useState<CategoryType>('bottle');
  const [newItemLocation, setNewItemLocation] = useState('CC3');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemHiddenId, setNewItemHiddenId] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [uploadedImageMeta, setUploadedImageMeta] = useState<{ name: string; size: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAIAnalysis, setActiveAIAnalysis] = useState<AIPairAnalysis | null>(null);
  const [batchResults, setBatchResults] = useState<AIPairAnalysis[]>([]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  }, []);

  // Fetch real-time items from backend
  const fetchPortalItems = useCallback(async (background = false) => {
    if (!background) setIsLoading(true);
    else setIsSyncing(true);
    try {
      const res = await fetch('/api/portal-items');
      if (res.ok) {
        const data: PortalItem[] = await res.json();
        setItems(data);
        const now = new Date();
        setLastSyncTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    } catch (err) {
      console.error('Error fetching real-time portal items:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Real-time polling every 5 seconds to reflect posts literally posted by real users
  useEffect(() => {
    fetchPortalItems(false);
    const interval = setInterval(() => {
      fetchPortalItems(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchPortalItems]);

  // Open item detail modal automatically if ?item=ID parameter is present in URL
  useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      const params = new URLSearchParams(window.location.search);
      const targetItemId = params.get('item');
      if (targetItemId) {
        const found = items.find((it) => it.id === targetItemId);
        if (found) {
          setSelectedItem(found);
        }
      }
    }
  }, [items, selectedItem]);

  // Sync selectedItem with browser URL query parameter
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedItem) {
      url.searchParams.set('item', selectedItem.id);
    } else {
      url.searchParams.delete('item');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedItem]);

  // Keyboard shortcut: Press 'P' to focus and open student profile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing into any input, textarea, select, or editable element
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInput) return;

      // Ignore if modifier keys (Cmd, Ctrl, Alt) are pressed (e.g. browser Print shortcut Cmd+P)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'p' || e.key === 'P') {
        const profileBtn = document.getElementById('btn-user-profile-header');
        if (profileBtn) {
          e.preventDefault();
          profileBtn.focus();
          profileBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filtered and sorted items
  const displayedItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'all' || item.category === selectedCategory;
        const matchesType =
          typeFilter === 'all' || item.type === typeFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.type.toLowerCase() === q;
        return matchesCategory && matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (sortAscending) {
          return a.title.localeCompare(b.title);
        }
        return b.title.localeCompare(a.title);
      });
  }, [items, selectedCategory, typeFilter, searchQuery, sortAscending]);

  // Counts for tabs
  const foundCount = useMemo(() => items.filter((i) => i.type === 'found').length, [items]);
  const lostCount = useMemo(() => items.filter((i) => i.type === 'lost').length, [items]);

  // User Profile handler
  const handleUpdateProfile = (updated: UserProfileData) => {
    setUserProfile(updated);
    localStorage.setItem('campus_user_name', updated.name);
    localStorage.setItem('campus_user_email', updated.email);
    localStorage.setItem('campus_user_roll_no', updated.rollNo);
    localStorage.setItem('campus_user_faculty', updated.faculty);
    localStorage.setItem('campus_user_year', updated.year);
    localStorage.setItem('campus_user_div', updated.division);
    localStorage.setItem('campus_user_photo', updated.photoUrl || '');
    showToast('Student profile updated successfully!');
  };

  // User's posted items
  const myPostedItems = useMemo(() => {
    return items.filter(
      (item) =>
        userPostedItemIds.includes(item.id) ||
        (userName.trim() &&
          item.reporterName &&
          item.reporterName.toLowerCase() === userName.trim().toLowerCase())
    );
  }, [items, userPostedItemIds, userName]);

  // User's claimed items
  const myClaimedItems = useMemo(() => {
    return items.filter(
      (item) =>
        userClaimedItemIds.includes(item.id) ||
        (userName.trim() &&
          item.status === 'claimed' &&
          item.claimDetails?.claimantName &&
          item.claimDetails.claimantName.toLowerCase() === userName.trim().toLowerCase())
    );
  }, [items, userClaimedItemIds, userName]);

  // Handle Add Item (Real User Post)
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || isSubmittingItem) return;

    setIsSubmittingItem(true);
    const defaultCategoryImg =
      CATEGORY_DEFAULT_IMAGES[newItemCategory] ||
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80';

    const finalImage = newItemImageUrl.trim() || defaultCategoryImg;

    const academicSummary = [
      userProfile.year && `${userProfile.year}`,
      userProfile.division && `Div ${userProfile.division}`,
      userProfile.rollNo && `Roll ${userProfile.rollNo}`,
      userProfile.faculty && `${userProfile.faculty}`,
    ]
      .filter(Boolean)
      .join(' • ');

    const fullContact = [userEmail.trim(), academicSummary]
      .filter(Boolean)
      .join(' | ');

    const payload = {
      title: newItemTitle.trim(),
      category: newItemCategory,
      location: newItemLocation.trim() || 'Campus Center',
      type: newItemType,
      imageUrl: finalImage,
      description: newItemDescription.trim() || 'Item reported by campus user.',
      hidden_identifier:
        newItemHiddenId.trim() || 'CONFIDENTIAL - PHYSICAL VERIFICATION REQUIRED',
      verification_challenge: 'State distinctive markings, numbers, or interior items.',
      reporterName: userName.trim() || 'Anonymous',
      reporterContact: fullContact || userEmail.trim(),
    };

    try {
      const res = await fetch('/api/portal-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const createdItem: PortalItem = await res.json();
        setItems((prev) => [createdItem, ...prev]);
        setUserPostedItemIds((prev) => {
          const next = [createdItem.id, ...prev.filter((id) => id !== createdItem.id)];
          localStorage.setItem('campus_user_posted_ids', JSON.stringify(next));
          return next;
        });
        setIsAddModalOpen(false);

        // Reset inputs
        setNewItemTitle('');
        setNewItemDescription('');
        setNewItemHiddenId('');
        setNewItemImageUrl('');
        setUploadedImageMeta(null);
        setImageUploadMode('upload');
        showToast(`Your ${newItemType.toUpperCase()} post "${payload.title}" is now published live!`);

        // Trigger sync
        fetchPortalItems(true);
      } else {
        showToast('Failed to publish item to ledger.');
      }
    } catch (err) {
      console.error('Error posting item:', err);
      showToast('Error connecting to ledger server.');
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Handle Real-time Deletion
  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this post from the real-time live feed?')) return;

    try {
      const res = await fetch(`/api/portal-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setUserPostedItemIds((prev) => {
          const next = prev.filter((itId) => itId !== id);
          localStorage.setItem('campus_user_posted_ids', JSON.stringify(next));
          return next;
        });
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
        showToast('Post removed from ledger.');
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      showToast('Error deleting item.');
    }
  };

  // Process and optimize uploaded image files
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPEG, PNG, WebP).');
      return;
    }
    setIsProcessingImage(true);
    try {
      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      const dataUrl = await processAndResizeImage(file);
      setNewItemImageUrl(dataUrl);
      setUploadedImageMeta({
        name: file.name,
        size: formattedSize,
      });
      setImageUploadMode('upload');
      showToast('Photograph attached successfully!');
    } catch (err) {
      console.error('Failed to process image:', err);
      showToast('Could not process the uploaded photo.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Handle Photo File Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  // Handle Drag and Drop
  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handle Clipboard Paste
  const handlePasteImage = (e: React.ClipboardEvent) => {
    const itemsList = e.clipboardData?.items;
    if (!itemsList) return;
    for (let i = 0; i < itemsList.length; i++) {
      if (itemsList[i].type.indexOf('image') !== -1) {
        const file = itemsList[i].getAsFile();
        if (file) {
          processImageFile(file);
          break;
        }
      }
    }
  };

  // Handle sharing item link via browser Web Share API with clipboard fallback
  const handleShareItem = async (item: PortalItem) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('item', item.id);
      const shareUrl = url.toString();

      const shareData = {
        title: `${item.type === 'lost' ? 'Lost Item' : 'Found Item'}: ${item.title}`,
        text: `Check out this ${item.type === 'lost' ? 'lost' : 'found'} item on the Campus Registry: "${item.title}" at ${item.location}.`,
        url: shareUrl,
      };

      // Use browser Web Share API if supported
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share(shareData);
          showToast('Item shared successfully!');
          return;
        } catch (err: any) {
          // If the user cancelled or dismissed the native share sheet, ignore
          if (err?.name === 'AbortError') {
            return;
          }
          console.warn('Web Share API error, falling back to clipboard copy:', err);
        }
      }

      // Fallback for browsers or desktop contexts without native Web Share API
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link to this item copied to clipboard!');
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Link to this item copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to share item:', err);
      showToast('Could not share item link.');
    }
  };

  // Run on-demand AI comparison when viewing an item with a candidate match
  const handleRunAIComparison = async (targetItem: PortalItem) => {
    const candidate = items.find(
      (it) => it.id !== targetItem.id && it.category === targetItem.category && it.type !== targetItem.type
    );
    if (!candidate) return;

    const lostItem = targetItem.type === 'lost' ? targetItem : candidate;
    const foundItem = targetItem.type === 'found' ? targetItem : candidate;

    setIsAnalyzing(true);
    try {
      const analysis = await AIAnalysisService.comparePair(
        {
          id: lostItem.id,
          category: lostItem.category,
          location: lostItem.location,
          description: lostItem.description,
          hidden_identifier: lostItem.hidden_identifier,
        },
        {
          id: foundItem.id,
          category: foundItem.category,
          location: foundItem.location,
          description: foundItem.description,
          hidden_identifier: foundItem.hidden_identifier,
        }
      );

      if (analysis) {
        setActiveAIAnalysis(analysis);
      }
    } catch (err) {
      console.error('Failed to run AI comparison:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Batch AI Cross-Examination
  const handleRunBatchAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await AIAnalysisService.runBatchAnalysis();
      if (res.success && res.matches) {
        setBatchResults(res.matches);
      }
    } catch (err) {
      console.error('Batch analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Verify / Claim submission
  const handleVerifyClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAnswer.trim() || !selectedItem) return;

    const academicSummary = [
      userProfile.year && `${userProfile.year}`,
      userProfile.division && `Div ${userProfile.division}`,
      userProfile.rollNo && `Roll ${userProfile.rollNo}`,
      userProfile.faculty && `${userProfile.faculty}`,
    ]
      .filter(Boolean)
      .join(' • ');

    const fullContact = [userEmail.trim(), academicSummary]
      .filter(Boolean)
      .join(' | ');

    try {
      const res = await fetch(`/api/portal-items/${selectedItem.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: claimAnswer.trim(),
          claimantName: userName.trim() || 'Anonymous',
          claimantContact: fullContact || userEmail.trim(),
        }),
      });
      if (res.ok) {
        setClaimStatus('success');
        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id
              ? {
                  ...i,
                  status: 'claimed',
                  claimDetails: {
                    answer: claimAnswer.trim(),
                    claimantName: userName.trim() || 'Anonymous',
                    claimantContact: fullContact || userEmail.trim(),
                    claimedAt: new Date().toISOString(),
                  },
                }
              : i
          )
        );
        setUserClaimedItemIds((prev) => {
          const next = prev.includes(selectedItem.id) ? prev : [selectedItem.id, ...prev];
          localStorage.setItem('campus_user_claimed_ids', JSON.stringify(next));
          return next;
        });
        showToast('Claim submitted! Campus Security will verify your response.');
      } else {
        setClaimStatus('failed');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setClaimStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-250">
      {/* Real-Time Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-neutral-950 dark:bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-800 dark:border-neutral-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0 stroke-[2.5]" />
          <span className="text-xs font-semibold">{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-white/80 hover:text-white ml-auto p-1"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}
      
      {/* ======================================================== */}
      {/* RESPONSIVE FULL-WIDTH DESKTOP & MOBILE HEADER */}
      {/* ======================================================== */}
      <header className="bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800/90 sticky top-0 z-30 shadow-2xs transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
            <button
              type="button"
              id="btn-campus-logo-header"
              onClick={() => setIsLogoModalOpen(true)}
              onMouseEnter={playClickClackFeedback}
              className="group relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black shrink-0 border border-neutral-300/90 dark:border-neutral-700/90 cursor-pointer overflow-hidden transform-gpu hover:border-black dark:hover:border-white transition-all duration-200 shadow-2xs"
              title="Click to customize campus logo or upload school emblem"
              aria-label="Campus Logo - Click to customize"
            >
              {customLogoUrl ? (
                <img
                  src={customLogoUrl}
                  alt="Campus Logo"
                  className="w-full h-full object-contain p-1 sm:p-1.5 transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                  {renderPresetLogoSvg(selectedLogoPreset, 'w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-black stroke-[2.2]')}
                </div>
              )}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-lg font-black tracking-tight text-neutral-900 dark:text-neutral-50 truncate">
                  CAMPUS LOST & FOUND
                </h1>
              </div>
              <p className="hidden sm:block text-xs text-neutral-600 dark:text-neutral-400 font-semibold truncate">
                Institutional Property Recovery & AI Forensic Verification
              </p>
            </div>
          </div>

          {/* Center: Desktop Search Bar (Styled with refined hairline borders & subtle hover/focus) */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items list (name, CC3, category, description)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-100/70 hover:bg-white focus:bg-white dark:bg-[#121215] dark:hover:bg-[#16161a] dark:focus:bg-[#16161a] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 focus:border-neutral-950 dark:focus:border-neutral-200 rounded-xl py-2.5 pl-4 pr-11 text-sm focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all duration-200 shadow-2xs font-semibold"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-700 dark:text-neutral-300">
                <Search className="w-5 h-5 stroke-[2.5]" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live Real-Time Feed Indicator */}
            <button
              onClick={() => fetchPortalItems(true)}
              title={`Click to refresh live feed (Last updated: ${lastSyncTime})`}
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100/80 hover:bg-neutral-200/70 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 px-3 py-2 rounded-xl transition-all duration-200 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Live: {lastSyncTime}</span>
            </button>

            {/* Dark Mode Theme Toggle */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-100/90 hover:bg-neutral-200/90 dark:bg-neutral-900/90 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-200 rotate-0 hover:rotate-12 stroke-[2.2]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-black transition-transform duration-200 hover:-rotate-12 stroke-[2.2]" />
              )}
            </button>

            {/* Student Gemini Chatbot Header Button */}
            <button
              id="btn-gemini-chat-header"
              type="button"
              onClick={() => setIsChatOpen(true)}
              aria-label="Open Chiroz AI Agent Chatbot"
              title="Chat with Chiroz (Gemini AI Agent for Lost & Found)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-neutral-100/90 hover:bg-neutral-200/90 dark:bg-neutral-900/90 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-extrabold text-xs sm:text-sm border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs shrink-0"
            >
              <Bot className="w-4 h-4 text-black dark:text-white" />
              <span className="hidden md:inline">Chiroz AI Agent</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Primary Desktop + Add Item Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 active:scale-95 text-white dark:text-neutral-950 font-black text-xs sm:text-sm py-2 sm:py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 border border-neutral-900 dark:border-white transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3] text-white dark:text-neutral-950" />
              <span>Add Item</span>
            </button>

            {/* User Profile Button */}
            <button
              id="btn-user-profile-header"
              onClick={() => setIsProfileModalOpen(true)}
              className="relative group flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-100/90 hover:bg-neutral-200/90 dark:bg-neutral-900/90 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold text-xs sm:text-sm border border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all duration-200 ease-out hover:shadow-xs cursor-pointer active:scale-95 shrink-0"
              aria-label={userName ? `Student: ${userName} (Press P)` : 'Student Profile (Press P)'}
              title={userName ? `Student: ${userName} (Press P)` : 'Student Profile (Press P)'}
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs shadow-xs shrink-0 overflow-hidden border border-neutral-300 dark:border-neutral-700 group-hover:scale-105 transition-transform duration-200">
                {userProfile.photoUrl ? (
                  <img
                    src={userProfile.photoUrl}
                    alt={userName || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : userName ? (
                  userName.charAt(0).toUpperCase()
                ) : (
                  <User className="w-3.5 h-3.5 text-white dark:text-black" />
                )}
              </div>
              <span className="hidden sm:inline font-extrabold text-black dark:text-white max-w-[110px] truncate text-xs sm:text-sm">
                {userName || 'Profile'}
              </span>
              {userProfile.year && (
                <span className="hidden md:inline text-[10px] bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded-md font-black">
                  {userProfile.year}
                </span>
              )}

              {/* Hover Tooltip (Smooth Transition Directly Below Profile Button) */}
              <div
                role="tooltip"
                className="pointer-events-none absolute top-full right-0 mt-2 py-2 px-3 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/10 dark:shadow-black/60 opacity-0 invisible -translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out z-50 whitespace-nowrap min-w-[130px] text-left"
              >
                {/* Micro Arrow Pointer */}
                <div className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 bg-white dark:bg-neutral-900 border-t border-l border-neutral-200 dark:border-neutral-800"></div>

                <div className="relative flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white shrink-0"></span>
                      <span className="text-xs font-black text-neutral-900 dark:text-neutral-100 leading-tight">
                        {userName || 'Guest User'}
                      </span>
                    </div>
                    <kbd className="text-[9px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
                      P
                    </kbd>
                  </div>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-semibold pl-3 leading-tight">
                    {userProfile.year
                      ? `${userProfile.year} Student • ${userProfile.faculty || 'Campus Member'}`
                      : userProfile.faculty
                      ? `Student • ${userProfile.faculty}`
                      : 'Student • Campus Member'}
                  </span>
                  {userProfile.rollNo && (
                    <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 pl-3 leading-tight">
                      Roll No: {userProfile.rollNo}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN DESKTOP / PC CONTENT CONTAINER */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-8 space-y-5 sm:space-y-8">
        
        {/* Mobile-only Search Bar */}
        <div className="md:hidden">
          <div className="relative">
            <input
              id="mobile-search-input"
              type="search"
              placeholder="Search items list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#121215] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 focus:border-neutral-950 dark:focus:border-neutral-200 rounded-xl py-3 pl-4 pr-11 text-base sm:text-sm focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 transition-all duration-200 shadow-2xs font-semibold"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-700 dark:text-neutral-300">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CATEGORIES SECTION (Responsive: 4 cols mobile, 8 cols desktop) */}
        {/* ======================================================== */}
        <section className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs transition-colors duration-250">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-neutral-900 dark:text-neutral-50 font-black text-lg sm:text-xl tracking-tight">Categories</h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold hidden sm:inline">
                • Select to filter posts
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs sm:text-sm font-bold transition-all px-3 py-1.5 rounded-lg border cursor-pointer active:scale-95 ${
                selectedCategory === 'all'
                  ? 'text-white bg-neutral-950 dark:text-neutral-950 dark:bg-white border-neutral-950 dark:border-white shadow-2xs'
                  : 'text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 shadow-2xs'
              }`}
            >
              View All ({items.length})
            </button>
          </div>

          {/* 8 Category Tiles Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-4">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const Icon = cat.icon;
              const count = items.filter((i) => i.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)
                  }
                  title={`${cat.name} (${count})`}
                  className={`group relative rounded-2xl aspect-square p-2.5 sm:p-3 flex flex-col items-center justify-center transition-all duration-200 ease-out cursor-pointer active:scale-95 border ${
                    isSelected
                      ? 'border-neutral-950 dark:border-white bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md ring-1 ring-neutral-950/20 dark:ring-white/30 -translate-y-1'
                      : 'bg-neutral-50/80 dark:bg-neutral-900/60 border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-950 dark:hover:border-neutral-400 hover:bg-white dark:hover:bg-neutral-850 hover:shadow-md dark:hover:shadow-neutral-950/60 hover:-translate-y-1 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <Icon className={`w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2] transition-transform duration-200 group-hover:scale-110 ${
                    isSelected ? 'text-white dark:text-neutral-950' : 'text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white'
                  }`} />
                  <span className={`text-[11px] sm:text-xs font-bold mt-1.5 text-center leading-tight truncate w-full px-1 ${
                    isSelected ? 'text-white dark:text-neutral-950' : 'text-neutral-800 dark:text-neutral-200'
                  }`}>
                    {cat.name}
                  </span>
                  {count > 0 && (
                    <span className={`hidden sm:inline-block text-[10px] font-mono font-bold ${
                      isSelected ? 'text-white/80 dark:text-black/80' : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Filter Indicator Tag */}
          {selectedCategory !== 'all' && (
            <div className="mt-4 flex items-center justify-between bg-neutral-100/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 rounded-xl shadow-2xs">
              <span className="text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
                Showing category: <strong className="capitalize">{selectedCategory.replace('_', ' ')}</strong>
                <span className="text-neutral-600 dark:text-neutral-400 font-semibold">({displayedItems.length} found)</span>
              </span>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 font-bold hover:underline transition-colors"
              >
                <X className="w-3.5 h-3.5 text-current" /> Clear filter
              </button>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* LATEST POSTS FEED HEADER & CONTROLS */}
        {/* ======================================================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] rounded-2xl p-4 sm:px-6 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs transition-colors duration-250">
            
            {/* Title & Count */}
            <div className="flex items-center gap-3">
              <h2 className="text-neutral-900 dark:text-neutral-50 font-black text-lg sm:text-xl tracking-tight">Latest Posts</h2>
              <span className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-black px-2.5 py-1 rounded-full shadow-2xs">
                {displayedItems.length} items
              </span>
            </div>

            {/* Controls: Type Tabs & Sort */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Type Filter Tabs */}
              <div className="flex items-center bg-neutral-100/90 dark:bg-neutral-900/90 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold shadow-2xs">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-black'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  onClick={() => setTypeFilter('found')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                    typeFilter === 'found'
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-black'
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  Found ({foundCount})
                </button>
                <button
                  onClick={() => setTypeFilter('lost')}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1 cursor-pointer ${
                    typeFilter === 'lost'
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-black'
                      : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  Lost ({lostCount})
                </button>
              </div>

              {/* Sort Order Button */}
              <button
                onClick={() => setSortAscending((prev) => !prev)}
                className="bg-neutral-50/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-900 dark:text-neutral-100 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 select-none shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Sort By: Title</span>
                <span className="font-black">{sortAscending ? '▲ A-Z' : '▼ Z-A'}</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* FEED CONTENT: RESPONSIVE GRID OR LIST (FITS FULL PC SCREEN) */}
          {/* ======================================================== */}
          {isLoading && items.length === 0 ? (
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-14 text-center border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
              <RefreshCw className="w-10 h-10 mx-auto mb-3 text-neutral-900 dark:text-neutral-100 animate-spin" />
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100">Connecting to Real-Time Feed...</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mt-1">Retrieving latest community posts from ledger</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-10 sm:p-14 text-center border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm max-w-2xl mx-auto transition-colors duration-250">
              <div className="w-16 h-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Radio className="w-8 h-8 animate-pulse text-white dark:text-black" />
              </div>
              <span className="inline-flex items-center gap-1.5 bg-neutral-100/90 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs font-black px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 mb-3 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-ping"></span>
                Real-Time Ledger Live
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-50">
                No Real-Time Posts Yet
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed font-medium">
                All default mock items have been removed. This board displays <strong>real-time reports</strong> submitted directly by real campus users.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setNewItemType('lost');
                    setIsAddModalOpen(true);
                  }}
                  className="w-full sm:w-auto bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-neutral-950 dark:border-white"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Report a Lost Item</span>
                </button>
                <button
                  onClick={() => {
                    setNewItemType('found');
                    setIsAddModalOpen(true);
                  }}
                  className="w-full sm:w-auto bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-[#121215] dark:text-neutral-100 dark:hover:bg-neutral-800 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-neutral-300 dark:border-neutral-700"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Report a Found Item</span>
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-500 font-semibold mt-4">
                Posts sync instantly across devices and feed directly into the automated custody matrix.
              </p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="bg-white dark:bg-[#121215] rounded-3xl p-12 text-center text-neutral-800 dark:text-neutral-300 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
              <Search className="w-12 h-12 mx-auto mb-3 text-neutral-900 dark:text-neutral-100 stroke-[2.2]" />
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100">No items match your search</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-sm mx-auto font-medium">
                Try searching for a different keyword or resetting your category and status filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="mt-4 inline-flex items-center gap-1.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* DESKTOP RESPONSIVE GRID VIEW (1 col mobile, 2 col tablet, 3-4 col desktop) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedItems.map((item) => (
                <div
                  key={item.id}
                  id={`item-card-${item.id}`}
                  onClick={() => {
                    setSelectedItem(item);
                    setActiveAIAnalysis(null);
                    setShowClaimForm(false);
                    setClaimStatus('idle');
                    setClaimAnswer('');
                  }}
                  className="item-card group bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:shadow-xl dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col overflow-hidden cursor-pointer active:scale-[0.99]"
                >
                  {/* Card Image Banner */}
                  <div className="relative w-full h-48 sm:h-52 bg-neutral-100 dark:bg-neutral-900 overflow-hidden border-b border-neutral-200/90 dark:border-neutral-800/90">
                    <ItemImageWithFallback
                      src={item.imageUrl}
                      alt={item.title}
                      category={item.category}
                      itemType={item.type}
                      variant="grid"
                      imgClassName="group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      {item.type === 'found' ? (
                        <span className="inline-block bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-neutral-900 dark:border-white">
                          Found
                        </span>
                      ) : (
                        <span className="inline-block bg-neutral-100/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-white text-xs font-black px-3 py-1 rounded-full shadow-sm border border-neutral-300 dark:border-neutral-700">
                          Lost
                        </span>
                      )}
                    </div>
                    {/* Date Tag */}
                    <div className="absolute top-3 right-3 bg-neutral-950/90 backdrop-blur-xs text-white dark:bg-white/95 dark:text-neutral-950 text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs border border-white/20 dark:border-black/10">
                      {item.date}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Category & AI badge */}
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="capitalize text-neutral-600 dark:text-neutral-400 font-extrabold tracking-wide">
                          {item.category.replace('_', ' ')}
                        </span>
                        {item.match_confidence && item.match_confidence >= 80 && (
                          <span className="text-[11px] font-black text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                            <Sparkles className="w-3 h-3 text-neutral-900 dark:text-white" />
                            {item.match_confidence}% Match
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-50 group-hover:text-black dark:group-hover:text-white transition line-clamp-1 leading-snug">
                        {item.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-bold mt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 mr-1 shrink-0 stroke-[2.2]" />
                        <span className="truncate">{item.location}</span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Card Action Link & Delete Option */}
                    <div className="pt-3 border-t border-neutral-200/90 dark:border-neutral-800/90 flex items-center justify-between text-xs font-black text-neutral-900 dark:text-neutral-100">
                      <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                        <span>Inspect Details</span>
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        title="Delete this post from the real-time board"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-200 dark:hover:border-red-900/50 border border-transparent transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DESKTOP / MOBILE EXPANSIVE LIST VIEW */
            <div className="bg-white dark:bg-[#121215] rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs divide-y divide-neutral-200/80 dark:divide-neutral-800/80 overflow-hidden">
              {displayedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setActiveAIAnalysis(null);
                    setShowClaimForm(false);
                    setClaimStatus('idle');
                    setClaimAnswer('');
                  }}
                  className="group flex items-center justify-between p-3.5 sm:p-5 hover:bg-neutral-50/90 dark:hover:bg-neutral-900/60 transition-colors duration-150 cursor-pointer"
                >
                  {/* Left: Thumbnail Image */}
                  <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-800 group-hover:border-neutral-400 dark:group-hover:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 shadow-2xs transition-colors">
                    <ItemImageWithFallback
                      src={item.imageUrl}
                      alt={item.title}
                      category={item.category}
                      itemType={item.type}
                      variant="list"
                      imgClassName="group-hover:scale-105"
                    />
                  </div>

                  {/* Center: Details */}
                  <div className="flex-1 ml-4 mr-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-50 truncate group-hover:text-black dark:group-hover:text-white transition">
                        {item.title}
                      </h3>
                      {item.type === 'found' ? (
                        <span className="hidden sm:inline-block bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-[11px] font-black px-2.5 py-0.5 rounded-full leading-none border border-neutral-950 dark:border-white shadow-2xs">
                          Found
                        </span>
                      ) : (
                        <span className="hidden sm:inline-block bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white text-[11px] font-black px-2.5 py-0.5 rounded-full leading-none border border-neutral-300 dark:border-neutral-700 shadow-2xs">
                          Lost
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs sm:text-sm font-bold mt-1">
                      <span className="flex items-center gap-1 text-neutral-900 dark:text-neutral-100">
                        <MapPin className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 shrink-0 stroke-[2.2]" />
                        <strong>{item.location}</strong>
                      </span>
                      <span className="hidden sm:inline text-neutral-400 dark:text-neutral-600">•</span>
                      <span className="hidden sm:inline text-neutral-600 dark:text-neutral-400 capitalize font-bold">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="hidden sm:inline text-neutral-400 dark:text-neutral-600">•</span>
                      <span className="hidden sm:inline text-neutral-500 dark:text-neutral-500 font-semibold">
                        {item.date}
                      </span>
                    </div>

                    <p className="hidden md:block text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-1.5 line-clamp-1">
                      {item.description}
                    </p>

                    <div className="sm:hidden mt-1.5 flex items-center gap-2">
                      {item.type === 'found' ? (
                        <span className="inline-block bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-[11px] font-black px-2 py-0.5 rounded leading-none border border-neutral-950 dark:border-white">
                          Found
                        </span>
                      ) : (
                        <span className="inline-block bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white text-[11px] font-black px-2 py-0.5 rounded leading-none border border-neutral-300 dark:border-neutral-700">
                          Lost
                        </span>
                      )}
                      {item.match_confidence && item.match_confidence >= 80 && (
                        <span className="text-[10px] font-black text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-neutral-200 dark:border-neutral-800">
                          <Sparkles className="w-2.5 h-2.5 text-neutral-900 dark:text-white" />
                          {item.match_confidence}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Action & Delete */}
                  <div className="shrink-0 flex items-center gap-3 text-neutral-900 dark:text-neutral-100 transition">
                    <span className="hidden md:inline-block text-xs font-black">
                      Inspect
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="Delete post"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-200 dark:hover:border-red-900/50 border border-transparent transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-neutral-900 dark:text-neutral-100 stroke-[2.5] group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* ======================================================== */}
      {/* MOBILE FLOATING ACTION BUTTON */}
      {/* ======================================================== */}
      <div className="sm:hidden fixed bottom-4 left-0 right-0 px-4 pointer-events-none z-20">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="pointer-events-auto w-full bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 active:scale-[0.99] text-white dark:text-black font-black py-3.5 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-2 text-base transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[3] text-white dark:text-black" />
          <span>Add Item</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ITEM DETAIL MODAL (DESKTOP OPTIMIZED 2-COLUMN LAYOUT) */}
      {/* ======================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 border border-neutral-200/90 dark:border-neutral-800/90 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
            {/* Mobile Sheet Drag Handle */}
            <div className="sm:hidden mobile-drag-handle bg-neutral-400 dark:bg-neutral-600 shrink-0" />
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {selectedItem.type === 'found' ? (
                  <span className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-black px-3 py-1 rounded-full border border-neutral-950 dark:border-white shadow-2xs">
                    Found Item
                  </span>
                ) : (
                  <span className="bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white text-xs font-black px-3 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-2xs">
                    Lost Declaration
                  </span>
                )}
                <span className="text-xs text-neutral-900 dark:text-neutral-100 font-mono font-black">#{selectedItem.id}</span>
                <span className="hidden sm:inline text-xs text-neutral-700 dark:text-neutral-300 capitalize font-bold">
                  • {selectedItem.category.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-share-item-header"
                  type="button"
                  onClick={() => handleShareItem(selectedItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition active:scale-95 cursor-pointer shadow-2xs"
                  title="Share item link via Web Share API"
                >
                  <Share2 className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                  <span>Share</span>
                </button>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-9 h-9 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 transition cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Columns on Desktop */}
            <div className="p-5 sm:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Big Image & Metadata */}
              <div className="md:col-span-5 space-y-4">
                <div
                  onClick={() => selectedItem.imageUrl && setEnlargedImageUrl(selectedItem.imageUrl)}
                  className="relative group w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-inner cursor-zoom-in"
                  title="Photographic Record / Category Silhouette"
                >
                  <ItemImageWithFallback
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    category={selectedItem.category}
                    itemType={selectedItem.type}
                    variant="modal"
                    imgClassName="group-hover:scale-105"
                  />
                  {selectedItem.imageUrl && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center pointer-events-none">
                      <span className="opacity-0 group-hover:opacity-100 transition bg-black text-white text-xs font-black px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Click to Enlarge</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400 font-bold">Logged Location:</span>
                    <span className="font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                      {selectedItem.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400 font-bold">Recorded Date:</span>
                    <span className="font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                      {selectedItem.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400 font-bold">Status:</span>
                    <span className="font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Description, AI Forensic Card, Claim Form */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-50 leading-tight">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-semibold">
                    Public registry record • Location CC3 Institutional Campus
                  </p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 shadow-2xs">
                  <h4 className="text-xs font-black uppercase text-neutral-900 dark:text-neutral-100 mb-1.5 tracking-wider">
                    Public Description
                  </h4>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Forensic Cross-Check Card */}
                <div className="border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-neutral-900 dark:text-neutral-100">
                      <Sparkles className="w-4 h-4 text-current stroke-[2.2]" />
                      <span>Forensic Cross-Check Analysis</span>
                    </div>
                    {selectedItem.match_confidence ? (
                      <span className="text-xs font-black text-neutral-900 dark:text-neutral-100 bg-white dark:bg-black px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                        {selectedItem.match_confidence}% Match
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRunAIComparison(selectedItem)}
                        disabled={isAnalyzing}
                        className="text-xs font-black text-neutral-900 dark:text-neutral-100 underline hover:no-underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isAnalyzing ? 'animate-spin' : ''}`} />
                        <span>{isAnalyzing ? 'Analyzing...' : 'Run Cross-Check'}</span>
                      </button>
                    )}
                  </div>

                  {activeAIAnalysis ? (
                    <div className="space-y-2.5 text-xs text-neutral-900 dark:text-neutral-200 bg-white dark:bg-black p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                      <p>
                        <strong>AI Verdict:</strong>{' '}
                        <span className="text-neutral-900 dark:text-neutral-100 font-black uppercase">
                          {activeAIAnalysis.verdict.replace(/_/g, ' ')}
                        </span>{' '}
                        ({activeAIAnalysis.match_confidence}% confidence)
                      </p>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                        {activeAIAnalysis.rationale}
                      </p>
                      {activeAIAnalysis.recommended_interrogation_challenge && (
                        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          <p className="font-bold text-neutral-900 dark:text-neutral-100">
                            Recommended Challenge Question:
                          </p>
                          <p className="italic text-neutral-700 dark:text-neutral-300 font-medium">
                            "{activeAIAnalysis.recommended_interrogation_challenge}"
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                      AI automated cross-matching evaluates concealed inscriptions, brand models, and
                      hidden tokens without revealing sensitive identity markers to unauthorized parties.
                    </p>
                  )}
                </div>

                {/* Claim / Interrogation Challenge Form */}
                {selectedItem.type === 'found' && (
                  <div className="border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 sm:p-5 bg-white dark:bg-neutral-900 shadow-2xs">
                    {!showClaimForm ? (
                      <button
                        onClick={() => setShowClaimForm(true)}
                        className="w-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-black py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-neutral-950 dark:border-white"
                      >
                        <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                        <span>Claim & Prove Ownership</span>
                      </button>
                    ) : (
                      <form onSubmit={handleVerifyClaim} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                            Ownership Challenge
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowClaimForm(false)}
                            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs leading-relaxed font-semibold">
                          <strong>Challenge:</strong>{' '}
                          {selectedItem.verification_challenge ||
                            'State the secret engraving or specific items inside this object.'}
                        </div>
                        <input
                          type="text"
                          required
                          value={claimAnswer}
                          onChange={(e) => setClaimAnswer(e.target.value)}
                          placeholder="Type your confidential proof..."
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-xl focus:outline-none focus:border-neutral-950 dark:focus:border-neutral-100 focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition"
                        />
                        <button
                          type="submit"
                          className="w-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm transition cursor-pointer border border-neutral-950 dark:border-white shadow-xs"
                        >
                          Submit Proof for Custody Verification
                        </button>
                        {claimStatus === 'success' && (
                          <div className="p-3 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-xl text-xs flex items-center gap-2 font-bold border border-neutral-200 dark:border-neutral-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.2]" />
                            <span>
                              Claim submitted! Campus Security will verify your response against physical custody records.
                            </span>
                          </div>
                        )}
                      </form>
                    )}
                  </div>
                )}

                {/* Ledger Controls & Share Action */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 text-xs font-bold">
                  <button
                    type="button"
                    id="btn-share-item-footer"
                    onClick={() => handleShareItem(selectedItem)}
                    className="text-black hover:text-neutral-700 dark:text-white dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    title="Share item link via Web Share API"
                  >
                    <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Share Item Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Real-Time Post</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD ITEM MODAL (DESKTOP 2-COLUMN INPUT FORM) */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 border border-neutral-200/90 dark:border-neutral-800/90 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
            {/* Mobile Sheet Drag Handle */}
            <div className="sm:hidden mobile-drag-handle bg-neutral-400 dark:bg-neutral-600 shrink-0" />
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-50">Report an Item</h3>
                <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-semibold">Publish a real-time Lost declaration or Found recovery to the campus registry</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateItem} onPaste={handlePasteImage} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Type Selection */}
              <div>
                <label className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider block mb-1.5">
                  Declaration Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewItemType('lost')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 border cursor-pointer ${
                      newItemType === 'lost'
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white ring-1 ring-neutral-950/20 dark:ring-white/30 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>I Lost Something</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemType('found')}
                    className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 border cursor-pointer ${
                      newItemType === 'found'
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white ring-1 ring-neutral-950/20 dark:ring-white/30 shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>I Found Something</span>
                  </button>
                </div>
              </div>

              {/* Item Title */}
              <div>
                <label className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider block mb-1.5">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milton Insulated Water Bottle"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition"
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider block mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as CategoryType)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition"
                  >
                    <option value="bottle">Water Bottle</option>
                    <option value="umbrella">Umbrella</option>
                    <option value="headphones">Headphones</option>
                    <option value="glasses">Eyeglasses</option>
                    <option value="id_card">ID Card</option>
                    <option value="keys">Keys</option>
                    <option value="phone">Smartphone</option>
                    <option value="cable">Cable / Charger</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider block mb-1.5">
                    Campus Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CC3, Library, Cafeteria"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition"
                  />
                </div>
              </div>

              {/* Photo / Image Upload Section */}
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800/80 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <label className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-current stroke-[2.2]" />
                      <span>{newItemType === 'lost' ? 'Upload Photograph of Lost Item' : 'Upload Photograph of Found Item'}</span>
                    </label>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold">
                      {newItemType === 'lost'
                        ? 'Attach an actual photo of your lost item (or packaging/prior photo) to prove ownership and aid recovery.'
                        : 'Attach a photo of the item you found so the rightful owner can recognize it.'}
                    </p>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 self-start sm:self-auto shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        imageUploadMode === 'upload'
                          ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs font-black'
                          : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3 stroke-[2.2]" />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('preset')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        imageUploadMode === 'preset'
                          ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs font-black'
                          : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3 stroke-[2.2]" />
                      <span>Default</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        imageUploadMode === 'url'
                          ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs font-black'
                          : 'text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: Upload Photo (Default & Primary) */}
                {imageUploadMode === 'upload' && (
                  <div className="space-y-3">
                    {/* Hidden Native File and Camera Inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {newItemImageUrl ? (
                      /* Preview State of Uploaded Photo */
                      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
                        <div className="relative h-48 sm:h-56 w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center overflow-hidden">
                          <img
                            src={newItemImageUrl}
                            alt="Uploaded preview"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-neutral-950 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-neutral-800">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Photo Attached</span>
                          </div>
                        </div>

                        <div className="p-3 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-neutral-200 dark:border-neutral-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
                              <FileImage className="w-4 h-4 stroke-[2.2]" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-black text-neutral-900 dark:text-neutral-100 truncate">
                                {uploadedImageMeta?.name || 'Custom item photograph'}
                              </p>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold">
                                {uploadedImageMeta?.size || 'Ready for ledger sync'} • Auto-optimized
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-lg text-xs font-black bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 transition cursor-pointer"
                            >
                              Replace Photo
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewItemImageUrl('');
                                setUploadedImageMeta(null);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Empty / Upload Dropzone State */
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(false);
                        }}
                        onDrop={handleDropImage}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition cursor-pointer flex flex-col items-center justify-center group ${
                          isDraggingOver
                            ? 'border-neutral-950 dark:border-white bg-neutral-100 dark:bg-neutral-800 scale-[1.01]'
                            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center mb-3 transition shadow-xs">
                          {isProcessingImage ? (
                            <RefreshCw className="w-6 h-6 animate-spin text-white dark:text-neutral-950" />
                          ) : (
                            <Camera className="w-6 h-6 text-white dark:text-neutral-950 stroke-[2.2]" />
                          )}
                        </div>

                        <p className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                          {isProcessingImage
                            ? 'Optimizing and attaching photograph...'
                            : isDraggingOver
                            ? 'Drop picture here'
                            : 'Click to upload picture of this item'}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mt-1">
                          or drag & drop your photo file here
                        </p>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <Upload className="w-3 h-3 text-current stroke-[2.2]" />
                            <span>Browse Files</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              cameraInputRef.current?.click();
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-black text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2.5 py-1 rounded-lg transition border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                          >
                            <Camera className="w-3 h-3 text-current stroke-[2.2]" />
                            <span>Take Photo</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold mt-3">
                          Supports JPG, PNG, WebP • Paste with Ctrl+V supported
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: Category Default Preset */}
                {imageUploadMode === 'preset' && (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <img
                      src={CATEGORY_DEFAULT_IMAGES[newItemCategory] || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80'}
                      alt="Category preview"
                      className="w-16 h-16 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                    />
                    <div className="text-xs text-neutral-800 dark:text-neutral-200">
                      <p className="font-black text-neutral-900 dark:text-neutral-100 capitalize">
                        Default {newItemCategory.replace('_', ' ')} Stock Photo
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                        Selected automatically from the catalog. You can switch back to "Upload" anytime to attach your own picture.
                      </p>
                    </div>
                  </div>
                )}

                {/* MODE 3: Image URL */}
                {imageUploadMode === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://example.com/photo-of-my-lost-item.jpg"
                      value={newItemImageUrl}
                      onChange={(e) => setNewItemImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition"
                    />
                    {newItemImageUrl && (
                      <div className="h-32 w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <img
                          src={newItemImageUrl}
                          alt="URL preview"
                          className="w-full h-full object-cover"
                          onError={() => showToast('Could not load image preview from URL')}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Public Description */}
              <div>
                <label className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider block mb-1.5">
                  Public Description
                </label>
                <textarea
                  rows={2}
                  placeholder="General visible features (color, brand, visible marks)..."
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full px-4 py-2 text-xs sm:text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition"
                />
              </div>

              {/* Confidential Hidden Identifier (Crucial for AI Matching & Verification) */}
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 shadow-2xs">
                <label className="text-xs font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4 text-current stroke-[2.2]" />
                  <span>Confidential Hidden Ground Truth (Private)</span>
                </label>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold mb-2.5">
                  Never visible to the public. Used exclusively by the automated verification engine to match claims against physical property.
                </p>
                <input
                  type="text"
                  placeholder="e.g. Engraving 'Rohit 24', secret scratch on base, contents inside bottle"
                  value={newItemHiddenId}
                  onChange={(e) => setNewItemHiddenId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus:border-neutral-950 dark:focus:border-neutral-100 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 font-medium transition"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmittingItem}
                className="w-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 active:scale-95 disabled:opacity-50 text-white dark:text-neutral-950 font-black py-3.5 px-4 rounded-xl shadow-xs border border-neutral-950 dark:border-white text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingItem ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-neutral-950" />
                    <span>Publishing to Live Ledger...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 stroke-[3] text-white dark:text-neutral-950" />
                    <span>Publish Real-Time Post</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ADMIN & AI CUSTODY MATRIX MODAL */}
      {/* ======================================================== */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-3xl rounded-3xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-neutral-200/90 dark:border-neutral-800/90 text-neutral-900 dark:text-neutral-100">
            
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-neutral-50">AI Custody & Forensic Matrix</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">Automated Cross-Examination Engine</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              
              {/* Batch Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
                <div>
                  <span className="font-black text-neutral-900 dark:text-neutral-100 text-sm block">Ledger Cross-Examination</span>
                  <span className="text-neutral-600 dark:text-neutral-400 text-xs font-semibold">Run automated matching across all active lost & found items</span>
                </div>
                <button
                  onClick={handleRunBatchAnalysis}
                  disabled={isAnalyzing}
                  className="bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer border border-neutral-950 dark:border-white shadow-xs"
                >
                  <RefreshCw className={`w-4 h-4 stroke-[2.2] ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing Registry...' : 'Run Batch AI Match'}</span>
                </button>
              </div>

              {/* Batch Analysis Output */}
              {batchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs">
                    Identified High-Confidence Matches
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {batchResults.map((match, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-neutral-900 dark:text-neutral-100 text-xs">
                            {match.lostId} ↔ {match.foundId}
                          </span>
                          <span className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-black px-2.5 py-0.5 rounded-full text-xs border border-neutral-950 dark:border-white shadow-2xs">
                            {match.match_confidence}% Match
                          </span>
                        </div>
                        <p className="text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed font-medium">{match.rationale}</p>
                        <div className="text-neutral-600 dark:text-neutral-400 text-xs pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          <strong className="text-neutral-900 dark:text-neutral-100">Verification Challenge:</strong> "{match.recommended_interrogation_challenge}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Confidential Identifiers Ledger */}
              <div>
                <p className="font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-xs mb-3">
                  Confidential Ground Truth Registry
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex items-start justify-between gap-3 text-xs transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-neutral-900 dark:text-neutral-100">{it.title}</span>
                          <span className="font-mono text-neutral-600 dark:text-neutral-400 font-bold">({it.location})</span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                              it.type === 'found' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white' : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700'
                            }`}
                          >
                            {it.type}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300 mt-1 font-semibold">
                          {it.hidden_identifier}
                        </p>
                      </div>
                      {it.match_confidence && (
                        <span className="font-black text-neutral-900 dark:text-neutral-100 shrink-0">
                          {it.match_confidence}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Full-Screen Image Viewer */}
      {enlargedImageUrl && (
        <div
          onClick={() => setEnlargedImageUrl(null)}
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-w-5xl max-h-[92vh] flex flex-col items-center">
            <button
              onClick={() => setEnlargedImageUrl(null)}
              className="absolute -top-12 right-0 text-white bg-black/60 hover:bg-black p-2 rounded-full transition cursor-pointer border border-neutral-700"
              title="Close image view"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
            <img
              src={enlargedImageUrl}
              alt="Enlarged item view"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-neutral-800"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        postedItems={myPostedItems}
        claimedItems={myClaimedItems}
        onSelectItem={(item) => setSelectedItem(item)}
        onOpenReportModal={() => setIsAddModalOpen(true)}
      />

      {/* Campus Logo Customizer Modal */}
      <LogoCustomizerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentCustomLogo={customLogoUrl}
        currentPreset={selectedLogoPreset}
        onSave={handleUpdateLogo}
      />

      {/* Gemini Student Lost & Found Chatbot */}
      <StudentChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpen={() => setIsChatOpen(true)}
        studentName={userName}
        onOpenReportModal={(prefill) => {
          if (prefill?.title) setNewItemTitle(prefill.title);
          if (prefill?.location) setNewItemLocation(prefill.location);
          setIsAddModalOpen(true);
        }}
      />

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (THUMB-OPTIMIZED FOR PHONES) */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-t border-neutral-200/90 dark:border-neutral-800/90 px-3 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors duration-250"
      >
        <div className="grid grid-cols-5 items-center justify-between gap-1 max-w-md mx-auto">
          {/* Feed / Home */}
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center py-1 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[44px]"
            title="Browse Posts"
          >
            <div className="relative">
              <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                  {items.length > 99 ? '99+' : items.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">Feed</span>
          </button>

          {/* Search */}
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              const input = document.getElementById('mobile-search-input');
              if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="flex flex-col items-center justify-center py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[44px]"
            title="Search Items"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">Search</span>
          </button>

          {/* Centerpiece: Add / Report Item Button */}
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('medium');
              setNewItemType('lost');
              setIsAddModalOpen(true);
            }}
            className="flex flex-col items-center justify-center -mt-3.5 transition-all hover:scale-105 active:scale-90 cursor-pointer min-h-[44px]"
            aria-label="Report an Item"
            title="Report Lost or Found Item"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-[#09090b] font-black">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-black mt-0.5 text-neutral-900 dark:text-neutral-100">Report</span>
          </button>

          {/* Chiroz AI Agent */}
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              setIsChatOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[44px]"
            title="Chat with Chiroz AI Agent"
          >
            <div className="relative">
              <Bot className="w-5 h-5 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold mt-1">Chiroz AI</span>
          </button>

          {/* Student Profile */}
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              setIsProfileModalOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 rounded-xl transition-all active:scale-95 cursor-pointer min-h-[44px]"
            title="My Student Profile"
          >
            <div className="w-5 h-5 rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border border-neutral-300 dark:border-neutral-700">
              {userProfile.photoUrl ? (
                <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : userName ? (
                <span className="text-[10px] font-black text-black dark:text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-3.5 h-3.5 text-black dark:text-white" />
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">Profile</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
