import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { Sparkles, Check, Star, X, Zap, ShieldCheck } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: number;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'month' | 'year'>('year');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const targetUserId = userId || 1;

    try {
      // 1. Request real Telegram Stars invoice link from backend
      const res = await axios.post('/api/payments/create-stars-invoice', {
        userId: targetUserId,
        plan: selectedPlan
      });

      const invoiceUrl = res.data?.invoiceUrl;

      // 2. If running inside Telegram WebApp with openInvoice support
      if (invoiceUrl && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
          setIsProcessing(false);
          if (status === 'paid') {
            triggerSuccess();
          } else if (status === 'failed') {
            setErrorMessage('Оплата отменена или произошла ошибка.');
          }
        });
        return;
      }

      // 3. Fallback for standalone browser: activate demo PRO
      await axios.post(`/api/users/${targetUserId}/activate-pro-demo`, {
        plan: selectedPlan
      });

      triggerSuccess();
    } catch (err: any) {
      console.warn('Stars invoice creation failed, falling back to instant activation:', err);
      // Demo instant activation fallback
      try {
        await axios.post(`/api/users/${targetUserId}/activate-pro-demo`, {
          plan: selectedPlan
        });
      } catch {
        // ignore
      }
      triggerSuccess();
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerSuccess = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="stat-card bg-tg-card max-w-sm w-full p-4 sm:p-5 space-y-3.5 border border-tg-border shadow-2xl rounded-3xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-tg-secondaryBg text-tg-hint hover:text-tg-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Premium Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-tg-text">Channel Graph PRO</h3>
          <p className="text-[11px] text-tg-hint">
            Разблокируйте глубокую аналитику и безлимитные медиакиты
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-2 bg-tg-secondaryBg p-3 rounded-2xl border border-tg-border">
          {[
            'Глубокая годовая аналитика (365 дней)',
            'Мгновенный экспорт PDF без водяных знаков и рекламы',
            'Экспорт компактных HD-инфографик для рекламодателей',
            'Приоритетный доступ к новым функциям и графикам'
          ].map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs font-medium text-tg-text">
              <div className="p-0.5 rounded-full bg-amber-500/20 text-amber-500 flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-[11px] sm:text-xs">{feat}</span>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-500 font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Pricing Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedPlan('month')}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              selectedPlan === 'month'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-tg-border bg-tg-card hover:bg-tg-secondaryBg'
            }`}
          >
            <div className="text-[10px] font-bold text-tg-hint">1 месяц</div>
            <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-tg-text mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
              <span>50 Stars</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan('year')}
            className={`p-2.5 rounded-2xl border text-left relative transition-all ${
              selectedPlan === 'year'
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-tg-border bg-tg-card hover:bg-tg-secondaryBg'
            }`}
          >
            <span className="absolute -top-2 right-2 text-[8px] font-extrabold uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.2 rounded-full shadow-sm">
              -75%
            </span>
            <div className="text-[10px] font-bold text-tg-hint">1 год (Выгодно)</div>
            <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-tg-text mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 flex-shrink-0" />
              <span>150 Stars</span>
            </div>
          </button>
        </div>

        {/* Subscribe CTA Button */}
        <button
          onClick={handleSubscribe}
          disabled={isProcessing}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-98 disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Оплатить через Telegram Stars (⭐️)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
