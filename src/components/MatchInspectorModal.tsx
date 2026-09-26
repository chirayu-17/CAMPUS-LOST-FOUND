import React from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Cpu,
  Layers,
  FileText,
  Tag
} from 'lucide-react';
import { MatchPair, Item } from '../types';

interface MatchInspectorModalProps {
  matchPair: MatchPair | null;
  onClose: () => void;
  onInitiateClaim: (foundItem: Item, lostItem: Item) => void;
}

export const MatchInspectorModal: React.FC<MatchInspectorModalProps> = ({
  matchPair,
  onClose,
  onInitiateClaim,
}) => {
  if (!matchPair) return null;

  const { lostItem, foundItem, breakdown } = matchPair;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 text-black dark:text-white">
      <div 
        id="match-inspector-modal"
        className="bg-white dark:bg-[#0a0a0a] rounded-2xl max-w-4xl w-full shadow-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-100 dark:bg-neutral-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
              <Cpu className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-black dark:text-white">Algorithmic Match Breakdown</h2>
                <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black">
                  {breakdown.overallScore}% Affinity ({breakdown.confidenceLevel.toUpperCase()} CONFIDENCE)
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                Multi-factor cross-analysis between Lost #{lostItem.id} and Found #{foundItem.id}
              </p>
            </div>
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
          {/* Explanation Alert */}
          <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-black dark:text-white stroke-[2.2] shrink-0 mt-0.5" />
            <div className="text-xs text-black dark:text-white font-medium">
              <span className="font-black">Algorithm Synthesis: </span>
              {breakdown.explanation}
            </div>
          </div>

          {/* Side-by-Side Item Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lost Item Card */}
            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-white bg-black dark:bg-white dark:text-black px-2 py-0.5 rounded-full border border-black dark:border-white">
                  Lost Item Declaration
                </span>
                <span className="text-xs font-mono text-neutral-500 font-bold">#{lostItem.id}</span>
              </div>
              <h3 className="font-black text-black dark:text-white text-sm mb-1">{lostItem.title}</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-medium">{lostItem.description}</p>

              <div className="space-y-1.5 text-xs text-black dark:text-white bg-white dark:bg-black p-3 rounded-lg border border-neutral-300 dark:border-neutral-800">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Category:</span>
                  <span className="font-bold capitalize">{lostItem.category.replace('_', ' ')} / {lostItem.subcategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Brand / Color:</span>
                  <span className="font-bold">{lostItem.brand || 'None'} • {lostItem.primaryColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Location:</span>
                  <span className="font-bold text-right">{lostItem.location.zoneName} ({lostItem.location.floor})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Time:</span>
                  <span className="font-bold">{new Date(lostItem.dateOccurred).toLocaleDateString()}</span>
                </div>
                {lostItem.distinctiveFeatures && (
                  <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 block mb-0.5 font-medium">Distinctive Marks:</span>
                    <span className="italic font-bold">{lostItem.distinctiveFeatures}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Found Item Card */}
            <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-black bg-neutral-200 dark:bg-neutral-800 dark:text-white px-2 py-0.5 rounded-full border border-neutral-400 dark:border-neutral-600">
                  Recovered Intake Item
                </span>
                <span className="text-xs font-mono text-neutral-500 font-bold">#{foundItem.id}</span>
              </div>
              <h3 className="font-black text-black dark:text-white text-sm mb-1">{foundItem.title}</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-medium">{foundItem.description}</p>

              <div className="space-y-1.5 text-xs text-black dark:text-white bg-white dark:bg-black p-3 rounded-lg border border-neutral-300 dark:border-neutral-800">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Category:</span>
                  <span className="font-bold capitalize">{foundItem.category.replace('_', ' ')} / {foundItem.subcategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Brand / Color:</span>
                  <span className="font-bold">{foundItem.brand || 'Unmarked'} • {foundItem.primaryColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Location:</span>
                  <span className="font-bold text-right">{foundItem.location.zoneName} ({foundItem.location.floor})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Time:</span>
                  <span className="font-bold">{new Date(foundItem.dateOccurred).toLocaleDateString()}</span>
                </div>
                {foundItem.storageLocation && (
                  <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-800 flex justify-between font-bold">
                    <span className="text-neutral-500">Custody Locker:</span>
                    <span>{foundItem.storageLocation}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mathematical Multi-Parameter Score Breakdown */}
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-5 border border-neutral-300 dark:border-neutral-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-4 flex items-center">
              <Cpu className="w-4 h-4 mr-1.5 text-black dark:text-white stroke-[2.2]" />
              Algorithmic Component Vector Breakdown
            </h4>

            <div className="space-y-4">
              {/* 1. Category & Subcategory */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-black dark:text-white flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                    1. Categorical Concordance (25% Weight)
                  </span>
                  <span className="font-mono font-black text-black dark:text-white">{breakdown.categoryScore}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-black dark:bg-white"
                    style={{ width: `${breakdown.categoryScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                  Taxonomy matching across primary domain and item subcategory types.
                </p>
              </div>

              {/* 2. Text & Token Jaccard */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-black dark:text-white flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                    2. Lexical & Token Jaccard Similarity (30% Weight)
                  </span>
                  <span className="font-mono font-black text-black dark:text-white">{breakdown.textSimilarityScore}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-black dark:bg-white"
                    style={{ width: `${breakdown.textSimilarityScore}%` }}
                  />
                </div>
                {breakdown.matchedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                    <span className="text-[10px] text-neutral-500 font-medium">Shared tokens:</span>
                    {breakdown.matchedKeywords.map((token, i) => (
                      <span key={i} className="text-[10px] bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white px-1.5 py-0.2 rounded font-mono font-bold">
                        {token}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Physical Attributes */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-black dark:text-white flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                    3. Visual & Physical Attributes (20% Weight)
                  </span>
                  <span className="font-mono font-black text-black dark:text-white">{breakdown.attributeScore}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-black dark:bg-white"
                    style={{ width: `${breakdown.attributeScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                  Color family compatibility and brand alignment verification.
                </p>
              </div>

              {/* 4. Spatial Proximity */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-black dark:text-white flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                    4. Spatial Grid Proximity (15% Weight)
                  </span>
                  <span className="font-mono font-black text-black dark:text-white">{breakdown.spatialScore}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-black dark:bg-white"
                    style={{ width: `${breakdown.spatialScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                  Campus Euclidean distance: ~{breakdown.spatialDistanceEstimateMeters} meters between reported loss and discovery spot.
                </p>
              </div>

              {/* 5. Temporal Proximity */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-bold text-black dark:text-white flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                    5. Temporal Proximity & Decay (10% Weight)
                  </span>
                  <span className="font-mono font-black text-black dark:text-white">{breakdown.temporalScore}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-black dark:bg-white"
                    style={{ width: `${breakdown.temporalScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                  Time gap: {breakdown.daysDifference} day(s) elapsed between occurrences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            Intake Officer: Confidential verification questions are required prior to physical return.
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-black text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Dismiss
            </button>

            {foundItem.status !== 'returned' && (
              <button
                id="initiate-claim-from-match-btn"
                onClick={() => {
                  onInitiateClaim(foundItem, lostItem);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-black text-white bg-black dark:bg-white dark:text-black hover:opacity-80 rounded-lg shadow-sm transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5 stroke-[2.2]" />
                Initiate Ownership Verification Claim
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
