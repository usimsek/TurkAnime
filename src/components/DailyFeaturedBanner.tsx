import React from 'react';
import { Sparkles, Star, Play, Layers, Info } from 'lucide-react';
import { AnimeItem } from '../types';

interface DailyFeaturedBannerProps {
  anime: AnimeItem | null;
  onSelectAnime: (anime: AnimeItem) => void;
  onQuickWatch: (anime: AnimeItem) => void;
}

export const DailyFeaturedBanner: React.FC<DailyFeaturedBannerProps> = ({
  anime,
  onSelectAnime,
  onQuickWatch,
}) => {
  if (!anime) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-neutral-900 to-[#0e0e0e] shadow-2xl">
        {/* Background poster blur */}
        {anime.posterUrl && (
          <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-25 pointer-events-none hidden md:block">
            <img
              src={anime.posterUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e] via-transparent to-transparent" />
          </div>
        )}

        <div className="relative p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Poster thumbnail */}
            <div
              onClick={() => onSelectAnime(anime)}
              className="w-16 sm:w-20 aspect-[3/4] rounded-xl bg-neutral-800 overflow-hidden shrink-0 border border-amber-500/30 cursor-pointer shadow-lg hover:scale-105 transition-transform"
            >
              {anime.posterUrl ? (
                <img
                  src={anime.posterUrl}
                  alt={anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                  Afiş
                </div>
              )}
            </div>

            {/* Info text */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GÜNÜN ANİMESİ ÖNERİSİ</span>
              </div>

              <h3
                onClick={() => onSelectAnime(anime)}
                className="text-lg sm:text-2xl font-extrabold text-white hover:text-amber-300 transition-colors cursor-pointer"
              >
                {anime.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
                {anime.rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {anime.rating.toFixed(2)} Puan
                  </span>
                )}
                <span>·</span>
                <span>{anime.episodeCount} Bölüm</span>
                <span>·</span>
                <span className="text-neutral-300">{anime.genres?.slice(0, 3).join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onSelectAnime(anime)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold transition-colors"
            >
              <Info className="w-4 h-4" /> Detaylar
            </button>
            <button
              onClick={() => onQuickWatch(anime)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-bold text-xs shadow-lg shadow-amber-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-black" /> Hemen İzle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
