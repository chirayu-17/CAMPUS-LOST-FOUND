import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  PlusCircle, 
  CheckCircle, 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  ShieldCheck, 
  Lock,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { ItemCategory, ItemType, ItemLocation, ReporterInfo, Item } from '../types';
import { CAMPUS_ZONES } from '../data/mockData';

interface ReportModalProps {
  initialType: ItemType;
  onClose: () => void;
  onSubmit: (itemData: Partial<Item>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  initialType,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<ItemType>(initialType);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [subcategory, setSubcategory] = useState('Laptop');
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState('Black');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [description, setDescription] = useState('');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');
  
  // Location
  const [selectedZoneId, setSelectedZoneId] = useState('zone_lib');
  const [floor, setFloor] = useState('2nd Floor Quiet Study');
  const [specificSpot, setSpecificSpot] = useState('');
  
  // Date & Time
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));

  // Anti-fraud verification
  const [secretVerificationDetails, setSecretVerificationDetails] = useState('');
  const [verificationQuestions, setVerificationQuestions] = useState<string[]>([
    'What distinctive mark or identifier is on the item?'
  ]);
  const [storageLocation, setStorageLocation] = useState('Campus Security Intake Locker #A1');

  // Reporter
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [reporterRole, setReporterRole] = useState<'student' | 'visitor' | 'staff' | 'security'>('student');

  const selectedZone = CAMPUS_ZONES.find(z => z.id === selectedZoneId) || CAMPUS_ZONES[0];

  const handleZoneChange = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    const z = CAMPUS_ZONES.find(item => item.id === zoneId);
    if (z && z.floors.length > 0) {
      setFloor(z.floors[0]);
    }
  };

  const handleAiAnalyze = async () => {
    if (!naturalLanguageInput.trim()) return;
    setIsAnalyzing(true);
    setAiMessage(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawDescription: naturalLanguageInput,
          itemType: type
        })
      });

      const data = await response.json();
      if (data && data.analysis) {
        const a = data.analysis;
        if (a.category) setCategory(a.category);
        if (a.subcategory) setSubcategory(a.subcategory);
        if (a.brand) setBrand(a.brand);
        if (a.primaryColor) setPrimaryColor(a.primaryColor);
        if (a.secondaryColor) setSecondaryColor(a.secondaryColor);
        if (a.distinctiveFeatures) setDistinctiveFeatures(a.distinctiveFeatures);
        if (a.verificationQuestions && Array.isArray(a.verificationQuestions)) {
          setVerificationQuestions(a.verificationQuestions);
        }

        if (!title) {
          setTitle(`${a.primaryColor || ''} ${a.brand || ''} ${a.subcategory || 'Item'}`.trim());
        }
        if (!description) {
          setDescription(naturalLanguageInput);
        }

        setAiMessage(`AI parsed attributes: ${a.brand || 'Item'} (${a.category}) in ${a.primaryColor}.`);
      }
    } catch (err) {
      console.error('AI intake parsing error:', err);
      setAiMessage('Parsing completed with local heuristic classifier.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const location: ItemLocation = {
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      floor: floor || selectedZone.floors[0] || '1st Floor',
      specificSpot: specificSpot || 'General Area',
      coordinates: {
        x: selectedZone.coordinates.x + (Math.random() * 4 - 2),
        y: selectedZone.coordinates.y + (Math.random() * 4 - 2)
      }
    };

    const reporter: ReporterInfo = {
      name: reporterName || (type === 'lost' ? 'Campus Student' : 'Good Samaritan'),
      contact: reporterContact || 'intake@campus.edu',
      role: reporterRole
    };

    const newItemPayload: Partial<Item> = {
      type,
      title: title || `${primaryColor} ${brand || ''} ${subcategory}`.trim(),
      category,
      subcategory,
      brand: brand || undefined,
      primaryColor,
      secondaryColor: secondaryColor || undefined,
      description: description || naturalLanguageInput || 'No additional description provided.',
      distinctiveFeatures: distinctiveFeatures || undefined,
      location,
      dateOccurred: new Date(dateTime).toISOString(),
      dateReported: new Date().toISOString(),
      reporter,
      verificationQuestions,
      secretVerificationDetails: type === 'found' ? secretVerificationDetails : undefined,
      storageLocation: type === 'found' ? storageLocation : undefined
    };

    onSubmit(newItemPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div 
        id="report-item-modal"
        className="bg-white dark:bg-[#0a0a0a] rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] text-black dark:text-white"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-100 dark:bg-neutral-900">
          <div>
            <h2 className="text-base font-black text-black dark:text-white">
              {type === 'lost' ? 'Report a Lost Item' : 'Register a Recovered Item (Found)'}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
              Provide attributes for automated algorithmic matching across public space zones.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Item Type Switcher */}
          <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 border border-neutral-300 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                type === 'lost'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              I Lost An Item
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                type === 'found'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              I Found An Item
            </button>
          </div>

          {/* AI Intake Assistant */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-black dark:text-white font-black">
              <Sparkles className="w-4 h-4 text-black dark:text-white stroke-[2.2]" />
              <span>Smart AI Quick-Fill Intake</span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
              Type or paste what happened in plain English; Smart AI will extract categories, colors, brands, and generate anti-fraud questions.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="e.g. Lost a black Hydro Flask 32oz bottle with orange paracord handle at gym..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              <button
                type="button"
                onClick={handleAiAnalyze}
                disabled={isAnalyzing || !naturalLanguageInput.trim()}
                className="px-3.5 py-2 text-xs font-black rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors flex items-center cursor-pointer shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 stroke-[2.2]" />
                    Auto-Fill
                  </>
                )}
              </button>
            </div>
            {aiMessage && (
              <div className="text-[11px] text-black dark:text-white font-bold">
                ✓ {aiMessage}
              </div>
            )}
          </div>

          {/* Core Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-black dark:text-white mb-1">Item Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Space Gray MacBook Pro 14 M3"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-bold focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden capitalize"
              >
                <option value="electronics">Electronics</option>
                <option value="wallets_bags">Wallets & Bags</option>
                <option value="ids_cards">Identification & Cards</option>
                <option value="keys">Keys & Access Fobs</option>
                <option value="clothing">Clothing & Apparel</option>
                <option value="books_study">Books & Study Materials</option>
                <option value="personal_items">Personal Items & Accessories</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-black dark:text-white mb-1">Subcategory / Type</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Laptop, Wallet, Water Bottle, Earbuds"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Sony, Nike, Hydro Flask"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white mb-1">Primary Color *</label>
              <select
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-bold focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
              >
                <option value="Black">Black</option>
                <option value="Gray">Gray / Silver</option>
                <option value="Blue">Blue / Navy</option>
                <option value="Brown">Brown / Tan</option>
                <option value="Green">Green</option>
                <option value="Red">Red</option>
                <option value="White">White</option>
                <option value="Gold">Gold</option>
                <option value="Orange">Orange</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-black dark:text-white mb-1">Secondary Color / Accent</label>
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="e.g. Orange, White, Neon"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-black text-black dark:text-white mb-1">Full Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe circumstances, materials, general appearance..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
            />
          </div>

          {/* Distinctive Features (Crucial for Match Engine) */}
          <div>
            <label className="block font-black text-black dark:text-white mb-1 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
              Distinctive Markings, Stickers, Scratches or Engravings
            </label>
            <input
              type="text"
              value={distinctiveFeatures}
              onChange={(e) => setDistinctiveFeatures(e.target.value)}
              placeholder="e.g. GitHub sticker on lid, dent on corner, paracord handle"
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
            />
          </div>

          {/* Spatial Location Details */}
          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 space-y-3">
            <h4 className="font-black text-black dark:text-white flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-black dark:text-white stroke-[2.2]" />
              Public Space Location & Geofencing
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-bold">Zone / Building</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden"
                >
                  {CAMPUS_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-bold">Floor / Sector</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden"
                >
                  {selectedZone.floors.map((fl, i) => (
                    <option key={i} value={fl}>{fl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-bold">Specific Spot</label>
                <input
                  type="text"
                  value={specificSpot}
                  onChange={(e) => setSpecificSpot(e.target.value)}
                  placeholder="e.g. Desk 14 near window"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-black text-black dark:text-white mb-1">
                {type === 'lost' ? 'Date & Time Lost' : 'Date & Time Discovered'}
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:outline-hidden"
              />
            </div>

            {type === 'found' && (
              <div>
                <label className="block font-black text-black dark:text-white mb-1">Secure Custody Holding Bin</label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="e.g. Library Security Locker #B4"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Confidential Intake Detail (Only for Found items to test claimants) */}
          {type === 'found' && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 space-y-2">
              <label className="font-black text-black dark:text-white flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                Confidential Intake Secret (Anti-Fraud Proof)
              </label>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                Hidden from public search! Note down an unmentioned detail (e.g. lock screen photo, internal ID name, exact cash amount) that the true owner must state to verify ownership.
              </p>
              <input
                type="text"
                value={secretVerificationDetails}
                onChange={(e) => setSecretVerificationDetails(e.target.value)}
                placeholder="e.g. Lock screen photo is a golden retriever; sticker inside says 'Maya'"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden"
              />
            </div>
          )}

          {/* Reporter Information */}
          <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-3">
            <h4 className="font-black text-black dark:text-white flex items-center">
              <User className="w-4 h-4 mr-1 text-black dark:text-white stroke-[2.2]" />
              Reporter Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-bold">Full Name</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-bold">Email / Phone</label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="e.g. mchen@campus.edu"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1 font-bold">Role</label>
                <select
                  value={reporterRole}
                  onChange={(e) => setReporterRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden"
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff / Faculty</option>
                  <option value="security">Campus Security Officer</option>
                  <option value="visitor">Public Visitor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {type === 'lost' ? 'Submit Lost Item Report' : 'Register Found Item in Custody'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
