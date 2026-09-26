import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Item, ClaimVerificationAnswer } from '../types';

interface ClaimModalProps {
  foundItem: Item;
  lostItem?: Item;
  onClose: () => void;
  onSubmitClaim: (claimData: {
    foundItemId: string;
    lostItemId: string;
    claimantName: string;
    claimantContact: string;
    answers: ClaimVerificationAnswer[];
  }) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  foundItem,
  lostItem,
  onClose,
  onSubmitClaim,
}) => {
  const [claimantName, setClaimantName] = useState(lostItem?.reporter.name || '');
  const [claimantContact, setClaimantContact] = useState(lostItem?.reporter.contact || '');

  // Initialize questions
  const defaultQuestions = foundItem.verificationQuestions && foundItem.verificationQuestions.length > 0
    ? foundItem.verificationQuestions
    : [
        'What specific scratches, stickers, or distinctive marks are on this item?',
        'Can you describe any unique items or contents attached or inside?'
      ];

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (q: string, value: string) => {
    setAnswers(prev => ({ ...prev, [q]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedAnswers: ClaimVerificationAnswer[] = defaultQuestions.map(q => ({
      question: q,
      answer: answers[q] || 'Not answered'
    }));

    onSubmitClaim({
      foundItemId: foundItem.id,
      lostItemId: lostItem ? lostItem.id : '',
      claimantName: claimantName || 'Anonymous Claimant',
      claimantContact: claimantContact || 'contact@campus.edu',
      answers: formattedAnswers
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div 
        id="claim-modal"
        className="bg-white dark:bg-[#0a0a0a] rounded-t-3xl sm:rounded-2xl max-w-xl w-full shadow-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[90vh] text-black dark:text-white"
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden mobile-drag-handle bg-neutral-400 dark:bg-neutral-600 shrink-0" />
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-100 dark:bg-neutral-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-black text-white dark:bg-white dark:text-black rounded-lg">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-black text-black dark:text-white">
                Ownership Verification Challenge
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                Claiming Custody Item #{foundItem.id} ({foundItem.title})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Anti-Fraud Notice */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-start space-x-2.5 text-black dark:text-white">
            <Lock className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5 stroke-[2.2]" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-black text-black dark:text-white">Anti-Fraud Security Policy:</strong> In accordance with campus and public facility protocols,
              please answer these specific blind verification questions. Your responses will be matched against
              intake custody records before physical handover.
            </div>
          </div>

          {/* Claimant Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-black dark:text-white mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="e.g. Maya Chen"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-black text-black dark:text-white mb-1">Contact Email / Phone *</label>
              <input
                type="text"
                required
                value={claimantContact}
                onChange={(e) => setClaimantContact(e.target.value)}
                placeholder="e.g. mchen@campus.edu"
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Dynamic Verification Questions */}
          <div className="space-y-4">
            <h4 className="font-black text-black dark:text-white text-xs flex items-center">
              <HelpCircle className="w-4 h-4 mr-1 text-black dark:text-white stroke-[2.2]" />
              Item Identity Questions
            </h4>

            {defaultQuestions.map((question, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 space-y-2">
                <label className="block font-black text-black dark:text-white text-xs">
                  {idx + 1}. {question}
                </label>
                <textarea
                  rows={2}
                  required
                  value={answers[question] || ''}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                  placeholder="Provide exact details only known to the rightful owner..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-black dark:text-white font-medium focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-hidden text-xs"
                />
              </div>
            ))}
          </div>

          {/* Submission confirmation */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
              Handover requires official photo ID verification at desk.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-black text-white bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Submit Verification Claim
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
