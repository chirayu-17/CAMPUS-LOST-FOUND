import React, { useState } from 'react';
import { TicketType, TicketCategory } from '../types/ticket';
import { ticketService } from '../services/ticketStore';
import { ShieldAlert, ArrowLeft, Check, Lock, AlertCircle, FilePlus2 } from 'lucide-react';

interface ReportViewProps {
  navigate: (route: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ navigate }) => {
  const [type, setType] = useState<TicketType>('lost');
  const [category, setCategory] = useState<TicketCategory>('electronics');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [locationZone, setLocationZone] = useState<string>('Central Library');
  const [specificArea, setSpecificArea] = useState<string>('');
  const [publicDescription, setPublicDescription] = useState<string>('');
  const [hiddenIdentifier, setHiddenIdentifier] = useState<string>('');
  const [claimantName, setClaimantName] = useState<string>('');
  const [claimantContact, setClaimantContact] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!publicDescription.trim()) {
      setErrorMessage('Public description is required for cataloging in the ledger.');
      return;
    }

    if (!hiddenIdentifier.trim()) {
      setErrorMessage('Hidden Identifier is mandatory. Provide a private distinguishing detail (serial number, engraving, hidden mark, interior item, cash amount) to establish proof of ownership.');
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket = ticketService.createTicket({
        type,
        category,
        date,
        location_zone: locationZone,
        specific_area: specificArea,
        public_description: publicDescription,
        hidden_identifier: hiddenIdentifier,
        claimant_name: claimantName,
        claimant_contact: claimantContact,
      });

      setSubmittedTicketId(ticket.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Transmission failed. Ensure network connection is active.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedTicketId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 font-mono">
        <div className="border-2 border-neutral-900 dark:border-white bg-white dark:bg-black p-8 text-neutral-900 dark:text-white shadow-xl">
          <div className="flex items-center gap-2 text-xs text-white dark:text-black bg-neutral-900 dark:bg-white px-2 py-1 font-bold w-fit uppercase mb-6">
            <Check className="w-3.5 h-3.5" />
            OFFICIAL DOCKET LODGED SUCCESSFULLY
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
            TICKET REFERENCE: {submittedTicketId}
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            Your report has been written into the institutional ledger under Zero-Trust architecture. 
            The public record contains only non-sensitive descriptive parameters. Your confidential hidden identifier 
            has been sealed and will only be inspected by sworn security officers during physical custody interrogation.
          </p>

          <div className="border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-neutral-950 mb-8 space-y-3 text-xs">
            <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900 pb-2">
              <span className="text-neutral-500">TYPE CLASSIFICATION:</span>
              <span className="text-neutral-900 dark:text-white font-bold uppercase">[{type}]</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900 pb-2">
              <span className="text-neutral-500">TAXONOMY:</span>
              <span className="text-neutral-900 dark:text-white uppercase">{category}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900 pb-2">
              <span className="text-neutral-500">LOCATION ZONE:</span>
              <span className="text-neutral-900 dark:text-white">{locationZone}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-900 pb-2">
              <span className="text-neutral-500">PUBLIC DESCRIPTION:</span>
              <span className="text-neutral-900 dark:text-white max-w-md text-right truncate">{publicDescription}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-neutral-500">HIDDEN IDENTIFIER STATUS:</span>
              <span className="text-white dark:text-black bg-neutral-900 dark:bg-white px-2 py-0.5 font-bold uppercase text-[10px]">
                [ENCRYPTED // RESTRICTED TO INSTITUTIONAL OFFICERS]
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/ledger')}
              className="flex-1 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold uppercase text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              VIEW IN PUBLIC LEDGER &rarr;
            </button>
            <button
              onClick={() => {
                setSubmittedTicketId(null);
                setPublicDescription('');
                setHiddenIdentifier('');
                setSpecificArea('');
              }}
              className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold uppercase text-xs hover:border-black dark:hover:border-white transition-colors"
            >
              LODGE ANOTHER TICKET
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-mono text-neutral-900 dark:text-white">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white mb-6 uppercase"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        RETURN TO DISPATCH
      </button>

      {/* Main Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-8">
        <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
          UNIFIED FRICTIONLESS PORTAL // NO ACCOUNT REQUIRED
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          LODGE PROPERTY TICKET
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
          Submit lost property declarations or report items recovered on campus. 
          Information is segregated: public attributes display on the public ledger; secret verification 
          keys are quarantined for institutional interrogation handover.
        </p>
      </div>

      {errorMessage && (
        <div className="border-2 border-red-600 bg-red-50 dark:bg-neutral-950 text-red-900 dark:text-red-300 p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <div className="text-xs leading-relaxed">
            <strong className="block uppercase font-bold">VALIDATION EXCEPTION:</strong>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 md:p-8 space-y-8 shadow-xs">
        {/* Section 1: Classification */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
            01. REPORT CLASSIFICATION
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              id="report-type-lost"
              onClick={() => setType('lost')}
              className={`py-3 px-4 text-xs font-bold uppercase border transition-all text-center ${
                type === 'lost'
                  ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-black'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-black dark:hover:text-white'
              }`}
            >
              [ LOST DECLARATION ]
              <span className="block text-[10px] font-normal opacity-80 mt-0.5">I am missing an item</span>
            </button>
            <button
              type="button"
              id="report-type-found"
              onClick={() => setType('found')}
              className={`py-3 px-4 text-xs font-bold uppercase border transition-all text-center ${
                type === 'found'
                  ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-black'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-black dark:hover:text-white'
              }`}
            >
              [ RECOVERED ITEM ]
              <span className="block text-[10px] font-normal opacity-80 mt-0.5">I found / turned in an item</span>
            </button>
          </div>
        </div>

        {/* Section 2: Taxonomy & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              02. CATEGORY TAXONOMY
            </label>
            <select
              id="select-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-3 py-2 text-xs focus:border-black dark:focus:border-white focus:outline-none uppercase"
            >
              <option value="electronics">ELECTRONICS (LAPTOP, PHONE, TABLET)</option>
              <option value="credentials_ids">CREDENTIALS &amp; CAMPUS IDS</option>
              <option value="valuables_wallets">VALUABLES &amp; WALLETS</option>
              <option value="keys_access">KEYS &amp; ACCESS FOBS</option>
              <option value="apparel">APPAREL &amp; OUTERWEAR</option>
              <option value="stationery_books">TEXTBOOKS &amp; STATIONERY</option>
              <option value="personal_belongings">PERSONAL BELONGINGS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              03. DATE OF OCCURRENCE
            </label>
            <input
              type="date"
              id="input-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-3 py-2 text-xs focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Section 3: Spatial Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              04. PRIMARY CAMPUS ZONE
            </label>
            <select
              id="select-location-zone"
              value={locationZone}
              onChange={(e) => setLocationZone(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-3 py-2 text-xs focus:border-black dark:focus:border-white focus:outline-none"
            >
              <option value="Central Library">William Knox Central Library</option>
              <option value="Student Union Food Atrium">Student Union &amp; Dining Hall</option>
              <option value="Science & Engineering Complex">Science &amp; Engineering Complex</option>
              <option value="Athletics & Recreation Center">Athletics &amp; Recreation Center</option>
              <option value="Humanities Hall">Humanities &amp; Arts Hall</option>
              <option value="Transit Station & Perimeter Bus Stop">Transit Station &amp; Bus Hub</option>
              <option value="General Campus Grounds">General Campus Grounds / Pathway</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              05. SPECIFIC SUB-LOCATION / ROOM
            </label>
            <input
              type="text"
              id="input-specific-area"
              value={specificArea}
              onChange={(e) => setSpecificArea(e.target.value)}
              placeholder="e.g. 2nd Floor study carrel row 12, Table near coffee shop"
              className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-3 py-2 text-xs focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: Public Description */}
        <div>
          <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2 flex items-center justify-between">
            <span>06. PUBLIC DESCRIPTION (VISIBLE IN OPEN LEDGER)</span>
            <span className="text-[10px] text-neutral-500 font-normal">UNRESTRICTED AUDIENCE</span>
          </label>
          <textarea
            id="input-public-description"
            rows={3}
            value={publicDescription}
            onChange={(e) => setPublicDescription(e.target.value)}
            placeholder="Describe general external physical parameters: brand, model, exterior color, general condition. DO NOT disclose secret serial numbers or hidden contents here."
            className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white p-3 text-xs focus:border-black dark:focus:border-white focus:outline-none"
          />
        </div>

        {/* Section 5: HIDDEN IDENTIFIER (CRITICAL ZERO-TRUST FIELD) */}
        <div className="border-2 border-neutral-900 dark:border-white p-4 md:p-6 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase font-bold tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-neutral-900 dark:text-white" />
              07. HIDDEN IDENTIFIER [RESTRICTED // ENCRYPTED ZERO-TRUST ATTRIBUTE]
            </label>
            <span className="bg-neutral-900 dark:bg-white text-white dark:text-black px-1.5 py-0.5 text-[10px] font-bold">
              CLASSIFIED
            </span>
          </div>

          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
            Provide the unalterable ground-truth that only the legitimate owner can verify:
            serial numbers, wallpaper image, lock screen display names, engraved initials, cash denominations, 
            or specific concealed contents.
          </p>

          <textarea
            id="input-hidden-identifier"
            rows={3}
            value={hiddenIdentifier}
            onChange={(e) => setHiddenIdentifier(e.target.value)}
            placeholder="e.g. Serial: C02YF789MD6R. Sticker on bottom has tiny blue astronaut. Contains two $20 bills and expired gym pass."
            className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white p-3 text-xs focus:border-black dark:focus:border-white focus:outline-none"
          />

          <div className="mt-3 flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-2">
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-900 dark:text-white flex-shrink-0" />
            <span>
              SECURITY GUARANTEE: In accordance with our Firestore Security Rules and Next.js middleware, 
              this field is NEVER exposed to unauthenticated public API requests or the public ledger data grid.
            </span>
          </div>
        </div>

        {/* Section 6: Optional Claimant Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              08. DECLARANT / CLAIMANT NAME (OPTIONAL)
            </label>
            <input
              type="text"
              id="input-claimant-name"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              placeholder="Full Legal Name or Student Identifier"
              className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-3 py-2 text-xs focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              09. OFFICIAL CONTACT (OPTIONAL)
            </label>
            <input
              type="text"
              id="input-claimant-contact"
              value={claimantContact}
              onChange={(e) => setClaimantContact(e.target.value)}
              placeholder="Institutional email or phone"
              className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white px-3 py-2 text-xs focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Submission Action */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-neutral-500">
            By submitting, you certify under penalty of administrative suspension that declarations are true and factual.
          </div>
          <button
            type="submit"
            id="btn-submit-ticket"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold uppercase text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'TRANSMITTING DOCKET...' : 'SUBMIT TICKET TO REGISTRY'}
          </button>
        </div>
      </form>
    </div>
  );
};
