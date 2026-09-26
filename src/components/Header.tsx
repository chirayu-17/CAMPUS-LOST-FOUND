import React from 'react';
import { 
  Compass, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Item, MatchPair, Claim } from '../types';

interface HeaderProps {
  activeTab: 'inventory' | 'matching' | 'space_map' | 'verification_desk' | 'algorithm_docs';
  setActiveTab: (tab: 'inventory' | 'matching' | 'space_map' | 'verification_desk' | 'algorithm_docs') => void;
  items: Item[];
  matches: MatchPair[];
  claims: Claim[];
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onSimulateNewItem: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  items,
  matches,
  claims,
  onOpenReportModal,
  onSimulateNewItem,
  onResetData,
}) => {
  const lostCount = items.filter(i => i.type === 'lost' && i.status !== 'returned').length;
  const foundCount = items.filter(i => i.type === 'found' && i.status !== 'returned').length;
  const highConfidenceMatches = matches.filter(m => m.breakdown.overallScore >= 75).length;
  const pendingClaims = claims.filter(c => c.status === 'pending').length;

  return (
    <header className="border-b border-neutral-300 dark:border-neutral-800 bg-white/95 dark:bg-[#000000]/95 backdrop-blur sticky top-0 z-30 text-black dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with branding, stats, and primary action buttons */}
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-sm">
              <Compass className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-black dark:text-white tracking-tight">Public Space Lost & Found</h1>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                  Campus & Transit Hub
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                Multi-zone algorithmic matching engine & secure anti-fraud verification
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-850 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
              <span className="font-bold">{lostCount}</span>
              <span className="text-neutral-600 dark:text-neutral-400">Lost</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-850 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
              <span className="font-bold">{foundCount}</span>
              <span className="text-neutral-600 dark:text-neutral-400">In Custody</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-850 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
              <Sparkles className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.2]" />
              <span className="font-bold">{highConfidenceMatches}</span>
              <span className="text-neutral-600 dark:text-neutral-400">High Matches</span>
            </div>

            {pendingClaims > 0 && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-400 dark:border-neutral-600">
                <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.2]" />
                <span className="font-black">{pendingClaims}</span>
                <span>Claim Review</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="report-lost-btn"
              onClick={() => onOpenReportModal('lost')}
              className="inline-flex items-center px-3.5 py-2 text-xs font-black rounded-lg text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5 stroke-[2.2]" />
              Report Lost
            </button>

            <button
              id="report-found-btn"
              onClick={() => onOpenReportModal('found')}
              className="inline-flex items-center px-3.5 py-2 text-xs font-black rounded-lg text-black bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 stroke-[2.2]" />
              Report Found
            </button>

            <button
              id="simulate-item-btn"
              onClick={onSimulateNewItem}
              title="Simulate a real-time dropped item to observe automated algorithmic matching"
              className="inline-flex items-center px-3 py-2 text-xs font-black rounded-lg text-black bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-black dark:text-white stroke-[2.2] mr-1.5" />
              Simulate Drop
            </button>

            <button
              id="reset-data-btn"
              onClick={onResetData}
              title="Reset data back to initial college scenario"
              className="p-2 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <nav className="flex space-x-1 border-t border-neutral-200 dark:border-neutral-800 pt-1 overflow-x-auto">
          <button
            id="nav-tab-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center px-3.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 mr-1.5 text-black dark:text-white stroke-[2.2]" />
            Item Catalog ({items.length})
          </button>

          <button
            id="nav-tab-matching"
            onClick={() => setActiveTab('matching')}
            className={`flex items-center px-3.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'matching'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-black dark:text-white stroke-[2.2]" />
            Algorithmic Matches ({matches.length})
          </button>

          <button
            id="nav-tab-map"
            onClick={() => setActiveTab('space_map')}
            className={`flex items-center px-3.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'space_map'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 mr-1.5 text-black dark:text-white stroke-[2.2]" />
            Public Space Map
          </button>

          <button
            id="nav-tab-verification"
            onClick={() => setActiveTab('verification_desk')}
            className={`flex items-center px-3.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'verification_desk'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-black dark:text-white stroke-[2.2]" />
            Verification & Custody Desk
            {pendingClaims > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-black">
                {pendingClaims}
              </span>
            )}
          </button>

          <button
            id="nav-tab-algorithm"
            onClick={() => setActiveTab('algorithm_docs')}
            className={`flex items-center px-3.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'algorithm_docs'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-black dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 mr-1.5 text-black dark:text-white stroke-[2.2]" />
            Algorithm & Architecture
          </button>
        </nav>
      </div>
    </header>
  );
};
