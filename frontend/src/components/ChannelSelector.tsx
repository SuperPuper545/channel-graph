import React, { useState, useEffect } from 'react';
import { ChannelOverview } from '../types';
import { searchLiveChannel } from '../services/api';
import {
  CheckCircle2,
  ChevronDown,
  Plus,
  Radio,
  Users,
  Search,
  Trash2,
  Bot,
  Eye,
  ShieldCheck,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface ChannelSelectorProps {
  channels: ChannelOverview[];
  selectedChannel: ChannelOverview;
  onSelectChannel: (channel: ChannelOverview) => void;
  onDeleteChannel: (channelId: string) => void;
  onOpenAddChannel: () => void;
  onRefreshChannels?: () => void;
  isPro?: boolean;
  onOpenPremium?: () => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  onDeleteChannel,
  onOpenAddChannel,
  onRefreshChannels,
  isPro = false,
  onOpenPremium
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'viewed'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Split channels into My Channels (admin bot) and Viewed Channels (search/public)
  const myChannels = channels.filter(c => c.isAdmin);
  const viewedChannels = channels.filter(c => !c.isAdmin);

  const maxMyLimit = isPro ? 10 : 3;
  const maxViewLimit = isPro ? 25 : 7;

  // Auto-switch tab to current channel type on open & trigger refresh
  useEffect(() => {
    if (isOpen) {
      onRefreshChannels?.();
      if (selectedChannel.isAdmin) {
        setActiveTab('my');
      } else {
        setActiveTab('viewed');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, selectedChannel]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const clean = searchQuery.replace('@', '').replace('https://t.me/', '').trim();
    const alreadyExists = viewedChannels.some(c => c.username?.toLowerCase() === clean.toLowerCase() || c.id === clean);

    if (!alreadyExists && viewedChannels.length >= maxViewLimit) {
      setSearchError(`Достигнут лимит просматриваемых каналов (${viewedChannels.length}/${maxViewLimit}). ${!isPro ? 'Перейдите на PRO (до 25 каналов)' : ''}`);
      if (!isPro) onOpenPremium?.();
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const result = await searchLiveChannel(clean);
    setIsSearching(false);

    if (result) {
      const viewedResult: ChannelOverview = {
        ...result,
        isAdmin: false
      };
      onSelectChannel(viewedResult);
      setSearchQuery('');
      setActiveTab('viewed');
      setIsOpen(false);
    } else {
      setSearchError(`Канал @${clean} не найден. Проверьте правильность юзернейма.`);
    }
  };

  const handleAddChannelClick = () => {
    if (myChannels.length >= maxMyLimit) {
      if (!isPro) {
        onOpenPremium?.();
      } else {
        alert(`Достигнут максимальный лимит PRO (${maxMyLimit}/${maxMyLimit} каналов).`);
      }
      return;
    }
    onOpenAddChannel();
  };

  const getAvatarSrc = (c: { avatar?: string; username?: string; title?: string }) => {
    if (c.avatar && !c.avatar.includes('api.telegram.org/file/bot') && c.avatar.startsWith('http')) {
      return c.avatar;
    }
    const clean = (c.username || '').replace('@', '').trim();
    if (clean && !clean.startsWith('-')) {
      return `https://t.me/i/userpic/320/${clean}.jpg`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(c.title || c.username || 'TG')}&background=2563eb&color=fff&size=200&bold=true`;
  };

  return (
    <div className="relative">
      {/* Current Active Channel Card */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3 sm:p-3.5 rounded-2xl bg-tg-card border border-tg-border shadow-sm flex items-center justify-between gap-3 hover:border-blue-500/50 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12">
            <img
              src={getAvatarSrc(selectedChannel)}
              alt={selectedChannel.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChannel.title || 'TG')}&background=2563eb&color=fff&size=200&bold=true`;
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 aspect-square rounded-2xl object-cover border border-tg-border flex-shrink-0"
            />
            {selectedChannel.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20 absolute -bottom-1 -right-1 bg-tg-card rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-xs sm:text-sm md:text-base text-tg-text truncate">{selectedChannel.title}</h2>
              {selectedChannel.isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0">
                  <Bot className="w-3 h-3" />
                  <span>Мой канал</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 flex-shrink-0">
                  <Eye className="w-3 h-3" />
                  <span>Просмотр</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-tg-hint font-medium mt-0.5 truncate">
              <span className="truncate">@{selectedChannel.username}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-500 font-semibold flex-shrink-0">
                <Users className="w-3 h-3 flex-shrink-0" />
                {selectedChannel.subscribers.toLocaleString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center text-tg-hint bg-tg-secondaryBg p-1.5 sm:p-2 rounded-xl border border-tg-border flex-shrink-0">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Box */}
          <div className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-0 top-16 sm:top-full mt-2 z-50 bg-tg-card border border-tg-border rounded-3xl shadow-2xl p-4 sm:p-5 flex flex-col max-h-[85vh] sm:max-h-[520px] overflow-hidden animate-scale-in">
            {/* Header with Title & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-tg-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-tg-text">Выбор Telegram-канала</h3>
                  <p className="text-[10.5px] text-tg-hint">Управление каналами и поиск</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-tg-secondaryBg text-tg-hint hover:text-tg-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Search Input Bar */}
            <div className="py-2.5 flex-shrink-0 space-y-1.5">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchError(null);
                  }}
                  placeholder="Поиск по @username..."
                  className="w-full pl-8 pr-16 py-2 rounded-xl bg-tg-secondaryBg border border-tg-border text-xs text-tg-text placeholder-tg-hint focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-tg-hint absolute left-2.5 top-3" />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-[11px] font-bold transition-all shadow-sm shadow-blue-600/20"
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

            {/* Two Tabs Switcher (Mobile Responsive) */}
            <div className="flex p-1 rounded-2xl bg-tg-secondaryBg border border-tg-border mb-2.5 flex-shrink-0 gap-1">
              <button
                onClick={() => setActiveTab('my')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0 ${
                  activeTab === 'my'
                    ? 'bg-tg-card text-blue-500 shadow-sm border border-tg-border'
                    : 'text-tg-hint hover:text-tg-text'
                }`}
              >
                <span className="truncate">Мои каналы</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-500 font-extrabold flex-shrink-0">
                  {myChannels.length}/{maxMyLimit}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('viewed')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0 ${
                  activeTab === 'viewed'
                    ? 'bg-tg-card text-blue-500 shadow-sm border border-tg-border'
                    : 'text-tg-hint hover:text-tg-text'
                }`}
              >
                <span className="truncate">Просмотр</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-500 font-extrabold flex-shrink-0">
                  {viewedChannels.length}/{maxViewLimit}
                </span>
              </button>
            </div>

            {/* Tab 1: My Channels (Admin Bot) */}
            {activeTab === 'my' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px] max-h-[260px]">
                {myChannels.length === 0 ? (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-tg-secondaryBg/80 border border-tg-border text-center space-y-1.5 my-2">
                    <p className="text-xs font-bold text-tg-text">Нет подключенных каналов</p>
                    <p className="text-[11px] text-tg-hint max-w-xs mx-auto leading-relaxed">
                      Чтобы подключить свой личный канал, добавьте бота в администраторы по инструкции на кнопке снизу 👇
                    </p>
                  </div>
                ) : (
                  myChannels.map((channel) => {
                    const isSelected = channel.id === selectedChannel.id || channel.username === selectedChannel.username;
                    return (
                      <div
                        key={channel.id || channel.username}
                        className={`w-full p-2.5 rounded-2xl flex items-center justify-between gap-2.5 transition-colors border ${
                          isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-tg-secondaryBg/60 border-tg-border hover:bg-tg-secondaryBg'
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
                            src={getAvatarSrc(channel)}
                            alt={channel.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title || 'TG')}&background=2563eb&color=fff&size=200&bold=true`;
                            }}
                            className="w-10 h-10 aspect-square rounded-xl object-cover flex-shrink-0 border border-tg-border"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-tg-text truncate">{channel.title}</p>
                            <p className="text-[11px] text-tg-hint truncate">@{channel.username} • {channel.subscribers.toLocaleString('ru-RU')} сабс.</p>
                          </div>
                        </button>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isSelected ? (
                            <Radio className="w-4 h-4 text-blue-500 flex-shrink-0 mr-1" />
                          ) : (
                            <button
                              onClick={() => {
                                onSelectChannel(channel);
                                setIsOpen(false);
                              }}
                              className="text-[10.5px] text-tg-hint hover:text-tg-text px-2.5 py-1 rounded-lg bg-tg-card border border-tg-border flex-shrink-0 font-medium"
                            >
                              Выбрать
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChannel(channel.id || channel.username);
                            }}
                            className="p-1.5 rounded-lg text-tg-hint hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Удалить канал"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab 2: Viewed Channels (Search / Public) */}
            {activeTab === 'viewed' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[260px]">
                {viewedChannels.map((channel) => {
                  const isSelected = channel.id === selectedChannel.id || channel.username === selectedChannel.username;
                  return (
                    <div
                      key={channel.id || channel.username}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between gap-2.5 transition-colors border ${
                        isSelected ? 'bg-blue-500/10 border-blue-500/30' : 'bg-tg-secondaryBg/60 border-tg-border hover:bg-tg-secondaryBg'
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
                          src={getAvatarSrc(channel)}
                          alt={channel.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.title || 'TG')}&background=2563eb&color=fff&size=200&bold=true`;
                          }}
                          className="w-10 h-10 aspect-square rounded-xl object-cover flex-shrink-0 border border-tg-border"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-tg-text truncate">{channel.title}</p>
                          <p className="text-[11px] text-tg-hint truncate">@{channel.username} • {channel.subscribers.toLocaleString('ru-RU')} сабс.</p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isSelected ? (
                          <Radio className="w-4 h-4 text-blue-500 flex-shrink-0 mr-1" />
                        ) : (
                          <button
                            onClick={() => {
                              onSelectChannel(channel);
                              setIsOpen(false);
                            }}
                            className="text-[10.5px] text-tg-hint hover:text-tg-text px-2.5 py-1 rounded-lg bg-tg-card border border-tg-border flex-shrink-0 font-medium"
                          >
                            Выбрать
                          </button>
                        )}

                        {viewedChannels.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChannel(channel.id || channel.username);
                            }}
                            className="p-1.5 rounded-lg text-tg-hint hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Удалить канал из сохраненных"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pinned Bottom Action Footer */}
            <div className="pt-3 border-t border-tg-border bg-tg-card flex-shrink-0">
              <button
                onClick={handleAddChannelClick}
                className="w-full py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Подключить свой канал (Инструкция)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
