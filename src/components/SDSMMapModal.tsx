import React, { useState, useEffect } from 'react';
import {
  Map,
  MapPin,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  X,
  Copy,
  Check,
  Compass,
  Building2,
  Navigation
} from 'lucide-react';

interface SDSMMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (locationName: string) => void;
  initialLocation?: string;
}

const COMMON_SDSM_LOCATIONS = [
  'CC3 Block',
  'Main Administrative Building',
  'Central Library',
  'Computer Science Labs',
  'Science Wing',
  'Auditorium',
  'College Canteen',
  'Sports Complex / Ground',
  'Reading Hall',
  'Parking Area',
  'Seminar Hall'
];

export const SDSMMapModal: React.FC<SDSMMapModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLocation, setCopiedLocation] = useState<string | null>(null);

  const MAP_URL = 'https://sdsmcollegemap.netlify.app/';

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(MAP_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePickLocation = (loc: string) => {
    if (onSelectLocation) {
      onSelectLocation(loc);
      setCopiedLocation(loc);
      setTimeout(() => {
        setCopiedLocation(null);
        onClose();
      }, 600);
    } else {
      navigator.clipboard.writeText(loc);
      setCopiedLocation(loc);
      setTimeout(() => setCopiedLocation(null), 1800);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sdsm-map-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-150"
    >
      <div
        className={`bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 rounded-2xl sm:rounded-3xl border border-neutral-300 dark:border-neutral-800 shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
          isFullscreen
            ? 'w-full h-full fixed inset-2 sm:inset-4 z-50'
            : 'w-full max-w-5xl h-[92vh] max-h-[900px]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 shadow-xs">
              <Map className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  id="sdsm-map-title"
                  className="text-sm sm:text-base font-black tracking-tight text-neutral-900 dark:text-neutral-50 truncate"
                >
                  SDSM College Campus Map
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Interactive Map
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-semibold truncate">
                sdsmcollegemap.netlify.app • Navigate buildings, classrooms, and recovery points
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Open in New Window */}
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full interactive map in new browser tab"
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden md:inline">Open New Tab</span>
            </a>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              title="Reload map"
              aria-label="Reload map"
              className="p-1.5 sm:p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 transition cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 stroke-[2.2] ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Expand full screen'}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand full screen'}
              className="p-1.5 sm:p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 transition cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <Maximize2 className="w-4 h-4 stroke-[2.2]" />
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              title="Close map (Esc)"
              aria-label="Close map"
              className="p-1.5 sm:p-2 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 transition cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Quick Location Chips Bar */}
        <div className="px-3 sm:px-6 py-2 bg-neutral-100/80 dark:bg-[#121215] border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 font-bold shrink-0">
            <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="text-[11px] uppercase tracking-wider">Quick Locations:</span>
          </div>
          {COMMON_SDSM_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handlePickLocation(loc)}
              title={onSelectLocation ? `Select "${loc}" for this item` : `Copy "${loc}" to clipboard`}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-[11px] shrink-0 transition flex items-center gap-1 cursor-pointer active:scale-95"
            >
              {copiedLocation === loc ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Selected!</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3 text-neutral-500" />
                  <span>{loc}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Map Frame Container */}
        <div className="relative flex-1 bg-neutral-900 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-900/90 text-white p-6 space-y-3">
              <div className="w-10 h-10 border-3 border-neutral-700 border-t-white rounded-full animate-spin"></div>
              <p className="text-sm font-bold tracking-wide">Loading SDSM College Map...</p>
              <p className="text-xs text-neutral-400 max-w-sm text-center">
                Fetching interactive college buildings, 3D layouts, and campus floorplan.
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={MAP_URL}
            title="SDSM College Map"
            className="w-full h-full border-0"
            allow="geolocation; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Footer Info & Actions */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-semibold">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Building2 className="w-4 h-4 text-neutral-500" />
            <span className="text-[11px] sm:text-xs">
              SDSM College Campus Facility & Property Network • Palghar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Map URL</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-black transition cursor-pointer text-xs"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
