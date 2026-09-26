import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Info, 
  Compass, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Building,
  Ruler
} from 'lucide-react';
import { LocationZone, Item } from '../types';
import { CAMPUS_ZONES } from '../data/mockData';

interface SpaceMapProps {
  items: Item[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string | null) => void;
  onSelectItem: (item: Item) => void;
}

export const SpaceMap: React.FC<SpaceMapProps> = ({
  items,
  selectedZoneId,
  onSelectZone,
  onSelectItem,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [activePin, setActivePin] = useState<Item | null>(null);
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);

  // Filter items by type if needed
  const visibleItems = items.filter(item => {
    if (filterType === 'lost') return item.type === 'lost';
    if (filterType === 'found') return item.type === 'found';
    return true;
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!measureMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (measurePoints.length >= 2) {
      setMeasurePoints([{ x, y }]);
    } else {
      setMeasurePoints(prev => [...prev, { x, y }]);
    }
  };

  const getDistanceMeters = () => {
    if (measurePoints.length < 2) return null;
    const [p1, p2] = measurePoints;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const gridDist = Math.sqrt(dx * dx + dy * dy);
    // Estimated scale: 1 grid unit ≈ 10 meters
    return Math.round(gridDist * 10);
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-300 dark:border-neutral-800 shadow-xs overflow-hidden flex flex-col text-black dark:text-white">
      {/* Map Control Bar */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-black dark:text-white stroke-[2.2]" />
          <h2 className="text-sm font-black text-black dark:text-white">
            Interactive Public Space & Campus Floorplan
          </h2>
          <span className="text-xs text-neutral-600 dark:text-neutral-400 hidden sm:inline font-semibold">
            (Spatial Proximity & Geofencing Model)
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="inline-flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black p-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-black transition-colors cursor-pointer ${
                filterType === 'all' 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setFilterType('lost')}
              className={`px-2.5 py-1 rounded-md font-black transition-colors cursor-pointer ${
                filterType === 'lost' 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setFilterType('found')}
              className={`px-2.5 py-1 rounded-md font-black transition-colors cursor-pointer ${
                filterType === 'found' 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Found Only
            </button>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-colors cursor-pointer flex items-center ${
              showHeatmap
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 mr-1 stroke-[2.2]" />
            {showHeatmap ? 'Hotspots Active' : 'Show Hotspots'}
          </button>

          <button
            onClick={() => {
              setMeasureMode(!measureMode);
              setMeasurePoints([]);
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-black transition-colors cursor-pointer flex items-center ${
              measureMode
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 mr-1 stroke-[2.2]" />
            {measureMode ? 'Measuring Active' : 'Distance Ruler'}
          </button>

          {selectedZoneId && (
            <button
              onClick={() => onSelectZone(null)}
              className="px-2.5 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 font-bold cursor-pointer"
            >
              Clear Zone Filter
            </button>
          )}
        </div>
      </div>

      {/* Map Measurement Notification */}
      {measureMode && (
        <div className="bg-neutral-100 dark:bg-neutral-900 px-4 py-2 border-b border-neutral-300 dark:border-neutral-800 text-xs text-black dark:text-white flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-medium">
            <Ruler className="w-4 h-4 text-black dark:text-white stroke-[2.2] shrink-0" />
            <span>
              {measurePoints.length === 0 && 'Click any point on the map to set the first measurement location.'}
              {measurePoints.length === 1 && 'Now click a second point to measure spatial distance and algorithm score.'}
              {measurePoints.length === 2 && (
                <strong>
                  Spatial Distance: ~{getDistanceMeters()} meters (Grid proximity score: ~{Math.max(0, 100 - Math.round((getDistanceMeters()! / 10) * 1.5))}%)
                </strong>
              )}
            </span>
          </div>
          {measurePoints.length === 2 && (
            <button
              onClick={() => setMeasurePoints([])}
              className="text-black dark:text-white underline font-bold text-xs cursor-pointer ml-3 shrink-0"
            >
              Reset Points
            </button>
          )}
        </div>
      )}

      {/* Map Canvas / Visual Floorplan Area */}
      <div className="relative w-full h-[520px] bg-neutral-200 dark:bg-[#121212] overflow-hidden select-none" onClick={handleMapClick}>
        {/* Architectural Grid pattern & pathways */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#campus-grid)" />

          {/* Campus pedestrian walking paths */}
          <path d="M 50 0 L 50 1000" stroke="currentColor" strokeWidth="24" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-700" />
          <path d="M 0 300 L 1200 300" stroke="currentColor" strokeWidth="20" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-700" />
          <path d="M 200 100 Q 400 300 800 380" stroke="currentColor" strokeWidth="16" fill="none" className="text-neutral-400 dark:text-neutral-700" />
          <path d="M 800 380 L 800 600" stroke="currentColor" strokeWidth="18" fill="none" className="text-neutral-400 dark:text-neutral-700" />
        </svg>

        {/* Measurement line SVG */}
        {measurePoints.length === 2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <line
              x1={`${measurePoints[0].x}%`}
              y1={`${measurePoints[0].y}%`}
              x2={`${measurePoints[1].x}%`}
              y2={`${measurePoints[1].y}%`}
              stroke="currentColor"
              className="text-black dark:text-white"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <circle cx={`${measurePoints[0].x}%`} cy={`${measurePoints[0].y}%`} r="6" className="fill-black dark:fill-white" />
            <circle cx={`${measurePoints[1].x}%`} cy={`${measurePoints[1].y}%`} r="6" className="fill-black dark:fill-white" />
          </svg>
        )}

        {/* Building Footprints & Zones */}
        {CAMPUS_ZONES.map(zone => {
          const isSelected = selectedZoneId === zone.id;
          const zoneItems = items.filter(i => i.location.zoneId === zone.id);
          const zoneLost = zoneItems.filter(i => i.type === 'lost').length;
          const zoneFound = zoneItems.filter(i => i.type === 'found').length;

          return (
            <div
              key={zone.id}
              onClick={(e) => {
                if (measureMode) return;
                e.stopPropagation();
                onSelectZone(isSelected ? null : zone.id);
              }}
              style={{ left: `${zone.coordinates.x}%`, top: `${zone.coordinates.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl p-3 cursor-pointer transition-all duration-300 z-10 ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black ring-4 ring-neutral-400 shadow-xl scale-105'
                  : 'bg-white/95 dark:bg-[#1a1a1a]/95 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                <span className="text-xs font-black whitespace-nowrap">{zone.code} - {zone.name}</span>
              </div>

              {/* Zone mini stats */}
              <div className="flex items-center space-x-2 mt-1.5 text-[10px] font-bold">
                <span className={`px-1.5 py-0.5 rounded ${isSelected ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700'}`}>
                  {zoneLost} Lost
                </span>
                <span className={`px-1.5 py-0.5 rounded ${isSelected ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700'}`}>
                  {zoneFound} Found
                </span>
              </div>
            </div>
          );
        })}

        {/* Item Markers / Pins */}
        {visibleItems.map(item => {
          const isSelectedZone = !selectedZoneId || item.location.zoneId === selectedZoneId;
          if (!isSelectedZone) return null;

          const isLost = item.type === 'lost';
          const isMatch = item.status === 'potential_match';

          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setActivePin(item);
              }}
              style={{
                left: `${item.location.coordinates.x}%`,
                top: `${item.location.coordinates.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-transform hover:scale-125 ${
                activePin?.id === item.id ? 'scale-125 z-30' : ''
              }`}
            >
              <div className="relative">
                {/* Pin Head */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ring-2 ring-neutral-300 dark:ring-neutral-700 ${
                    isMatch
                      ? 'bg-black text-white dark:bg-white dark:text-black animate-bounce'
                      : isLost
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-neutral-200 text-black dark:bg-neutral-800 dark:text-white border border-black dark:border-white'
                  }`}
                >
                  {isLost ? 'L' : 'F'}
                </div>

                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-40 whitespace-nowrap">
                  <div className="bg-black text-white dark:bg-white dark:text-black text-[11px] px-2.5 py-1 rounded-lg shadow-xl font-bold">
                    <span className="font-black">{item.title}</span>
                    <span className="block text-[10px] text-neutral-400 dark:text-neutral-600">{item.location.floor} • {item.location.specificSpot}</span>
                  </div>
                  <div className="w-2 h-2 bg-black dark:bg-white rotate-45 -mt-1" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Pin Floating Drawer / Details */}
        {activePin && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-neutral-300 dark:border-neutral-800 z-30 text-black dark:text-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white">
                {activePin.type === 'lost' ? 'Lost Item' : 'Found in Custody'}
              </span>
              <button
                onClick={() => setActivePin(null)}
                className="text-black dark:text-white hover:opacity-70 text-xs font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h4 className="font-black text-black dark:text-white text-sm">{activePin.title}</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 my-1 font-medium">{activePin.description}</p>
            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mb-2">
              <strong className="text-black dark:text-white font-bold">Location:</strong> {activePin.location.zoneName} ({activePin.location.floor} - {activePin.location.specificSpot})
            </div>

            <button
              onClick={() => {
                onSelectItem(activePin);
                setActivePin(null);
              }}
              className="w-full text-center px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Open Full Record
            </button>
          </div>
        )}
      </div>

      {/* Map Footer Legend & Spatial Algorithm Note */}
      <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 text-xs text-black dark:text-white flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-4 font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-black dark:bg-white"></span>
            <span>Lost Declarations</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700 border border-black dark:border-white"></span>
            <span>Found in Custody</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-black dark:bg-white animate-pulse ring-2 ring-neutral-400"></span>
            <span>Active Matches</span>
          </div>
        </div>

        <div className="text-[11px] text-neutral-600 dark:text-neutral-400 flex items-center font-medium">
          <Compass className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
          Spatial Euclidean weighting: 1 grid unit ≈ 10m. Same-building yields 85-100% proximity score.
        </div>
      </div>
    </div>
  );
};
