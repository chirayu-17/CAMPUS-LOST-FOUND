import React from 'react';
import { 
  Laptop, 
  Wallet, 
  CreditCard, 
  Key, 
  Shirt, 
  BookOpen, 
  HelpCircle, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { Item, ItemCategory } from '../types';
import { ItemImageWithFallback } from './ItemImageWithFallback';

interface ItemCardProps {
  item: Item;
  topMatchScore?: number;
  onViewDetails: (item: Item) => void;
  onInspectMatch?: (item: Item) => void;
  onInitiateClaim?: (item: Item) => void;
}

export const getCategoryIcon = (category: ItemCategory) => {
  switch (category) {
    case 'electronics':
      return <Laptop className="w-4 h-4" />;
    case 'wallets_bags':
      return <Wallet className="w-4 h-4" />;
    case 'ids_cards':
      return <CreditCard className="w-4 h-4" />;
    case 'keys':
      return <Key className="w-4 h-4" />;
    case 'clothing':
      return <Shirt className="w-4 h-4" />;
    case 'books_study':
      return <BookOpen className="w-4 h-4" />;
    case 'personal_items':
    default:
      return <HelpCircle className="w-4 h-4" />;
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  topMatchScore,
  onViewDetails,
  onInspectMatch,
  onInitiateClaim,
}) => {
  const isLost = item.type === 'lost';
  const hasMatch = (topMatchScore && topMatchScore >= 50) || item.status === 'potential_match';

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div
      id={`item-card-${item.id}`}
      className="item-card bg-white dark:bg-[#121215] rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs hover:shadow-xl dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col justify-between overflow-hidden group text-neutral-900 dark:text-neutral-100"
    >
      {/* Top Image Banner with Branded Silhouette Fallback */}
      <div className="relative w-full h-44 bg-neutral-100 dark:bg-neutral-900 overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800/80">
        <ItemImageWithFallback
          src={(item as any).imageUrl || (item as any).photoUrl}
          alt={item.title}
          category={item.category}
          itemType={item.type}
          variant="grid"
          imgClassName="group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        {/* Card Header: Type Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                isLost
                  ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800'
                  : 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
              }`}
            >
              {isLost ? 'Lost Item' : 'Found in Custody'}
            </span>

            <span className="text-[11px] text-neutral-500 dark:text-neutral-500 font-mono font-bold">
              #{item.id}
            </span>
          </div>

          {/* Status Badge */}
          <div>
            {item.status === 'returned' ? (
              <span className="inline-flex items-center text-[11px] font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mr-1 stroke-[2.2]" />
                Returned
              </span>
            ) : item.status === 'claim_pending' ? (
              <span className="inline-flex items-center text-[11px] font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                <Clock className="w-3 h-3 mr-1 stroke-[2.2]" />
                Claim In Review
              </span>
            ) : hasMatch ? (
              <span className="inline-flex items-center text-[11px] font-black text-neutral-900 dark:text-neutral-100 bg-neutral-200/80 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-300 dark:border-neutral-700">
                <Sparkles className="w-3 h-3 mr-1 stroke-[2.2]" />
                {topMatchScore ? `${topMatchScore}% Match` : 'Match Detected'}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800">
                Active Inquiry
              </span>
            )}
          </div>
        </div>

        {/* Title and Category */}
        <div className="mb-2.5">
          <div className="flex items-center space-x-1.5 text-neutral-600 dark:text-neutral-400 text-xs mb-1 font-semibold">
            <span className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
              {getCategoryIcon(item.category)}
            </span>
            <span className="capitalize">{item.category.replace('_', ' & ')}</span>
            {item.brand && (
              <>
                <span>•</span>
                <span className="font-bold text-black dark:text-white">{item.brand}</span>
              </>
            )}
            <span>•</span>
            <span className="inline-flex items-center space-x-1">
              <span 
                className="w-2.5 h-2.5 rounded-full border border-neutral-400 dark:border-neutral-600" 
                style={{ backgroundColor: item.primaryColor.toLowerCase() }} 
              />
              <span className="text-black dark:text-white font-medium">{item.primaryColor}</span>
            </span>
          </div>

          <h3 className="font-black text-black dark:text-white text-base leading-snug group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 mb-3 leading-relaxed font-normal">
          {item.description}
        </p>

        {/* Distinctive features highlight box if exists */}
        {item.distinctiveFeatures && (
          <div className="mb-3.5 px-3 py-2 rounded-xl bg-neutral-100/90 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-900 dark:text-neutral-100 flex items-start space-x-2 shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5 stroke-[2.2]" />
            <span className="line-clamp-1">
              <strong className="font-black text-neutral-900 dark:text-neutral-100">Key Mark:</strong> {item.distinctiveFeatures}
            </span>
          </div>
        )}

        {/* Location & Time details */}
        <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-2.5 border-t border-neutral-200/90 dark:border-neutral-800/90 font-medium">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 shrink-0 stroke-[2.2]" />
            <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">{item.location.zoneName}</span>
            <span className="text-neutral-400">•</span>
            <span className="truncate">{item.location.floor}</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 shrink-0 stroke-[2.2]" />
            <span>{isLost ? 'Lost on' : 'Discovered'}: {formatTime(item.dateOccurred)}</span>
          </div>

          {!isLost && item.storageLocation && (
            <div className="text-[11px] text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-900 px-2.5 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono font-bold">
              Secure Bin: {item.storageLocation}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3.5 bg-neutral-50/80 dark:bg-neutral-900/50 border-t border-neutral-200/90 dark:border-neutral-800/90 flex items-center justify-between gap-2">
        <button
          id={`view-detail-${item.id}`}
          onClick={() => onViewDetails(item)}
          className="text-xs font-black text-neutral-900 dark:text-neutral-100 hover:text-black dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800/70 transition-colors inline-flex items-center space-x-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 mr-1 stroke-[2.2]" />
          <span>Full Record</span>
        </button>

        <div className="flex items-center space-x-2">
          {hasMatch && onInspectMatch && (
            <button
              id={`inspect-match-${item.id}`}
              onClick={() => onInspectMatch(item)}
              className="text-xs font-black px-2.5 py-1.5 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300/80 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 transition-colors inline-flex items-center cursor-pointer active:scale-95 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-current stroke-[2.2]" />
              <span>Inspect Match</span>
            </button>
          )}

          {!isLost && item.status !== 'returned' && onInitiateClaim && (
            <button
              id={`claim-btn-${item.id}`}
              onClick={() => onInitiateClaim(item)}
              className="text-xs font-black px-3 py-1.5 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-2xs hover:shadow-xs active:scale-95 transition-all inline-flex items-center cursor-pointer border border-neutral-900 dark:border-white"
            >
              <span>Verify Claim</span>
              <ArrowRight className="w-3 h-3 ml-1 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
