import React, { useState } from 'react';
import { MediaKitSettings } from '../types';
import { DollarSign, ExternalLink, Edit3, UserCheck, Save, Check } from 'lucide-react';

interface PricingWidgetProps {
  settings: MediaKitSettings;
  onUpdateSettings: (settings: MediaKitSettings) => void;
  onEditPricing: () => void;
  onOpenLink: (url: string) => void;
}

export const PricingWidget: React.FC<PricingWidgetProps> = ({
  settings,
  onUpdateSettings,
  onEditPricing,
  onOpenLink
}) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [tempContact, setTempContact] = useState(settings.contactUsername || 'channel_manager');

  const contact = (settings.contactUsername || 'channel_manager').replace('@', '');

  const handleSaveContact = () => {
    const clean = tempContact.replace('@', '').trim();
    if (clean) {
      onUpdateSettings({
        ...settings,
        contactUsername: clean
      });
    }
    setIsEditingContact(false);
  };

  return (
    <div className="stat-card p-3.5 sm:p-4 space-y-3.5 border border-tg-border bg-tg-card rounded-3xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-tg-text truncate">Прайс-лист на рекламу</h3>
            <p className="text-[11px] text-tg-hint truncate">Актуальные форматы и стоимость</p>
          </div>
        </div>

        <button
          onClick={onEditPricing}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-tg-secondaryBg text-blue-500 hover:bg-blue-500/10 border border-tg-border text-xs font-bold transition-colors flex-shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Изменить цены</span>
          <span className="sm:hidden">Цены</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Format 1/24 */}
        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              1/24 (Топ)
            </span>
            <span className="text-[11px] text-tg-hint font-medium">1ч топ / 24ч</span>
          </div>
          <div className="my-2">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {settings.price1_24 || '4 500 ₽'}
            </div>
          </div>
          <p className="text-[10px] text-tg-hint">Быстрый всплеск переходов</p>
        </div>

        {/* Format 2/48 */}
        <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
              2/48 (Стандарт)
            </span>
            <span className="text-[11px] text-tg-hint font-medium">2ч топ / 48ч</span>
          </div>
          <div className="my-2">
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {settings.price2_48 || '7 900 ₽'}
            </div>
          </div>
          <p className="text-[10px] text-tg-hint">Максимальный охват ленты</p>
        </div>

        {/* Native format */}
        <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400">
              Натив / Навсегда
            </span>
            <span className="text-[11px] text-tg-hint font-medium">Без удаления</span>
          </div>
          <div className="my-2">
            <div className="text-lg font-black text-purple-600 dark:text-purple-400">
              {settings.priceNative || '12 000 ₽'}
            </div>
          </div>
          <p className="text-[10px] text-tg-hint">Авторский пост под ваш бриф</p>
        </div>
      </div>

      {/* Booking bar with Compact Icon Edit */}
      <div className="p-2.5 rounded-2xl bg-tg-secondaryBg border border-tg-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs min-w-0 flex-1 w-full sm:w-auto">
          <UserCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          
          {isEditingContact ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-tg-hint font-bold text-xs">@</span>
              <input
                type="text"
                value={tempContact}
                onChange={(e) => setTempContact(e.target.value)}
                placeholder="юзернейм"
                className="p-1 px-2 rounded-lg bg-tg-card border border-blue-500 text-xs text-tg-text font-bold focus:outline-none flex-1 max-w-[150px]"
                autoFocus
              />
              <button
                onClick={handleSaveContact}
                className="p-1 px-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 flex-shrink-0"
              >
                <Check className="w-3 h-3" />
                <span>ОК</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
              <span className="text-tg-hint text-[11.5px] truncate">Менеджер:</span>
              <b className="text-tg-text font-bold text-xs truncate">@{contact}</b>
              <button
                onClick={() => {
                  setTempContact(contact);
                  setIsEditingContact(true);
                }}
                className="p-1 rounded-lg text-tg-hint hover:text-blue-500 hover:bg-tg-card transition-colors flex-shrink-0"
                title="Изменить контакт менеджера"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onOpenLink(`https://t.me/${contact}`)}
          className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm shadow-blue-600/20 transition-all flex-shrink-0 active:scale-95"
        >
          <span>Написать менеджеру</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
