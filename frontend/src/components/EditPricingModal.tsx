import React, { useState, useEffect } from 'react';
import { MediaKitSettings } from '../types';
import { DollarSign, User, X, Check, Sparkles, HelpCircle, Save } from 'lucide-react';

interface EditPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MediaKitSettings;
  onSave: (settings: MediaKitSettings) => void;
  suggestedPrices?: { price124?: string; price248?: string; priceNative?: string };
}

export const EditPricingModal: React.FC<EditPricingModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  suggestedPrices
}) => {
  const [p124, setP124] = useState(settings.price1_24 || '4 500 ₽');
  const [p248, setP248] = useState(settings.price2_48 || '7 900 ₽');
  const [pNative, setPNative] = useState(settings.priceNative || '12 000 ₽');
  const [contact, setContact] = useState(settings.contactUsername || 'channel_manager');

  useEffect(() => {
    if (isOpen) {
      setP124(settings.price1_24 || '4 500 ₽');
      setP248(settings.price2_48 || '7 900 ₽');
      setPNative(settings.priceNative || '12 000 ₽');
      setContact((settings.contactUsername || 'channel_manager').replace('@', ''));
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleApplySuggested = () => {
    if (suggestedPrices?.price124) setP124(suggestedPrices.price124);
    if (suggestedPrices?.price248) setP248(suggestedPrices.price248);
    if (suggestedPrices?.priceNative) setPNative(suggestedPrices.priceNative);
  };

  const handleSave = () => {
    onSave({
      price1_24: p124.trim() || '4 500 ₽',
      price2_48: p248.trim() || '7 900 ₽',
      priceNative: pNative.trim() || '12 000 ₽',
      contactUsername: contact.replace('@', '').trim() || 'channel_manager'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="stat-card bg-tg-card max-w-md w-full p-4 sm:p-5 space-y-4 border border-tg-border shadow-2xl rounded-3xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-tg-secondaryBg text-tg-hint hover:text-tg-text transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-tg-text">Настройка прайс-листа</h3>
            <p className="text-[11px] text-tg-hint">Укажите стоимость форматов для рекламодателей</p>
          </div>
        </div>

        {/* AI Auto-fill banner if available */}
        {suggestedPrices?.price124 && (
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold min-w-0 truncate">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Есть AI-расчет по нишевому CPM</span>
            </div>
            <button
              onClick={handleApplySuggested}
              className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10.5px] transition-all flex-shrink-0"
            >
              Применить AI-цены
            </button>
          </div>
        )}

        {/* Price Inputs Grid */}
        <div className="space-y-3">
          {/* Format 1/24 */}
          <div>
            <label className="text-[11px] font-bold text-tg-hint block mb-1">
              Формат 1/24 (1 час в топе, 24 часа в ленте):
            </label>
            <input
              type="text"
              value={p124}
              onChange={(e) => setP124(e.target.value)}
              placeholder="например, 4 500 ₽"
              className="w-full px-3 py-2 rounded-xl bg-tg-secondaryBg border border-tg-border text-xs text-tg-text font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Format 2/48 */}
          <div>
            <label className="text-[11px] font-bold text-tg-hint block mb-1">
              Формат 2/48 (2 часа в топе, 48 часов в ленте):
            </label>
            <input
              type="text"
              value={p248}
              onChange={(e) => setP248(e.target.value)}
              placeholder="например, 7 900 ₽"
              className="w-full px-3 py-2 rounded-xl bg-tg-secondaryBg border border-tg-border text-xs text-tg-text font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Native / Forever */}
          <div>
            <label className="text-[11px] font-bold text-tg-hint block mb-1">
              Нативный пост / Навсегда (без удаления):
            </label>
            <input
              type="text"
              value={pNative}
              onChange={(e) => setPNative(e.target.value)}
              placeholder="например, 12 000 ₽"
              className="w-full px-3 py-2 rounded-xl bg-tg-secondaryBg border border-tg-border text-xs text-tg-text font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Contact Username */}
          <div>
            <label className="text-[11px] font-bold text-tg-hint block mb-1">
              Контакт менеджера по рекламе (@username):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-tg-hint font-bold text-xs">@</span>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value.replace('@', ''))}
                placeholder="channel_manager"
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-tg-secondaryBg border border-tg-border text-xs text-tg-text font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <p className="text-[10px] text-tg-hint mt-1">
              Этот юзернейм будет отображаться в медиакитах как контакт для заказа рекламы
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить прайс-лист</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-1.5 text-xs text-tg-hint hover:text-tg-text font-medium"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};
