import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  History, 
  Sparkles, 
  Tag, 
  CheckCircle,
  Clock,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Item, MatchPair } from '../types';

interface ItemDetailModalProps {
  item: Item | null;
  matches: MatchPair[];
  onClose: () => void;
  onInspectMatch: (item: Item) => void;
  onInitiateClaim: (item: Item) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  matches,
  onClose,
  onInspectMatch,
  onInitiateClaim,
}) => {
  if (!item) return null;

  const isLost = item.type === 'lost';

  // Find matches relevant to this item
  const itemMatches = matches.filter(
    m => m.lostItem.id === item.id || m.foundItem.id === item.id
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 text-black dark:text-white">
      <div 
        id="item-detail-modal"
        className="bg-white dark:bg-[#0a0a0a] rounded-t-3xl sm:rounded-2xl max-w-3xl w-full shadow-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[90vh]"
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden mobile-drag-handle bg-neutral-400 dark:bg-neutral-600 shrink-0" />
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-100 dark:bg-neutral-900">
          <div className="flex items-center space-x-3">
            <span
              className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isLost
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white border-neutral-400 dark:border-neutral-600'
              }`}
            >
              {isLost ? 'Lost Item Record' : 'Found in Custody'}
            </span>
            <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400 font-black">#{item.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer font-black"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title and metadata */}
          <div>
            <h2 className="text-xl font-black text-black dark:text-white">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              <span className="capitalize font-bold text-black dark:text-white">
                {item.category.replace('_', ' ')} • {item.subcategory}
              </span>
              {item.brand && (
                <>
                  <span>•</span>
                  <span>Brand: <strong className="text-black dark:text-white font-bold">{item.brand}</strong></span>
                </>
              )}
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-neutral-400 dark:border-neutral-600" 
                  style={{ backgroundColor: item.primaryColor.toLowerCase() }} 
                />
                <span className="text-black dark:text-white font-bold">{item.primaryColor}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-black dark:text-white leading-relaxed font-medium">
            <h4 className="font-black text-black dark:text-white mb-1">Detailed Description:</h4>
            <p>{item.description}</p>
          </div>

          {/* Distinctive Features */}
          {item.distinctiveFeatures && (
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs text-black dark:text-white">
              <div className="flex items-center space-x-1.5 font-black mb-1">
                <Tag className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.2]" />
                <span>Distinctive Physical Markings & Identifiers:</span>
              </div>
              <p className="italic font-medium">{item.distinctiveFeatures}</p>
            </div>
          )}

          {/* Location & Spatial Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center mb-2">
                <MapPin className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                Spatial Location Details
              </h4>
              <div className="space-y-1 text-xs">
                <div className="text-black dark:text-white font-black">{item.location.zoneName}</div>
                <div className="text-neutral-700 dark:text-neutral-300 font-medium">{item.location.floor}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Spot: {item.location.specificSpot}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center mb-2">
                <Calendar className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                Timestamps & Reporter
              </h4>
              <div className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                <div>Occurred: <strong className="text-black dark:text-white font-bold">{new Date(item.dateOccurred).toLocaleString()}</strong></div>
                <div>Logged: <span className="text-neutral-500 dark:text-neutral-400">{new Date(item.dateReported).toLocaleString()}</span></div>
                <div className="pt-1 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  Reporter: {item.reporter.name} ({item.reporter.role})
                </div>
              </div>
            </div>
          </div>

          {/* Secure Storage Location for Found Items */}
          {!isLost && item.storageLocation && (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-300 dark:border-neutral-800 flex items-center justify-between text-xs text-black dark:text-white">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-black dark:text-white stroke-[2.2]" />
                <span>Secured Custody Holding: <strong className="font-mono font-black">{item.storageLocation}</strong></span>
              </div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                Under Lock
              </span>
            </div>
          )}

          {/* Active Algorithmic Matches */}
          {itemMatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                Potential Algorithmic Matches Detected ({itemMatches.length})
              </h4>
              <div className="space-y-2">
                {itemMatches.map(m => {
                  const counterpart = isLost ? m.foundItem : m.lostItem;
                  return (
                    <div 
                      key={`${m.lostItem.id}-${m.foundItem.id}`}
                      className="p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-black dark:text-white">{counterpart.title}</span>
                          <span className="text-[10px] font-mono text-neutral-500">#{counterpart.id}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 font-medium">{m.breakdown.explanation}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-mono font-black text-black dark:text-white bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-700">
                          {m.breakdown.overallScore}%
                        </span>
                        <button
                          onClick={() => {
                            onInspectMatch(item);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-black bg-black text-white dark:bg-white dark:text-black hover:opacity-80 rounded-lg cursor-pointer transition-colors"
                        >
                          Compare
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custody Log / Audit Trail */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center mb-2.5">
              <History className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
              Custody Log & Audit History
            </h4>
            <div className="space-y-2 border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 ml-2">
              {item.custodyLog.map(entry => (
                <div key={entry.id} className="relative text-xs">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-black dark:bg-white border-2 border-white dark:border-black" />
                  <div className="font-black text-black dark:text-white">{entry.action}</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{entry.actor} • {new Date(entry.timestamp).toLocaleString()}</div>
                  <p className="text-neutral-700 dark:text-neutral-300 mt-0.5 font-medium">{entry.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-black text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
          >
            Close
          </button>

          {!isLost && item.status !== 'returned' && (
            <button
              onClick={() => {
                onInitiateClaim(item);
                onClose();
              }}
              className="px-4 py-2 text-xs font-black text-white bg-black dark:bg-white dark:text-black hover:opacity-80 rounded-lg shadow-sm flex items-center cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 mr-1.5 stroke-[2.2]" />
              File Claim on this Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
