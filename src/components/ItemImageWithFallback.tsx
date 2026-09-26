import React, { useState, useEffect } from 'react';
import {
  BottleWine,
  Umbrella,
  Headphones,
  Glasses,
  IdCard,
  KeyRound,
  Smartphone,
  Cable,
  Laptop,
  Wallet,
  Shirt,
  BookOpen,
  Package,
  LucideIcon
} from 'lucide-react';

interface CategoryConfig {
  icon: LucideIcon;
  name: string;
  tagline: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  bottle: {
    icon: BottleWine,
    name: 'Drinkware / Bottle',
    tagline: 'Hydration Gear',
  },
  umbrella: {
    icon: Umbrella,
    name: 'Umbrella / Rainwear',
    tagline: 'Weather Protection',
  },
  headphones: {
    icon: Headphones,
    name: 'Headphones / Audio',
    tagline: 'Personal Audio',
  },
  glasses: {
    icon: Glasses,
    name: 'Eyewear / Glasses',
    tagline: 'Optical Gear',
  },
  id_card: {
    icon: IdCard,
    name: 'Campus / Student ID',
    tagline: 'Credentials & Pass',
  },
  ids_cards: {
    icon: IdCard,
    name: 'IDs & Cards',
    tagline: 'Official Credentials',
  },
  keys: {
    icon: KeyRound,
    name: 'Keys / Ring Fob',
    tagline: 'Access Credentials',
  },
  phone: {
    icon: Smartphone,
    name: 'Smartphone / Mobile',
    tagline: 'Cellular Device',
  },
  cable: {
    icon: Cable,
    name: 'Cable / Charger Cord',
    tagline: 'Power & Data Link',
  },
  electronics: {
    icon: Laptop,
    name: 'Electronics / Laptop',
    tagline: 'Hardware Asset',
  },
  wallets_bags: {
    icon: Wallet,
    name: 'Wallet & Bags',
    tagline: 'Personal Storage',
  },
  clothing: {
    icon: Shirt,
    name: 'Clothing & Apparel',
    tagline: 'Campus Wear',
  },
  books_study: {
    icon: BookOpen,
    name: 'Books & Notes',
    tagline: 'Academic Material',
  },
};

export function getCategorySilhouette(category?: string): CategoryConfig {
  if (!category) {
    return {
      icon: Package,
      name: 'General Item',
      tagline: 'Campus Property',
    };
  }

  const normalized = category.toLowerCase().trim();
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }

  // Substring or fuzzy matching
  if (normalized.includes('bottle') || normalized.includes('cup') || normalized.includes('flask') || normalized.includes('water')) {
    return CATEGORY_MAP.bottle;
  }
  if (normalized.includes('umbrella') || normalized.includes('rain')) {
    return CATEGORY_MAP.umbrella;
  }
  if (normalized.includes('headphone') || normalized.includes('earbud') || normalized.includes('airpod') || normalized.includes('audio')) {
    return CATEGORY_MAP.headphones;
  }
  if (normalized.includes('glass') || normalized.includes('shade') || normalized.includes('spectacle')) {
    return CATEGORY_MAP.glasses;
  }
  if (normalized.includes('id') || normalized.includes('card') || normalized.includes('badge') || normalized.includes('license')) {
    return CATEGORY_MAP.id_card;
  }
  if (normalized.includes('key') || normalized.includes('fob') || normalized.includes('chain')) {
    return CATEGORY_MAP.keys;
  }
  if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('iphone') || normalized.includes('android')) {
    return CATEGORY_MAP.phone;
  }
  if (normalized.includes('cable') || normalized.includes('charger') || normalized.includes('cord') || normalized.includes('wire')) {
    return CATEGORY_MAP.cable;
  }
  if (normalized.includes('laptop') || normalized.includes('macbook') || normalized.includes('electronic') || normalized.includes('computer')) {
    return CATEGORY_MAP.electronics;
  }
  if (normalized.includes('wallet') || normalized.includes('purse') || normalized.includes('bag') || normalized.includes('backpack')) {
    return CATEGORY_MAP.wallets_bags;
  }
  if (normalized.includes('cloth') || normalized.includes('jacket') || normalized.includes('shirt') || normalized.includes('hoodie')) {
    return CATEGORY_MAP.clothing;
  }
  if (normalized.includes('book') || normalized.includes('notebook') || normalized.includes('binder') || normalized.includes('study')) {
    return CATEGORY_MAP.books_study;
  }

  return {
    icon: Package,
    name: category.replace(/_/g, ' '),
    tagline: 'Campus Property',
  };
}

export interface ItemImageWithFallbackProps {
  src?: string;
  alt: string;
  category: string;
  itemType?: 'found' | 'lost';
  variant?: 'grid' | 'list' | 'modal' | 'thumb';
  className?: string;
  imgClassName?: string;
  showSilhouetteBadge?: boolean;
}

export const ItemImageWithFallback: React.FC<ItemImageWithFallbackProps> = ({
  src,
  alt,
  category,
  itemType,
  variant = 'grid',
  className = '',
  imgClassName = '',
  showSilhouetteBadge = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset state whenever the image source changes
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const config = getCategorySilhouette(category);
  const IconComponent = config.icon;
  const isMissingOrFailed = !src || src.trim() === '' || hasError;

  // Fallback UI State: Branded Silhouette Icon Matching Item Category
  if (isMissingOrFailed) {
    if (variant === 'list' || variant === 'thumb') {
      return (
        <div
          data-testid="item-image-silhouette-thumb"
          className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-br from-neutral-100 via-neutral-200/50 to-neutral-100 dark:from-[#18181c] dark:via-[#131317] dark:to-[#0d0d10] text-neutral-900 dark:text-neutral-100 transition-colors ${className}`}
        >
          {/* Subtle concentric rings pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-15 dark:opacity-25 pointer-events-none">
            <div className="w-16 h-16 rounded-full border border-neutral-400 dark:border-neutral-500" />
            <div className="absolute w-24 h-24 rounded-full border border-neutral-400 dark:border-neutral-500" />
          </div>

          {/* Branded Silhouette Icon */}
          <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/90 dark:bg-neutral-800/90 shadow-2xs border border-neutral-300/80 dark:border-neutral-700/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900 dark:text-neutral-100 stroke-[2] drop-shadow-xs" />
          </div>

          <div className="relative z-10 mt-1 text-[9px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono truncate max-w-[85%] text-center">
            {category.replace(/_/g, ' ')}
          </div>
        </div>
      );
    }

    if (variant === 'modal') {
      return (
        <div
          data-testid="item-image-silhouette-modal"
          className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-br from-neutral-100 via-neutral-200/60 to-neutral-100 dark:from-[#19191e] dark:via-[#121216] dark:to-[#0a0a0d] p-6 text-center ${className}`}
        >
          {/* Watermark security grid / crosshairs */}
          <div className="absolute inset-0 bg-[radial-gradient(#0000000d_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          {/* Decorative concentric rings */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-20 pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-dashed border-neutral-600" />
            <div className="absolute w-64 h-64 rounded-full border border-neutral-500" />
          </div>

          {/* Prominent Branded Silhouette Medallion */}
          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/95 dark:bg-neutral-800/90 shadow-md border border-neutral-300 dark:border-neutral-700 flex items-center justify-center transition-transform duration-300">
            <IconComponent className="w-12 h-12 sm:w-14 sm:h-14 text-neutral-950 dark:text-white stroke-[1.8] drop-shadow-sm" />
          </div>

          {/* Category Details & Silhouette Notice */}
          <div className="relative z-10 mt-4 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-700/80 text-xs font-black text-neutral-900 dark:text-neutral-100 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
              <span>Catalog Silhouette: {config.name}</span>
            </div>
            <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
              No photographic proof uploaded • Verified Category Graphic
            </p>
          </div>

          <div className="absolute bottom-3 right-4 text-[9px] font-mono font-bold tracking-widest text-neutral-400 dark:text-neutral-600 uppercase select-none">
            CHIROZ REPOSITORY ASSET
          </div>
        </div>
      );
    }

    // Default: 'grid' card view banner
    return (
      <div
        data-testid="item-image-silhouette-grid"
        className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-br from-neutral-100 via-neutral-200/50 to-neutral-100 dark:from-[#18181d] dark:via-[#131317] dark:to-[#0c0c0f] text-neutral-900 dark:text-neutral-100 transition-colors ${className}`}
      >
        {/* Subtle patterned technical backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#0000000d_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
        
        {/* Concentric subtle radar circles */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-20 pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-neutral-500" />
          <div className="absolute w-44 h-44 rounded-full border border-dashed border-neutral-600" />
        </div>

        {/* Central Branded Silhouette Medallion */}
        <div className="relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-white/95 dark:bg-neutral-800/90 shadow-sm border border-neutral-300/90 dark:border-neutral-700/90 flex items-center justify-center group-hover:scale-108 transition-transform duration-300 ease-out">
          <IconComponent className="w-10 h-10 sm:w-11 sm:h-11 text-neutral-950 dark:text-white stroke-[1.9] drop-shadow-xs" />
        </div>

        {/* Branded Silhouette Category Pill */}
        {showSilhouetteBadge && (
          <div className="relative z-10 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-neutral-900/90 border border-neutral-300/80 dark:border-neutral-700/80 text-[10px] font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
              <span>{config.name}</span>
            </span>
          </div>
        )}

        {/* Institutional Watermark */}
        <div className="absolute bottom-2.5 right-3 text-[9px] font-mono font-bold tracking-widest text-neutral-400 dark:text-neutral-600 uppercase select-none">
          CHIROZ SILHOUETTE
        </div>
      </div>
    );
  }

  // Normal image with seamless fallback trigger on load error
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />

      {/* Pre-load shimmer placeholder while image downloads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-neutral-400">
          <IconComponent className="w-8 h-8 opacity-30" />
        </div>
      )}
    </div>
  );
};
