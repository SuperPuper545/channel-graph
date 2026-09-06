import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ChannelAnalytics, MediaKitSettings } from '../types';
import { exportChannelPdf } from '../services/pdfExport';
import { exportChannelPng } from '../services/pngExport';
import { AdsGramBanner } from './AdsGramBanner';
import { FileText, Image as ImageIcon, X, Sparkles, CheckCircle2, DollarSign, Edit3 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: ChannelAnalytics;
  settings: MediaKitSettings;
  isPro: boolean;
  userId?: number;
  onOpenPremium: () => void;
  onOpenEditPricing: () => void;
  onHapticSuccess: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  analytics,
  settings,
  isPro,
  userId,
  onOpenPremium,
  onOpenEditPricing,
  onHapticSuccess
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pdf' | 'png' | null>(null);

  if (!isOpen) return null;

  const triggerExport = async (type: 'pdf' | 'png') => {
    if (!isPro) {
      setPendingAction(type);
      setShowAd(true);
      return;
    }

    executeDownload(type);
  };

  const executeDownload = async (type: 'pdf' | 'png') => {
    setIsExporting(true);
    setShowAd(false);

    try {
      let result: { success: boolean; base64?: string; fileName: string };
      if (type === 'pdf') {
        result = await exportChannelPdf(analytics, settings);
      } else {
        result = await exportChannelPng(analytics, settings);
      }

      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onHapticSuccess();

        // If inside Telegram with valid user ID, deliver file directly to Telegram chat via Bot
        if (userId && userId > 1 && result.base64) {
          try {
            await fetch('/api/export/send-to-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                type,
                fileBase64: result.base64,
                fileName: result.fileName,
                channelTitle: analytics.overview.title,
                username: analytics.overview.username
              })
            });

            if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showAlert) {
              window.Telegram.WebApp.showAlert(
                `✅ ${type === 'pdf' ? 'PDF-медиакит' : 'PNG-инфографика'} успешно отправлен вам в чат с ботом @StatVisualBot!`
              );
            }
          } catch (chatErr) {
            console.warn('Could not send file to TG chat:', chatErr);
          }
        }

        onClose();
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
      setPendingAction(null);
    }
  };

  return (
    <>
      {showAd && (
        <AdsGramBanner
          onAdCompleted={() => {
            if (pendingAction) executeDownload(pendingAction);
          }}
          onCancel={() => setShowAd(false)}
          onUpgradePro={() => {
            setShowAd(false);
            onOpenPremium();
          }}
        />
      )}

      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="stat-card bg-tg-card max-w-md w-full p-4 sm:p-5 space-y-3.5 border border-tg-border shadow-2xl rounded-3xl relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-tg-secondaryBg text-tg-hint hover:text-tg-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-tg-text">Экспорт медиакита & отчетов</h3>
            <p className="text-[11px] text-tg-hint">
              Сформируйте визитку для рекламодателей с ценами и портретом аудитории
            </p>
          </div>

          {/* Pricing & Contact Summary Bar with quick Edit Button */}
          <div className="p-3 rounded-2xl bg-tg-secondaryBg border border-tg-border flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-blue-500 font-bold text-[11px]">
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Включено в медиакит:</span>
              </div>
              <p className="text-[11px] text-tg-hint truncate mt-0.5">
                1/24: <b className="text-tg-text">{settings.price1_24}</b> • 2/48: <b className="text-tg-text">{settings.price2_48}</b> • Контакт: <b className="text-tg-text">@{settings.contactUsername}</b>
              </p>
            </div>
            <button
              onClick={onOpenEditPricing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-tg-card hover:bg-tg-card/80 border border-tg-border text-blue-500 font-bold text-[11px] transition-colors flex-shrink-0"
              title="Настроить прайс-лист"
            >
              <Edit3 className="w-3 h-3" />
              <span>Прайс</span>
            </button>
          </div>

          <div className="space-y-2">
            {/* PDF Media Kit Card */}
            <button
              onClick={() => triggerExport('pdf')}
              disabled={isExporting}
              className="w-full p-3 rounded-2xl bg-tg-secondaryBg border border-tg-border hover:border-blue-500/50 flex items-center justify-between gap-3 text-left transition-all active:scale-98 group disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-tg-text">PDF Медиакит для рекламодателей</h4>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-blue-500/10 text-blue-500 rounded">
                      A4 Документ
                    </span>
                  </div>
                  <p className="text-[10.5px] text-tg-hint">
                    Векторный документ с кликабельными ссылками на заказ рекламы
                  </p>
                </div>
              </div>

              {!isPro ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 flex-shrink-0">
                  Free (Ads)
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                  PRO
                </span>
              )}
            </button>

            {/* PNG Snapshot Card */}
            <button
              onClick={() => triggerExport('png')}
              disabled={isExporting}
              className="w-full p-3 rounded-2xl bg-tg-secondaryBg border border-tg-border hover:border-indigo-500/50 flex items-center justify-between gap-3 text-left transition-all active:scale-98 group disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-tg-text">PNG Инфографика (1:1 HD)</h4>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-indigo-500/10 text-indigo-500 rounded">
                      1280x1280
                    </span>
                  </div>
                  <p className="text-[10.5px] text-tg-hint">
                    Компактная квадратная карточка для отправки в Telegram-чаты
                  </p>
                </div>
              </div>

              {!isPro ? (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 flex-shrink-0">
                  Free (Ads)
                </span>
              ) : (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                  PRO
                </span>
              )}
            </button>
          </div>

          {isExporting && (
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-1 animate-pulse">
              <div className="text-xs font-bold text-blue-500">Генерируем медиакит...</div>
              <div className="text-[10.5px] text-tg-hint">Файл скачивается и отправляется в ваш чат с ботом</div>
            </div>
          )}

          {!isPro ? (
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-[10.5px] font-semibold text-amber-600 dark:text-amber-400 truncate">
                  Скачивайте медиакиты без рекламы
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenPremium();
                }}
                className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-500 text-white flex-shrink-0"
              >
                PRO
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PRO статус активен</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
