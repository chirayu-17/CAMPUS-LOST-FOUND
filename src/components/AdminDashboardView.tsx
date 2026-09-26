import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketStore';
import { Ticket, TicketStatus } from '../types/ticket';
import { Shield, Lock, Eye, AlertTriangle, ArrowRight, UserCheck, RefreshCw, FileText, CheckCircle2, RotateCcw } from 'lucide-react';

interface AdminDashboardViewProps {
  navigate: (route: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ navigate }) => {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      return ticketService.getAdminTickets(session);
    } catch {
      return [];
    }
  });

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [inspectedTicket, setInspectedTicket] = useState<Ticket | null>(null);

  const reloadTickets = () => {
    try {
      setTickets(ticketService.getAdminTickets(session));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetFactory = () => {
    if (confirm('RE-INITIALIZE REGISTRY TO BASE SEED STATE?')) {
      ticketService.resetToFactorySeed();
      reloadTickets();
    }
  };

  // Extract tickets with high algorithmic match confidence
  const matchedPairs = tickets.filter(t => t.match_confidence && t.match_confidence >= 70);

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono text-white min-h-[calc(100vh-120px)]">
      {/* Top Officer Status Header */}
      <div className="border-b-2 border-white pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Shield className="w-4 h-4 text-white" />
            <span>COMMAND PERIMETER &bull; CLEARANCE LEVEL: TIER-4 ADMIN</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            INSTITUTIONAL EVIDENCE COMMAND CENTER
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Zero-Trust override active for Officer <strong className="text-white">{session.officerBadge}</strong> ({session.officerEmail}). 
            Confidential hidden identifiers unmasked; multi-vector correlation matrix visible.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={reloadTickets}
            className="px-3 py-2 border border-neutral-700 hover:border-white text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            SYNC DOCKETS
          </button>
          <button
            onClick={handleResetFactory}
            className="px-3 py-2 border border-neutral-800 text-neutral-400 hover:text-white text-xs uppercase flex items-center gap-1.5 transition-colors"
            title="Reset dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            FACTORY SEED
          </button>
        </div>
      </div>

      {/* SECTION 1: ALGORITHMIC MATCH CONFIDENCE MATRIX */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              ALGORITHMIC MATCH CONFIDENCE MATRIX (MULTI-VECTOR CORRELATIONS)
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 uppercase">
            {matchedPairs.length} CORRELATIONS DETECTED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedPairs.map((ticket) => {
            const complement = tickets.find(t => t.id === ticket.matched_ticket_id);
            return (
              <div 
                key={ticket.id} 
                className="border-2 border-white bg-neutral-950 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-black font-black text-xs px-2 py-0.5 uppercase">
                        {ticket.match_confidence}% MATCH CONFIDENCE
                      </span>
                      <span className="text-xs text-neutral-400">
                        {ticket.id} &harr; {ticket.matched_ticket_id}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase border border-neutral-700 px-1.5 py-0.5">
                      [{ticket.status}]
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="border border-neutral-800 p-2.5 bg-black">
                      <div className="text-[10px] text-neutral-500 uppercase font-bold">
                        [{ticket.type.toUpperCase()}] {ticket.id}
                      </div>
                      <div className="text-white font-bold truncate mt-0.5">{ticket.public_description}</div>
                      <div className="text-[11px] text-neutral-400 mt-1">Zone: {ticket.location_zone}</div>
                    </div>

                    <div className="border border-neutral-800 p-2.5 bg-black">
                      <div className="text-[10px] text-neutral-500 uppercase font-bold">
                        [{complement?.type.toUpperCase() || 'COMPLEMENT'}] {ticket.matched_ticket_id}
                      </div>
                      <div className="text-white font-bold truncate mt-0.5">
                        {complement?.public_description || 'Correlating ticket in vault'}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Zone: {complement?.location_zone || 'Campus'}
                      </div>
                    </div>
                  </div>

                  {/* UNMASKED HIDDEN IDENTIFIER INSPECTION */}
                  <div className="border border-neutral-700 p-2.5 bg-black text-xs mb-4">
                    <div className="text-[10px] text-neutral-400 uppercase font-bold flex items-center gap-1 mb-1">
                      <Eye className="w-3 h-3 text-white" />
                      UNMASKED GROUND TRUTH (SECURITY OFFICER CLEARANCE):
                    </div>
                    <div className="text-white text-[11px] leading-relaxed bg-neutral-900/80 p-2 border-l-2 border-white">
                      {ticket.hidden_identifier}
                    </div>
                  </div>
                </div>

                {/* Handover action */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">
                    STATUS: READY FOR CLAIMANT VERIFICATION
                  </span>
                  <button
                    onClick={() => navigate(`/admin/interrogation/${ticket.id}`)}
                    className="px-4 py-2 bg-white text-black font-bold uppercase text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    LAUNCH BLIND INTERROGATION &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MASTER TICKETS DIRECTORY (WITH UNMASKED HIDDEN IDENTIFIER) */}
      <div className="border-t border-neutral-800 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              ALL TICKETS MASTER DIRECTORY (UNMASKED VIEW)
            </h2>
            <p className="text-xs text-neutral-400">
              Complete inventory with unredacted hidden identifiers, claimant profiles, and custody audit logs.
            </p>
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'active', 'potential_match', 'in_custody', 'under_interrogation', 'restituted', 'flagged'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase border transition-colors ${
                  statusFilter === st
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Master Table */}
        <div className="border-2 border-neutral-800 bg-black overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-neutral-700 bg-neutral-950 font-mono text-neutral-400 uppercase tracking-wider text-[11px]">
                <th className="p-3 border-r border-neutral-800 w-28">DOCKET ID</th>
                <th className="p-3 border-r border-neutral-800 w-20">CLASS</th>
                <th className="p-3 border-r border-neutral-800 w-28">STATUS</th>
                <th className="p-3 border-r border-neutral-800 w-28">MATCH SCORE</th>
                <th className="p-3 border-r border-neutral-800 w-40">LOCATION</th>
                <th className="p-3 border-r border-neutral-800">PUBLIC DESCRIPTION</th>
                <th className="p-3 border-r border-neutral-800 bg-neutral-900/60 w-64">
                  <span className="text-white font-bold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-white" />
                    UNMASKED HIDDEN IDENTIFIER
                  </span>
                </th>
                <th className="p-3 w-36 text-right">CUSTODY ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-neutral-950 transition-colors">
                  <td className="p-3 border-r border-neutral-800 font-mono font-bold text-white whitespace-nowrap">
                    {ticket.id}
                  </td>
                  <td className="p-3 border-r border-neutral-800 whitespace-nowrap">
                    <span className="border border-neutral-700 px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      {ticket.type}
                    </span>
                  </td>
                  <td className="p-3 border-r border-neutral-800 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      ticket.status === 'restituted' ? 'bg-neutral-800 text-white' :
                      ticket.status === 'flagged' ? 'bg-neutral-900 text-white border border-white' :
                      ticket.status === 'in_custody' ? 'bg-white text-black' :
                      'text-neutral-300'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3 border-r border-neutral-800 font-bold whitespace-nowrap">
                    {ticket.match_confidence ? (
                      <span className="text-white bg-neutral-900 border border-neutral-700 px-1.5 py-0.5">
                        {ticket.match_confidence}%
                      </span>
                    ) : (
                      <span className="text-neutral-600">--</span>
                    )}
                  </td>
                  <td className="p-3 border-r border-neutral-800 text-neutral-300 text-[11px]">
                    {ticket.location_zone}
                  </td>
                  <td className="p-3 border-r border-neutral-800 text-neutral-300 max-w-xs truncate">
                    {ticket.public_description}
                  </td>
                  {/* REVEALED HIDDEN IDENTIFIER IN PLAINTEXT */}
                  <td className="p-3 border-r border-neutral-800 bg-neutral-950 font-mono text-[11px] text-white">
                    <div className="line-clamp-2" title={ticket.hidden_identifier}>
                      {ticket.hidden_identifier}
                    </div>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => navigate(`/admin/interrogation/${ticket.id}`)}
                      className="px-2 py-1 bg-white text-black font-bold uppercase text-[10px] hover:bg-neutral-200"
                    >
                      INTERROGATE
                    </button>
                    <button
                      onClick={() => setInspectedTicket(ticket)}
                      className="px-2 py-1 border border-neutral-700 text-neutral-400 hover:text-white uppercase text-[10px]"
                    >
                      DOSSIER
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Dossier Inspector Modal */}
      {inspectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-black border-2 border-white max-w-3xl w-full p-6 text-white font-mono max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div>
                <span className="text-xs text-neutral-500 uppercase">CLASSIFIED CUSTODY DOSSIER</span>
                <h2 className="text-2xl font-black">{inspectedTicket.id} // {inspectedTicket.status.toUpperCase()}</h2>
              </div>
              <button
                onClick={() => setInspectedTicket(null)}
                className="px-2.5 py-1 border border-neutral-700 text-neutral-400 hover:text-white uppercase text-xs"
              >
                CLOSE [X]
              </button>
            </div>

            <div className="space-y-4 text-xs mb-6">
              <div className="border border-neutral-800 p-4 bg-neutral-950">
                <div className="text-neutral-500 text-[10px] uppercase font-bold mb-1">
                  UNMASKED CONFIDENTIAL IDENTIFIER:
                </div>
                <div className="p-3 bg-black border border-white text-white text-xs leading-relaxed">
                  {inspectedTicket.hidden_identifier}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-neutral-800 p-3 bg-neutral-950">
                  <span className="text-neutral-500 block text-[10px] uppercase">CLAIMANT PROFILE:</span>
                  <span className="text-white font-bold">{inspectedTicket.claimant_name || 'UNSPECIFIED'}</span>
                  <span className="text-neutral-400 block mt-1">{inspectedTicket.claimant_contact || 'No contact on file'}</span>
                </div>
                <div className="border border-neutral-800 p-3 bg-neutral-950">
                  <span className="text-neutral-500 block text-[10px] uppercase">ASSIGNED OFFICER:</span>
                  <span className="text-white font-bold">{inspectedTicket.custody_officer || 'UNASSIGNED'}</span>
                  <span className="text-neutral-400 block mt-1">Audit Entries: {inspectedTicket.custody_audit_log.length}</span>
                </div>
              </div>

              <div>
                <div className="text-neutral-500 text-[10px] uppercase font-bold mb-1">
                  IMMUTABLE CUSTODY AUDIT LOG:
                </div>
                <div className="border border-neutral-800 divide-y divide-neutral-900 bg-neutral-950">
                  {inspectedTicket.custody_audit_log.map((log) => (
                    <div key={log.id} className="p-2.5 flex items-start justify-between gap-4">
                      <div>
                        <span className="font-bold text-white mr-2">[{log.action}]</span>
                        <span className="text-neutral-300">{log.notes}</span>
                      </div>
                      <div className="text-right text-[10px] text-neutral-500 whitespace-nowrap">
                        <div>{log.officerBadge}</div>
                        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
              <button
                onClick={() => {
                  const id = inspectedTicket.id;
                  setInspectedTicket(null);
                  navigate(`/admin/interrogation/${id}`);
                }}
                className="px-6 py-2.5 bg-white text-black font-bold uppercase text-xs hover:bg-neutral-200"
              >
                OPEN CUSTODY INTERROGATION TERMINAL &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
