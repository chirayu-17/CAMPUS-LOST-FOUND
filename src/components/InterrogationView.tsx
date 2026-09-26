import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketStore';
import { Ticket, InterrogationChallenge } from '../types/ticket';
import { Shield, ArrowLeft, Check, X, AlertTriangle, UserCheck, Lock, FileSignature, CheckCircle2 } from 'lucide-react';

interface InterrogationViewProps {
  ticketId: string;
  navigate: (route: string) => void;
}

export const InterrogationView: React.FC<InterrogationViewProps> = ({ ticketId, navigate }) => {
  const { session } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(() => ticketService.getTicketById(ticketId, session));
  const [challengeResults, setChallengeResults] = useState<Record<string, 'pass' | 'fail' | 'pending'>>({});
  const [claimantResponses, setClaimantResponses] = useState<Record<string, string>>({});
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [adjudicationSuccess, setAdjudicationSuccess] = useState<string | null>(null);

  useEffect(() => {
    const t = ticketService.getTicketById(ticketId, session);
    setTicket(t);
    if (t) {
      const initial: Record<string, 'pass' | 'fail' | 'pending'> = {};
      t.interrogation_challenges.forEach(c => {
        initial[c.id] = 'pending';
      });
      setChallengeResults(initial);
    }
  }, [ticketId, session]);

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 font-mono text-white text-center">
        <div className="border-2 border-white p-8 bg-black">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-white" />
          <h2 className="text-xl font-bold uppercase mb-2">DOCKET NOT FOUND: {ticketId}</h2>
          <p className="text-xs text-neutral-400 mb-6">
            The requested evidence docket does not exist in the active institutional repository.
          </p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-2 bg-white text-black font-bold uppercase text-xs"
          >
            RETURN TO COMMAND CENTER
          </button>
        </div>
      </div>
    );
  }

  const passedCount = Object.values(challengeResults).filter(v => v === 'pass').length;
  const failedCount = Object.values(challengeResults).filter(v => v === 'fail').length;
  const totalCount = ticket.interrogation_challenges.length;

  const handleSetResult = (challengeId: string, result: 'pass' | 'fail') => {
    setChallengeResults(prev => ({
      ...prev,
      [challengeId]: result
    }));
  };

  const handleAdjudicate = (decision: 'APPROVED_RESTITUTION' | 'REJECTED_DISCREPANCY' | 'FRAUD_FLAGGED') => {
    try {
      const notes = officerNotes.trim() || `Adjudication completed by ${session.officerBadge}. Challenges passed: ${passedCount}/${totalCount}.`;
      const updated = ticketService.adjudicateHandover(ticket.id, decision, notes, session);
      setTicket({ ...updated });
      setAdjudicationSuccess(decision);
    } catch (err: any) {
      alert(err.message || 'Adjudication failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono text-white min-h-[calc(100vh-120px)]">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          RETURN TO COMMAND CENTER
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Shield className="w-3.5 h-3.5 text-white" />
          <span>OFFICER IN ATTENDANCE: {session.officerBadge}</span>
        </div>
      </div>

      {/* Main Terminal Header */}
      <div className="border-b-2 border-white pb-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-500 uppercase tracking-widest">
            DIVISION OF CUSTODY &bull; BLIND ADJUDICATION PROTOCOL
          </div>
          <span className="border border-white bg-white text-black px-2 py-0.5 text-xs font-bold uppercase">
            STATUS: [{ticket.status.toUpperCase()}]
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mt-1">
          CUSTODIAL HANDOVER INTERROGATION: {ticket.id}
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
          Conduct sequential blind question challenges against the claimant. Do NOT reveal the expected ground truth. 
          Record verbal claimant answers and adjudicate title restitution or retain item in evidence locker.
        </p>
      </div>

      {adjudicationSuccess && (
        <div className="border-2 border-white bg-neutral-950 p-6 mb-8 text-white">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-black bg-white px-2 py-1 w-fit mb-3">
            <CheckCircle2 className="w-4 h-4" />
            FORMAL ADJUDICATION RECORDED IN AUDIT LEDGER
          </div>
          <div className="text-xl font-bold uppercase mb-1">
            DECISION VERDICT: {adjudicationSuccess}
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Custody disposition finalized. Status transition to <strong className="text-white">[{ticket.status}]</strong> completed.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-2 bg-white text-black font-bold uppercase text-xs hover:bg-neutral-200"
            >
              RETURN TO COMMAND CENTER &rarr;
            </button>
            <button
              onClick={() => navigate('/ledger')}
              className="px-6 py-2 border border-neutral-700 text-white font-bold uppercase text-xs hover:border-white"
            >
              INSPECT IN PUBLIC LEDGER
            </button>
          </div>
        </div>
      )}

      {/* Grid: 3 Column Utilitarian Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMN 1: EVIDENCE GROUND TRUTH (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-2 border-neutral-700 bg-black p-5">
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-neutral-800 pb-2">
              <Lock className="w-3.5 h-3.5 text-white" />
              EVIDENCE GROUND TRUTH (CONFIDENTIAL)
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">TAXONOMY / CLASS:</span>
                <span className="text-white font-bold uppercase">[{ticket.type}] &bull; {ticket.category}</span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">INCIDENT LOCATION / ZONE:</span>
                <span className="text-white">{ticket.location_zone}</span>
                <span className="text-neutral-400 block text-[11px] mt-0.5">{ticket.specific_area}</span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">PUBLIC DESCRIPTION:</span>
                <p className="text-neutral-300 leading-relaxed bg-neutral-950 p-2.5 border border-neutral-800 mt-1">
                  {ticket.public_description}
                </p>
              </div>

              {/* UNMASKED HIDDEN IDENTIFIER */}
              <div className="border-2 border-white p-3 bg-neutral-950">
                <span className="text-[10px] font-bold text-white uppercase block mb-1">
                  &bull; CONFIDENTIAL UNMASKED IDENTIFIER &bull;
                </span>
                <div className="text-xs font-mono text-white leading-relaxed p-2 bg-black border border-neutral-700">
                  {ticket.hidden_identifier}
                </div>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Verify claimant responses against this ground truth.
                </span>
              </div>

              <div>
                <span className="text-neutral-500 block text-[10px] uppercase">REGISTERED CLAIMANT:</span>
                <div className="text-white font-bold">{ticket.claimant_name || 'Walk-in Claimant at Precinct'}</div>
                <div className="text-neutral-400 text-[11px]">{ticket.claimant_contact || 'No prior email on record'}</div>
              </div>
            </div>
          </div>

          {/* Adjudication Scorecard */}
          <div className="border border-neutral-800 bg-neutral-950 p-5">
            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">
              INTERROGATION SCORECARD
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="border border-neutral-800 p-2 bg-black">
                <div className="text-xl font-bold text-white">{passedCount}</div>
                <div className="text-[10px] text-neutral-400 uppercase">CONFIRMED</div>
              </div>
              <div className="border border-neutral-800 p-2 bg-black">
                <div className="text-xl font-bold text-neutral-400">{failedCount}</div>
                <div className="text-[10px] text-neutral-400 uppercase">DISCREPANCY</div>
              </div>
              <div className="border border-neutral-800 p-2 bg-black">
                <div className="text-xl font-bold text-neutral-400">{totalCount - (passedCount + failedCount)}</div>
                <div className="text-[10px] text-neutral-400 uppercase">PENDING</div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 & 3: BLIND QUESTION CHALLENGES & ADJUDICATION TERMINAL (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* CHALLENGES */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold uppercase tracking-tight text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-white" />
                BLIND QUESTION CHALLENGES (PRESENT VERBALLY TO CLAIMANT)
              </h2>
              <span className="text-xs text-neutral-400">
                {totalCount} CHALLENGES REQUIRED
              </span>
            </div>

            <div className="space-y-4">
              {ticket.interrogation_challenges.map((challenge, idx) => {
                const currentStatus = challengeResults[challenge.id] || 'pending';
                return (
                  <div
                    key={challenge.id}
                    className={`border-2 p-5 bg-black transition-colors ${
                      currentStatus === 'pass'
                        ? 'border-white'
                        : currentStatus === 'fail'
                        ? 'border-neutral-500'
                        : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="bg-white text-black font-black text-[10px] px-1.5 py-0.5 uppercase">
                        CHALLENGE {idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetResult(challenge.id, 'pass')}
                          className={`px-3 py-1 text-xs font-bold uppercase border transition-colors flex items-center gap-1 ${
                            currentStatus === 'pass'
                              ? 'bg-white text-black border-white'
                              : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          VERIFIED
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetResult(challenge.id, 'fail')}
                          className={`px-3 py-1 text-xs font-bold uppercase border transition-colors flex items-center gap-1 ${
                            currentStatus === 'fail'
                              ? 'bg-neutral-800 text-white border-neutral-400'
                              : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          DISCREPANCY
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-xs font-bold uppercase text-neutral-300 block mb-1">
                        PROMPT FOR STAFF:
                      </label>
                      <p className="text-sm font-bold text-white leading-snug">
                        "{challenge.question}"
                      </p>
                    </div>

                    <div className="border-l-2 border-neutral-700 pl-3 py-1 bg-neutral-950/60 text-xs mb-3">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                        EXPECTED GROUND TRUTH (DO NOT REVEAL TO CLAIMANT):
                      </span>
                      <span className="text-white font-mono text-xs">
                        {challenge.expectedGroundTruth}
                      </span>
                    </div>

                    {/* Claimant verbal note */}
                    <div>
                      <input
                        type="text"
                        placeholder="Transcribe claimant verbal answer..."
                        value={claimantResponses[challenge.id] || ''}
                        onChange={(e) =>
                          setClaimantResponses((prev) => ({
                            ...prev,
                            [challenge.id]: e.target.value,
                          }))
                        }
                        className="w-full bg-neutral-950 border border-neutral-800 text-white px-3 py-1.5 text-xs focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADJUDICATION VERDICT ACTION BAR */}
          <div className="border-2 border-white bg-neutral-950 p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-white mb-2">
              <FileSignature className="w-4 h-4 text-white" />
              FORMAL CUSTODIAL ADJUDICATION
            </div>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Upon reviewing physical credentials and blind challenge answers, record the legal adjudication below. 
              This immediately updates custody status and enters a cryptographic signature in the institutional audit log.
            </p>

            <div className="mb-4">
              <label className="block text-xs uppercase font-bold text-neutral-300 mb-1">
                OFFICER DISPOSITION NOTES / REASONING
              </label>
              <textarea
                rows={2}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="State identification credentials inspected, challenge remarks, and release rationale..."
                className="w-full bg-black border border-neutral-700 text-white p-3 text-xs focus:border-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleAdjudicate('APPROVED_RESTITUTION')}
                className="p-3 bg-white text-black font-black uppercase text-xs hover:bg-neutral-200 transition-colors flex flex-col items-center justify-center text-center border border-white"
              >
                <span>[APPROVE RESTITUTION]</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">Release property to verified owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleAdjudicate('REJECTED_DISCREPANCY')}
                className="p-3 border border-neutral-700 text-white font-bold uppercase text-xs hover:border-white transition-colors flex flex-col items-center justify-center text-center bg-black"
              >
                <span>[DENY CLAIM]</span>
                <span className="text-[10px] text-neutral-400 font-normal mt-0.5">Retain in evidence custody</span>
              </button>

              <button
                type="button"
                onClick={() => handleAdjudicate('FRAUD_FLAGGED')}
                className="p-3 border border-neutral-700 text-neutral-300 font-bold uppercase text-xs hover:border-white hover:text-white transition-colors flex flex-col items-center justify-center text-center bg-black"
              >
                <span>[FLAG SUSPECTED FRAUD]</span>
                <span className="text-[10px] text-neutral-500 font-normal mt-0.5">Quarantine docket for investigation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
