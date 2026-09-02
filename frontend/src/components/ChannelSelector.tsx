import React, { useState, useEffect } from 'react';
import { ChannelOverview } from '../types';
import { searchLiveChannel } from '../services/api';
import { CheckCircle2, ChevronDown, Plus, Radio, Users, Search, Trash2 } from 'lucide-react';

interface ChannelSelectorProps {
  channels: ChannelOverview[];
  selectedChannel: ChannelOverview;
  onSelectChannel: (channel: ChannelOverview) => void;
  onDeleteChannel: (channelId: string) => void;
  onOpenAddChannel: () => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  onDeleteChannel,
  onOpenAddChannel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    const clean = searchQuery.replace('@', '').replace('https://t.me/', '').trim();
    const result = await searchLiveChannel(clean);

    setIsSearching(false);

    if (result) {
      onSelectChannel(result);
      setSearchQuery('');
      setIsOpen(false);
    } else {
      setSearchError(`Канал @${clean} не найден. Проверьте правильность юзернейма.`);
    }
  };

  return (
    <div className="relative">
      {/* Current Active Channel Pill / Card */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-2.5 sm:p-3.5 rounded-2xl bg-tg-card border border-tg-border shadow-sm flex items-center justify-between gap-2 sm:gap-3 hover:border-blue-500/50 transition-all"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
            <img
              src={selectedChannel.avatar}
              alt={selectedChannel.title}
              className="w-10 h-10 sm:w-12 sm:h-12 aspect-square rounded-xl sm:rounded-2xl object-cover border border-tg-border flex-shrink-0"
            />
            {selectedChannel.isVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 fill-blue-500/20 absolute -bottom-1 -right-1 bg-tg-card rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-xs sm:text-sm md:text-base text-tg-text truncate">{selectedChannel.title}</h2>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0">
                🟢 Live API
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-tg-hint font-medium mt-0.5 truncate">
              <span className="truncate">@{selectedChannel.username}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-500 font-semibold flex-shrink-0">
                <Users className="w-3 h-3 flex-shrink-0" />
                {selectedChannel.subscribers.toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-tg-hint bg-tg-secondaryBg p-1 sm:p-1.5 rounded-xl border border-tg-border flex-shrink-0">
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu Modal with PINNED Header & PINNED Footer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-tg-card border border-tg-border rounded-2xl shadow-2xl p-3 flex flex-col max-h-[85vh] sm:max-h-[460px] overflow-hidden animate-fade-in">
            {/* PINNED TOP: Live Search Input Bar */}
            <div className="pb-2.5 border-b border-tg-border bg-tg-card flex-shrink-0 space-y-1.5">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchError(null);
                  }}
                  placeholder="Анализ канала по @username..."
                  className="w-full pl-8 pr-16 py-2 rounded-xl bg-tg-secondaryBg border border-tg-border text-xs text-tg-text placeholder-tg-hint focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-tg-hint absolute left-2.5 top-3" />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[10.5px] font-bold transition-all"
                >
                  {isSearching ? '...' : 'Найти'}
                </button>
              </form>

              {searchError && (
                <div className="text-[11px] text-rose-500 font-semibold px-2 py-1 bg-rose-500/10 rounded-lg">
                  {searchError}
                </div>
              )}
            </div>

            {/* SCROLLABLE MIDDLE: Connected Channels List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1.5 min-h-[140px] max-h-[260px] pr-1">
              <div className="px-1 pb-1 text-[10.5px] font-bold uppercase tracking-wider text-tg-hint">
                Подключенные каналы ({channels.length})
              </div>

              {channels.map((channel) => {
                const isSelected = channel.id === selectedChannel.id || channel.username === selectedChannel.username;
                return (
                  <div
                    key={channel.id || channel.username}
                    className={`w-full p-2 rounded-xl flex items-center justify-between gap-2 transition-colors ${
                      isSelected ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-tg-secondaryBg'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelectChannel(channel);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      <img
                        src={channel.avatar}
                        alt={channel.title}
                        className="w-9 h-9 aspect-square rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-tg-text truncate">{channel.title}</p>
                        <p className="text-[11px] text-tg-hint truncate">@{channel.username} • {channel.subscribers.toLocaleString('ru-RU')} сабс.</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isSelected ? (
                        <Radio className="w-4 h-4 text-blue-500 flex-shrink-0 mr-1" />
                      ) : (
                        <button
                          onClick={() => {
                            onSelectChannel(channel);
                            setIsOpen(false);
                          }}
                          className="text-[10px] text-tg-hint hover:text-tg-text px-2 py-1 rounded-md bg-tg-secondaryBg flex-shrink-0 font-medium"
                        >
                          Выбрать
                        </button>
                      )}

                      {/* Delete Channel Button */}
                      {channels.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChannel(channel.id || channel.username);
                          }}
                          className="p-1.5 rounded-lg text-tg-hint hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Удалить канал из списка"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PINNED BOTTOM: Instruction Button */}
            <div className="pt-2.5 border-t border-tg-border bg-tg-card flex-shrink-0">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddChannel();
                }}
                className="w-full p-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Инструкция по подключению бота</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
