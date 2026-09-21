import React from 'react';
import { Heart, Trash2, Play, Layers, Star, ArrowLeft } from 'lucide-react';
import { FavoriteItem, AnimeItem } from '../types';

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  onRemoveFavorite: (slug: string) => void;
  onSelectAnimeBySlug: (slug: string) => void;
  onBackToHome: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onSelectAnimeBySlug,
  onBackToHome,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Favori Animelerim
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kütüphanene kaydettiğin {favorites.length} anime
            </p>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 bg-[#0d0d0d] rounded-2xl border border-neutral-800/80 mt-6 p-8">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Henüz favori anime eklemedin</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Anime kartlarındaki veya detay sayfasındaki kalp simgesine tıklayarak beğendiğin serileri buraya kaydedebilirsin.
          </p>
          <button
            onClick={onBackToHome}
            className="mt-5 px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
          >
            Animeleri Keşfet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {favorites.map((fav) => (
            <div
              key={fav.slug}
              className="group relative flex flex-col bg-[#0d0d0d] hover:bg-[#121212] border border-neutral-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-neutral-600 shadow-md"
            >
              {/* Poster */}
              <div
                onClick={() => onSelectAnimeBySlug(fav.slug)}
                className="relative aspect-[3/4] w-full bg-neutral-900 cursor-pointer overflow-hidden"
              >
                {fav.poster ? (
                  <img
                    src={fav.poster}
                    alt={fav.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3 text-center text-xs text-neutral-500">
                    {fav.title}
                  </div>
                )}

                {/* Rating badge */}
                {fav.rating && fav.rating > 0 ? (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md text-amber-400 flex items-center gap-1 border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{fav.rating.toFixed(1)}</span>
                  </div>
                ) : null}

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(fav.slug);
                  }}
                  title="Favorilerden Kaldır"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-rose-600 text-neutral-300 hover:text-white transition-all border border-neutral-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title & Info */}
              <div
                onClick={() => onSelectAnimeBySlug(fav.slug)}
                className="p-3 cursor-pointer flex-1 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-neutral-100 group-hover:text-rose-400 transition-colors line-clamp-2">
                    {fav.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono mt-1">
                    <Layers className="w-3 h-3 text-neutral-500" />
                    <span>{fav.episodeCount > 0 ? `${fav.episodeCount} Bölüm` : 'Arşiv'}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-rose-400 font-medium">
                  <span>Detayları Gör</span>
                  <Play className="w-3 h-3 fill-rose-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
