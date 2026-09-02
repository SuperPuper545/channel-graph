import React from 'react';
import { ChannelPost } from '../types';
import { Award, ExternalLink, Eye, Heart, MessageSquare, Share2 } from 'lucide-react';

interface TopPostsProps {
  posts: ChannelPost[];
  onOpenLink: (url: string) => void;
}

export const TopPosts: React.FC<TopPostsProps> = ({ posts, onOpenLink }) => {
  return (
    <div className="stat-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-tg-text">Топ публикаций</h3>
            <p className="text-[11px] text-tg-hint">Посты с максимальным охватом и вовлеченностью</p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className="p-3 rounded-xl bg-tg-secondaryBg border border-tg-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-500/40 transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black w-4 h-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-tg-text truncate max-w-[280px] sm:max-w-md">
                  {post.title}
                </span>
              </div>
              <div className="text-[11px] text-tg-hint pl-6">{post.date}</div>
            </div>

            {/* Metrics Chips & Link */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
              <div className="flex items-center gap-3 text-xs text-tg-hint">
                <span className="flex items-center gap-1 font-semibold text-tg-text" title="Просмотры">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  {post.views.toLocaleString('ru-RU')}
                </span>
                <span className="flex items-center gap-1" title="Репосты">
                  <Share2 className="w-3 h-3 text-indigo-500" />
                  {post.forwards}
                </span>
                <span className="flex items-center gap-1" title="Реакции">
                  <Heart className="w-3 h-3 text-pink-500" />
                  {post.reactions}
                </span>
                <span className="flex items-center gap-1" title="Комментарии">
                  <MessageSquare className="w-3 h-3 text-emerald-500" />
                  {post.comments}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-bold text-xs">
                  {post.err}% ERR
                </span>

                <button
                  onClick={() => onOpenLink(post.url)}
                  className="p-1.5 rounded-lg bg-tg-card text-tg-hint hover:text-blue-500 hover:bg-blue-500/10 transition-colors border border-tg-border"
                  title="Открыть пост в Telegram"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
