import React, { useState, useMemo } from 'react';
import { ticketService } from '../services/ticketStore';
import { Ticket, TicketType, TicketCategory } from '../types/ticket';
import { Search, Lock, ShieldAlert, ArrowLeft, Filter, RefreshCw, EyeOff, ShieldCheck } from 'lucide-react';

interface LedgerViewProps {
  navigate: (route: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ navigate }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => ticketService.getPublicLedger());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedType !== 'ALL' && t.type !== selectedType) return false;
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.id.toLowerCase().includes(q);
        const matchDesc = t.public_description.toLowerCase().includes(q);
        const matchZone = t.location_zone.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchZone && !matchCat) return false;
      }
      return true;
    });
  }, [tickets, selectedType, selectedCategory, searchQuery]);

  const handleRefresh = () => {
    setTickets(ticketService.getPublicLedger());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono text-white min-h-[calc(100vh-120px)]">
      {/* Navigation breadcrumbs */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          RETURN TO DISPATCH
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="w-2 h-2 bg-white" />
          <span>ZERO-TRUST PUBLIC PROJECTION ACTIVE</span>
        </div>
      </div>

      {/* Main Stark Header */}
      <div className="border-b border-neutral-800 pb-6 mb-6">
        <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
          OFFICIAL PUBLIC LEDGER // TITLE &amp; CUSTODY DOCKETS
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              PUBLIC EVIDENCE LEDGER
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Public registry of active lost declarations and recovered physical property. 
              Sensitive attributes, serial codes, and match correlations are quarantined and masked 
              to prevent fraudulent claimant interception.
            </p>
          </div>

          <button
            onClick={() => navigate('/report')}
            className="px-4 py-2 bg-white text-black font-bold uppercase text-xs hover:bg-neutral-200 transition-colors whitespace-nowrap"
          >
            + LODGE NEW TICKET
          </button>
        </div>
      </div>

      {/* Zero-Trust Security Alert Bar */}
      <div className="border border-neutral-800 bg-neutral-950 p-3 mb-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <Lock className="w-3.5 h-3.5 text-white" />
          <span>
            HEAVILY MASKED VIEW: Hidden identifiers are redacted. Only unmasked during in-person 
            custodial interrogation by verified officers.
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
          title="Reload ledger"
        >
          <RefreshCw className="w-3 h-3" />
          SYNC
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="border border-neutral-800 bg-black p-4 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="ledger-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BY DOCKET ID, KEYWORDS, ZONE, OR CATEGORY..."
              className="w-full bg-black border border-neutral-700 text-white pl-9 pr-3 py-2 text-xs focus:border-white focus:outline-none placeholder:text-neutral-600"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 w-full md:w-auto">
            {['ALL', 'lost', 'found'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex-1 md:flex-none px-3 py-2 text-xs font-bold uppercase border transition-colors ${
                  selectedType === t
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'ALL CLASSES' : t === 'lost' ? '[LOST]' : '[FOUND]'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48 bg-black border border-neutral-700 text-white px-3 py-2 text-xs focus:border-white focus:outline-none uppercase"
            >
              <option value="ALL">ALL TAXONOMIES</option>
              <option value="electronics">ELECTRONICS</option>
              <option value="credentials_ids">CREDENTIALS &amp; IDS</option>
              <option value="valuables_wallets">VALUABLES &amp; WALLETS</option>
              <option value="keys_access">KEYS &amp; FOBS</option>
              <option value="apparel">APPAREL</option>
              <option value="stationery_books">BOOKS &amp; STATIONERY</option>
              <option value="personal_belongings">PERSONAL ITEMS</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
          <span>SHOWING {filteredTickets.length} OF {tickets.length} ACTIVE DOCKETS</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-neutral-400 hover:text-white underline"
            >
              CLEAR QUERY
            </button>
          )}
        </div>
      </div>

      {/* Stark Utilitarian Public Data Grid */}
      <div className="border-2 border-neutral-800 bg-black overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-neutral-700 bg-neutral-950 font-mono text-neutral-400 uppercase tracking-wider text-[11px]">
              <th className="p-3 border-r border-neutral-800 w-32">DOCKET ID</th>
              <th className="p-3 border-r border-neutral-800 w-24">CLASS</th>
              <th className="p-3 border-r border-neutral-800 w-36">CATEGORY</th>
              <th className="p-3 border-r border-neutral-800 w-28">DATE</th>
              <th className="p-3 border-r border-neutral-800 w-44">LOCATION ZONE</th>
              <th className="p-3 border-r border-neutral-800">PUBLIC DESCRIPTION</th>
              <th className="p-3 border-r border-neutral-800 w-52 bg-neutral-950/80">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <Lock className="w-3 h-3 text-white" />
                  HIDDEN IDENTIFIER
                </span>
              </th>
              <th className="p-3 w-28 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-neutral-500 font-mono">
                  NO TICKETS MATCHING SPECIFIED CRITERIA.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-neutral-950/70 transition-colors group cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <td className="p-3 border-r border-neutral-800 font-mono font-bold text-white whitespace-nowrap">
                    {ticket.id}
                  </td>
                  <td className="p-3 border-r border-neutral-800 whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                        ticket.type === 'lost'
                          ? 'border-neutral-500 text-neutral-300'
                          : 'border-white bg-white text-black'
                      }`}
                    >
                      {ticket.type === 'lost' ? 'LOST' : 'FOUND'}
                    </span>
                  </td>
                  <td className="p-3 border-r border-neutral-800 uppercase text-neutral-300 whitespace-nowrap">
                    {ticket.category.replace('_', ' ')}
                  </td>
                  <td className="p-3 border-r border-neutral-800 text-neutral-400 whitespace-nowrap">
                    {ticket.date}
                  </td>
                  <td className="p-3 border-r border-neutral-800 text-neutral-300">
                    {ticket.location_zone}
                  </td>
                  <td className="p-3 border-r border-neutral-800 text-neutral-300 max-w-xs truncate">
                    {ticket.public_description}
                  </td>
                  {/* HEAVILY MASKED HIDDEN IDENTIFIER CELL */}
                  <td className="p-3 border-r border-neutral-800 bg-neutral-950/40">
                    <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] uppercase tracking-wider font-mono">
                      <Lock className="w-3 h-3 text-neutral-500" />
                      <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 font-bold">
                        [REDACTED // RESTRICTED ACCESS]
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticket);
                      }}
                      className="px-2.5 py-1 border border-neutral-700 text-neutral-300 hover:border-white hover:text-white uppercase text-[10px] font-bold"
                    >
                      INSPECT
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Inspector for Individual Docket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-none">
          <div className="bg-black border-2 border-white max-w-2xl w-full p-6 text-white font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-widest block">
                  PUBLIC DOCKET INSPECTION RECORD
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {selectedTicket.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-2.5 py-1 border border-neutral-700 text-neutral-400 hover:border-white hover:text-white text-xs font-bold uppercase"
              >
                CLOSE [X]
              </button>
            </div>

            <div className="space-y-4 text-xs mb-6">
              <div className="grid grid-cols-2 gap-4 border border-neutral-800 p-4 bg-neutral-950">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">DECLARATION CLASS:</span>
                  <span className="font-bold text-white uppercase text-sm">
                    [{selectedTicket.type}]
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">TAXONOMY:</span>
                  <span className="font-bold text-white uppercase text-sm">
                    {selectedTicket.category}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">DATE OF INCIDENT:</span>
                  <span className="text-white">{selectedTicket.date}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase">CURRENT STATUS:</span>
                  <span className="text-white uppercase font-bold">[{selectedTicket.status}]</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase mb-1">RECORDED LOCATION:</span>
                <div className="border border-neutral-800 p-3 bg-black text-white">
                  {selectedTicket.location_zone}
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase mb-1">PUBLIC LEDGER DESCRIPTION:</span>
                <div className="border border-neutral-800 p-3 bg-black text-white leading-relaxed">
                  {selectedTicket.public_description}
                </div>
              </div>

              {/* HEAVILY MASKED SECRET FIELD */}
              <div className="border-2 border-neutral-700 p-4 bg-neutral-950">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-white" />
                    CONFIDENTIAL HIDDEN IDENTIFIER
                  </span>
                  <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 uppercase">
                    ZERO-TRUST SEALED
                  </span>
                </div>
                <div className="p-3 bg-black border border-neutral-800 text-neutral-500 text-xs font-mono select-none flex items-center justify-between">
                  <span>[REDACTED // RESTRICTED ACCESS]</span>
                  <EyeOff className="w-4 h-4 text-neutral-600" />
                </div>
                <p className="text-[10px] text-neutral-400 mt-2 leading-tight">
                  This field contains sensitive proof-of-ownership telemetry. In accordance with zero-trust database policies, 
                  it is masked to prevent fraudulent possession attempts. Physical claimants are challenged blindly by officers.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-neutral-500">
                Believe this belongs to you? Present yourself at Campus Security Precinct with valid ID.
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    navigate('/report');
                  }}
                  className="w-full sm:w-auto px-4 py-2 border border-neutral-700 text-white font-bold uppercase text-xs hover:border-white"
                >
                  LODGE MATCHING TICKET
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
