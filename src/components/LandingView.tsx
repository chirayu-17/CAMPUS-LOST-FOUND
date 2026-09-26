import React from 'react';
import { ArrowRight, ShieldAlert, FileText, Database, Lock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketStore';

interface LandingViewProps {
  navigate: (route: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ navigate }) => {
  const { session } = useAuth();
  const allTickets = ticketService.getPublicLedger();
  const activeCount = allTickets.filter(t => t.status === 'active').length;
  const matchCount = allTickets.filter(t => t.status === 'potential_match').length;
  const inCustodyCount = allTickets.filter(t => t.status === 'in_custody' || t.status === 'under_interrogation').length;

  return (
    <div className="min-h-[calc(100vh-100px)] bg-black text-white flex flex-col justify-between">
      {/* Top Banner Notice */}
      <div className="border-b border-neutral-800 bg-neutral-950 px-4 py-2 font-mono text-xs text-neutral-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">[OFFICIAL NOTICE]</span>
          <span>CAMPUS REGULATORY DIRECTIVE #28 // EVIDENCE RETENTION &amp; TITLE ADJUDICATION</span>
        </div>
        <div className="text-neutral-500 hidden sm:block">
          STATUS: ONLINE &bull; INTEGRITY CHECK: PASS
        </div>
      </div>

      {/* Main Core Container */}
      <div className="max-w-6xl mx-auto px-4 py-12 w-full">
        {/* Terminal Header */}
        <div className="mb-12 border-b border-neutral-800 pb-8">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2">
            DEPARTMENT OF PUBLIC SAFETY &bull; CENTRAL REPOSITORY
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-mono mb-4 text-white">
            LOST &amp; FOUND
            <span className="block text-neutral-400">INSTITUTIONAL REGISTRY</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-300 font-mono max-w-3xl leading-relaxed">
            Zero-Trust digital evidence infrastructure for cataloging, algorithmic matching, and 
            blind custodial interrogation of recovered property across all campus facilities.
          </p>
        </div>

        {/* Primary Operational Actions: The Two Required Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Action 1: Report Item */}
          <div 
            id="action-report-item"
            onClick={() => navigate('/report')}
            className="border-2 border-white bg-black hover:bg-neutral-950 p-8 cursor-pointer transition-all duration-150 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-bold text-black bg-white px-2 py-1 tracking-wider uppercase">
                  ACTION 01
                </span>
                <FileText className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
              </div>
              <h2 className="text-2xl font-black uppercase font-mono mb-3 tracking-tight">
                REPORT ITEM
              </h2>
              <p className="text-xs font-mono text-neutral-300 leading-relaxed mb-6">
                Unified frictionless filing. Lodge lost property declarations or report found items 
                without an account. Embeds unalterable <strong className="text-white">hidden identifiers</strong> into 
                the zero-trust evidence locker.
              </p>
            </div>
            
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between font-mono text-xs font-bold">
              <span className="text-white group-hover:underline">OPEN UNIFIED SUBMISSION FORM</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 2: View Public Ledger */}
          <div 
            id="action-view-ledger"
            onClick={() => navigate('/ledger')}
            className="border-2 border-neutral-700 hover:border-white bg-black hover:bg-neutral-950 p-8 cursor-pointer transition-all duration-150 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-bold text-neutral-400 border border-neutral-700 px-2 py-1 tracking-wider uppercase group-hover:border-white group-hover:text-white">
                  ACTION 02
                </span>
                <Database className="w-6 h-6 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
              </div>
              <h2 className="text-2xl font-black uppercase font-mono mb-3 tracking-tight">
                VIEW PUBLIC LEDGER
              </h2>
              <p className="text-xs font-mono text-neutral-300 leading-relaxed mb-6">
                Stark public registry of active items. Sensitive verification keys and match correlations 
                are strictly masked under zero-trust protocols to eliminate fraudulent possession claims.
              </p>
            </div>
            
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between font-mono text-xs font-bold">
              <span className="text-neutral-300 group-hover:text-white group-hover:underline">INSPECT MASKED REGISTRY</span>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Telemetry & Statistical Matrix */}
        <div className="border border-neutral-800 p-6 bg-neutral-950/60 mb-12">
          <div className="font-mono text-xs text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white" />
            REGISTRY DOCKET STATUS &bull; REAL-TIME METRICS
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono">
            <div className="border-l-2 border-neutral-700 pl-4">
              <div className="text-2xl font-black text-white">{allTickets.length}</div>
              <div className="text-xs text-neutral-400 uppercase">TOTAL LOGGED TICKETS</div>
            </div>
            <div className="border-l-2 border-neutral-700 pl-4">
              <div className="text-2xl font-black text-white">{activeCount}</div>
              <div className="text-xs text-neutral-400 uppercase">ACTIVE SEARCHES</div>
            </div>
            <div className="border-l-2 border-neutral-700 pl-4">
              <div className="text-2xl font-black text-white">{matchCount}</div>
              <div className="text-xs text-neutral-400 uppercase">ALGORITHMIC MATCHES</div>
            </div>
            <div className="border-l-2 border-neutral-700 pl-4">
              <div className="text-2xl font-black text-white">{inCustodyCount}</div>
              <div className="text-xs text-neutral-400 uppercase">IN SECURE CUSTODY</div>
            </div>
          </div>
        </div>

        {/* Protected Command Center Access Callout */}
        <div className="border border-neutral-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>RESTRICTED PERIMETER // INSTITUTIONAL SECURITY OFFICERS</span>
            </div>
            <h3 className="text-base font-bold uppercase font-mono text-white mb-1">
              LAW ENFORCEMENT &amp; EVIDENCE COMMAND CENTER
            </h3>
            <p className="text-xs font-mono text-neutral-400">
              Authorized personnel access to unmasked ground-truth identifiers, algorithmic match confidence matrices, 
              and blind claimant interrogation terminals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {session.isAdmin ? (
              <button
                id="btn-landing-to-dashboard"
                onClick={() => navigate('/admin/dashboard')}
                className="px-5 py-2.5 bg-white text-black font-mono text-xs font-bold uppercase hover:bg-neutral-200 transition-colors"
              >
                ENTER COMMAND CENTER &rarr;
              </button>
            ) : (
              <button
                id="btn-landing-to-login"
                onClick={() => navigate('/admin/login')}
                className="px-5 py-2.5 border border-white text-white font-mono text-xs font-bold uppercase hover:bg-white hover:text-black transition-colors"
              >
                OFFICER CLEARANCE LOGIN &rarr;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Utilitarian Regulatory Footer */}
      <footer className="border-t border-neutral-800 px-4 py-4 font-mono text-[11px] text-neutral-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            SECURITY STANDARD: ZERO-TRUST PROJECTION &bull; STATUTE OF FRAUD PENALTY: TITLE 18 &sect; 1001
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>FIRESTORE RULES: ENFORCED</span>
            <span>MIDDLEWARE: ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
