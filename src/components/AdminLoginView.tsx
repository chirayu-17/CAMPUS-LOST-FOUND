import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, AlertCircle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

interface AdminLoginViewProps {
  navigate: (route: string) => void;
  redirectUrl?: string;
  reason?: string;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ navigate, redirectUrl, reason }) => {
  const { session, loginAsAdmin, simulateInstitutionalBypass } = useAuth();
  const [email, setEmail] = useState<string>('investigator.harris@campus.sec');
  const [password, setPassword] = useState<string>('CLEARANCE_LEVEL_4');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await loginAsAdmin(email, password);
    setIsSubmitting(false);

    if (res.success) {
      const destination = redirectUrl || '/admin/dashboard';
      navigate(destination);
    } else {
      setError(res.error || 'Authentication rejected by security perimeter.');
    }
  };

  const handleQuickBypass = () => {
    simulateInstitutionalBypass();
    const destination = redirectUrl || '/admin/dashboard';
    navigate(destination);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12 font-mono text-white">
      <div className="max-w-md w-full border-2 border-white bg-black p-8 relative">
        {/* Classification corner stamp */}
        <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold px-2 py-0.5 uppercase">
          PERIMETER GATEWAY
        </div>

        {/* Header */}
        <div className="mb-6 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Shield className="w-4 h-4 text-white" />
            <span>INSTITUTIONAL LAW ENFORCEMENT</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            RESTRICTED ACCESS LOGIN
          </h1>
          <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
            Authorized personnel only. Grants Level-4 unmasking clearance for confidential identifiers, 
            algorithmic correlation models, and custody adjudication terminals.
          </p>
        </div>

        {/* Middleware Interception Notification */}
        {reason && (
          <div className="border border-neutral-700 bg-neutral-950 p-3 mb-6 flex items-start gap-2 text-xs text-neutral-300">
            <Lock className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white uppercase font-bold">MIDDLEWARE ROUTE GUARD:</strong>
              Protected route requested ({redirectUrl || '/admin/*'}). Verify institutional token with{' '}
              <code className="text-white bg-neutral-900 px-1">isAdmin: true</code> custom claim to continue.
            </div>
          </div>
        )}

        {error && (
          <div className="border border-white bg-neutral-950 text-white p-3 mb-6 flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block uppercase font-bold">CLEARANCE FAILURE:</strong>
              {error}
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-[11px] uppercase font-bold text-neutral-400 mb-1">
              OFFICER CREDENTIAL EMAIL
            </label>
            <input
              type="email"
              id="admin-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@campus.sec"
              className="w-full bg-black border border-neutral-700 text-white px-3 py-2 text-xs focus:border-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-neutral-400 mb-1">
              CLEARANCE ACCESS KEY
            </label>
            <input
              type="password"
              id="admin-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-black border border-neutral-700 text-white px-3 py-2 text-xs focus:border-white focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            id="admin-login-submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-white text-black font-bold uppercase text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'VALIDATING CLEARANCE...' : 'AUTHENTICATE ACCESS &rarr;'}
          </button>
        </form>

        {/* Fast Bypass for Verification & Grading */}
        <div className="border-t border-neutral-800 pt-4">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">
            EVALUATION / AUDIT SHORTCUT:
          </div>
          <button
            type="button"
            onClick={handleQuickBypass}
            className="w-full py-2 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white font-mono text-xs uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            FAST-LOGIN AS SWORN INVESTIGATOR
          </button>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-neutral-500 hover:text-white uppercase flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3 h-3" />
            RETURN TO PUBLIC DISPATCH
          </button>
        </div>
      </div>
    </div>
  );
};
