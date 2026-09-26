import React from 'react';
import { 
  Activity, 
  Sparkles, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { ActivityEvent } from '../types';

interface ActivityTickerProps {
  events: ActivityEvent[];
}

export const ActivityTicker: React.FC<ActivityTickerProps> = ({ events }) => {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200/90 dark:border-neutral-800/90 p-4 shadow-2xs text-neutral-900 dark:text-neutral-100">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200/90 dark:border-neutral-800/90">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white animate-ping" />
          <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1 text-neutral-900 dark:text-white stroke-[2.2]" />
            Live Public Space Activity Stream
          </h3>
        </div>
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono font-bold">Real-Time Event Bus</span>
      </div>

      <div className="space-y-2.5 max-h-48 overflow-y-auto">
        {events.slice(0, 6).map((evt) => {
          return (
            <div 
              key={evt.id} 
              className="p-2.5 rounded-xl text-xs flex items-start space-x-2.5 transition-all bg-neutral-50/80 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            >
              <div className="mt-0.5 shrink-0">
                {evt.type === 'match_detected' ? (
                  <Sparkles className="w-3.5 h-3.5 text-neutral-900 dark:text-white stroke-[2.2]" />
                ) : evt.type === 'claim_submitted' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-900 dark:text-white stroke-[2.2]" />
                ) : evt.type === 'item_returned' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-white stroke-[2.2]" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-neutral-900 dark:text-white stroke-[2.2]" />
                )}
              </div>

              <div className="flex-1">
                <p className="line-clamp-2 leading-relaxed text-[11px] font-semibold">{evt.description}</p>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold block mt-0.5">{evt.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
