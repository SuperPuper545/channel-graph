import React from 'react';
import { Sparkles } from 'lucide-react';

interface PeriodSelectorProps {
  period: '7d' | '30d' | '90d' | '1y';
  onChange: (period: '7d' | '30d' | '90d' | '1y') => void;
  onOpenPremium: () => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onChange,
  onOpenPremium
}) => {
  const options: { id: '7d' | '30d' | '90d' | '1y'; labelFull: string; labelShort: string; isPro?: boolean }[] = [
    { id: '7d', labelFull: '7 дней', labelShort: '7д' },
    { id: '30d', labelFull: '30 дней', labelShort: '30д' },
    { id: '90d', labelFull: '90 дней', labelShort: '90д' },
    { id: '1y', labelFull: '1 год', labelShort: '1г', isPro: true }
  ];

  return (
    <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-tg-card border border-tg-border rounded-xl">
      {options.map((opt) => {
        const isSelected = period === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => {
              if (opt.isPro) {
                onOpenPremium();
              } else {
                onChange(opt.id);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-0.5 sm:gap-1 py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-xs font-semibold transition-all truncate ${
              isSelected
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-tg-hint hover:text-tg-text hover:bg-tg-secondaryBg'
            }`}
          >
            <span className="hidden xs:inline">{opt.labelFull}</span>
            <span className="inline xs:hidden">{opt.labelShort}</span>
            {opt.isPro && (
              <span className="inline-flex items-center text-[8px] sm:text-[9px] bg-amber-500/20 text-amber-500 font-extrabold px-1 py-0.2 rounded flex-shrink-0">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
                PRO
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
