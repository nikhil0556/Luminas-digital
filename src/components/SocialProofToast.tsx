import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SocialProofEvent {
  buyer: string;
  location: string;
  productTitle: string;
  timeAgo: string;
}

const SAMPLE_EVENTS: SocialProofEvent[] = [
  { buyer: 'Alex R.', location: 'Mumbai, India', productTitle: '100 Trending ChatGPT "/" Prompts', timeAgo: '2 minutes ago' },
  { buyer: 'Sarah K.', location: 'London, UK', productTitle: 'How to Be Financially Free in Young Age', timeAgo: '5 minutes ago' },
  { buyer: 'David M.', location: 'New York, USA', productTitle: 'Ultimate Notion Freelance OS', timeAgo: '8 minutes ago' },
  { buyer: 'Priya S.', location: 'Bengaluru, India', productTitle: 'AI Mega-Prompt Engineering Bible', timeAgo: '12 minutes ago' },
  { buyer: 'Elena V.', location: 'Berlin, Germany', productTitle: 'The Ultimate 150 "/" Prompts PDF Books Duo', timeAgo: '16 minutes ago' }
];

export const SocialProofToast: React.FC = () => {
  const { settings } = useStore();
  const [currentEvent, setCurrentEvent] = useState<SocialProofEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!settings?.enableSocialProofToasts || isDismissed) {
      setIsVisible(false);
      return;
    }

    let eventIdx = 0;
    const triggerNext = () => {
      const nextEv = SAMPLE_EVENTS[eventIdx % SAMPLE_EVENTS.length];
      eventIdx++;
      setCurrentEvent(nextEv);
      setIsVisible(true);

      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return hideTimer;
    };

    // First show after 6s
    const initialTimer = setTimeout(() => {
      triggerNext();
    }, 6000);

    // Repeat every 22s
    const intervalTimer = setInterval(() => {
      triggerNext();
    }, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [settings?.enableSocialProofToasts, isDismissed]);

  if (!settings?.enableSocialProofToasts || !isVisible || !currentEvent || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
      <div className="glass-panel p-3.5 rounded-2xl border border-white/10 bg-[#0a0f1e]/90 backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-white font-medium truncate">
            <span className="font-semibold">{currentEvent.buyer}</span> from {currentEvent.location}
          </p>
          <p className="text-neutral-400 text-[11px] truncate">
            Purchased <span className="text-indigo-300 font-medium">{currentEvent.productTitle}</span>
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">{currentEvent.timeAgo}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            setIsDismissed(true);
          }}
          className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

