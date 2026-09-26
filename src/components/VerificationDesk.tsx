import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Lock, 
  User, 
  FileText, 
  Key, 
  Check, 
  X,
  History,
  Archive
} from 'lucide-react';
import { Claim, Item } from '../types';

interface VerificationDeskProps {
  claims: Claim[];
  items: Item[];
  onVerifyClaim: (claimId: string, status: 'approved' | 'rejected', notes: string) => void;
}

export const VerificationDesk: React.FC<VerificationDeskProps> = ({
  claims,
  items,
  onVerifyClaim,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id || null);
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');

  const selectedClaim = claims.find(c => c.id === selectedClaimId);
  const matchedFoundItem = selectedClaim ? items.find(i => i.id === selectedClaim.foundItemId) : null;
  const matchedLostItem = selectedClaim ? items.find(i => i.id === selectedClaim.lostItemId) : null;

  const filteredClaims = claims.filter(c => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return c.status === 'pending';
    if (filterStatus === 'completed') return c.status === 'approved' || c.status === 'completed';
    if (filterStatus === 'rejected') return c.status === 'rejected';
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-300 dark:border-neutral-800 shadow-xs overflow-hidden flex flex-col text-black dark:text-white">
      {/* Desk Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-black text-black dark:text-white">
              Security Custody & Anti-Fraud Verification Desk
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
              Review claimant proofs, compare secret intake verification records, and execute custody handovers.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black p-0.5 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md font-black transition-colors cursor-pointer ${
              filterStatus === 'all' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            All ({claims.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-md font-black transition-colors cursor-pointer ${
              filterStatus === 'pending' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-md font-black transition-colors cursor-pointer ${
              filterStatus === 'completed' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1 rounded-md font-black transition-colors cursor-pointer ${
              filterStatus === 'rejected' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Main Verification Layout: Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Left Side: Claims List */}
        <div className="lg:col-span-4 border-r border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 max-h-[580px] overflow-y-auto">
          {filteredClaims.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs font-bold">
              No claims in this category.
            </div>
          ) : (
            filteredClaims.map(claim => {
              const item = items.find(i => i.id === claim.foundItemId);
              const isSelected = claim.id === selectedClaimId;

              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-neutral-100 dark:bg-neutral-900 border-l-4 border-black dark:border-white' 
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-black dark:text-white">{claim.id}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700">
                      {claim.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-black dark:text-white line-clamp-1">
                    {item?.title || 'Unknown Item'}
                  </h4>

                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 flex items-center justify-between font-semibold">
                    <span>Claimant: {claim.claimantName}</span>
                    <span>{new Date(claim.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Verification Review Panel */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between bg-neutral-50/50 dark:bg-[#000000]/50">
          {selectedClaim && matchedFoundItem ? (
            <div className="space-y-6">
              {/* Claim Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-black dark:text-white">
                      Claim Investigation: {selectedClaim.id}
                    </h3>
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      (Filed {new Date(selectedClaim.timestamp).toLocaleDateString()})
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5 font-medium">
                    Target Custody Item: <strong className="font-black text-black dark:text-white">{matchedFoundItem.title}</strong> (#{matchedFoundItem.id})
                  </p>
                </div>

                <div className="text-xs bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-semibold">
                  Storage Bin: <strong className="font-black font-mono">{matchedFoundItem.storageLocation || 'Intake Shelf'}</strong>
                </div>
              </div>

              {/* Claimant Information Card */}
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                  Claimant Identity & Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-600 dark:text-neutral-400 block font-semibold">Claimant Name:</span>
                    <span className="font-black text-black dark:text-white">{selectedClaim.claimantName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600 dark:text-neutral-400 block font-semibold">Contact Info:</span>
                    <span className="font-black text-black dark:text-white">{selectedClaim.claimantContact}</span>
                  </div>
                </div>
              </div>

              {/* Verification Answers Comparison Panel */}
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-300 dark:border-neutral-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center">
                  <Key className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                  Claimant Verification Answers vs Secure Custody Records
                </h4>

                {/* Secret Intake Notes (Only visible to security desk officer) */}
                {matchedFoundItem.secretVerificationDetails && (
                  <div className="p-3 bg-neutral-100 dark:bg-black rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs">
                    <div className="flex items-center text-black dark:text-white font-black mb-1">
                      <Lock className="w-3.5 h-3.5 mr-1.5 text-black dark:text-white stroke-[2.2]" />
                      Confidential Intake Ground Truth (Set by Finder/Officer):
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200 font-mono italic">
                      "{matchedFoundItem.secretVerificationDetails}"
                    </p>
                  </div>
                )}

                {/* Question & Answer List */}
                <div className="space-y-3">
                  {selectedClaim.answers && selectedClaim.answers.length > 0 ? (
                    selectedClaim.answers.map((qa, index) => (
                      <div key={index} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-xs">
                        <span className="font-bold text-black dark:text-white block mb-1">
                          Question #{index + 1}: {qa.question}
                        </span>
                        <div className="text-black dark:text-white bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-300 dark:border-neutral-700 font-medium">
                          Claimant Response: <span className="font-bold">{qa.answer}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-neutral-500 italic">
                      No question answers logged for this claim.
                    </div>
                  )}
                </div>
              </div>

              {/* Custody Audit Trail */}
              <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-300 dark:border-neutral-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center mb-3">
                  <History className="w-3.5 h-3.5 mr-1 text-black dark:text-white stroke-[2.2]" />
                  Item Chain of Custody History
                </h4>
                <div className="space-y-2">
                  {matchedFoundItem.custodyLog.map(log => (
                    <div key={log.id} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start space-x-2 pb-1.5 border-b border-neutral-200 dark:border-neutral-800 last:border-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mt-1.5 shrink-0" />
                      <div>
                        <span className="font-black text-black dark:text-white">{log.action}</span>
                        <span className="text-neutral-500"> — {log.actor} ({new Date(log.timestamp).toLocaleDateString()})</span>
                        <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">{log.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Box if Pending */}
              {selectedClaim.status === 'pending' && (
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 space-y-3">
                  <h4 className="text-xs font-black text-black dark:text-white flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1 text-black dark:text-white stroke-[2.2]" />
                    Officer Adjudication & Decision
                  </h4>

                  <input
                    type="text"
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    placeholder="Enter officer notes or photo ID verification code (e.g., 'Student ID verified in person by Officer Ross')..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />

                  <div className="flex items-center space-x-3 pt-1">
                    <button
                      id="approve-claim-btn"
                      onClick={() => onVerifyClaim(selectedClaim.id, 'approved', officerNotes)}
                      className="px-4 py-2 text-xs font-black rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-colors flex items-center cursor-pointer"
                    >
                      <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                      Approve & Release Custody
                    </button>

                    <button
                      id="reject-claim-btn"
                      onClick={() => onVerifyClaim(selectedClaim.id, 'rejected', officerNotes || 'Verification answers did not match')}
                      className="px-4 py-2 text-xs font-black rounded-lg bg-neutral-200 text-black hover:bg-neutral-300 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700 border border-neutral-400 dark:border-neutral-600 shadow-sm transition-colors flex items-center cursor-pointer"
                    >
                      <X className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                      Reject Fraudulent / Mismatched Claim
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 text-neutral-500 text-xs font-bold">
              Select a claim on the left to review verification data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
