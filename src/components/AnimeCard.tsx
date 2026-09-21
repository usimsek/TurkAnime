import React, { useState } from 'react';
import { Star, Play, Heart, Layers, Video } from 'lucide-react';
import { AnimeItem } from '../types';

interface AnimeCardProps {
  anime: AnimeItem;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, anime: AnimeItem) => void;
  onSelectAnime: (anime: AnimeItem) => void;
  onQuickWatch?: (anime: AnimeItem) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  isFavorite,
  onToggleFavorite,
  onSelectAnime,
  onQuickWatch,
}) => {
  const [imageError, setImageError] = useState(false);

  // Derive poster URL fallback or AniList cover
  const posterSrc = !imageError && anime.posterUrl ? anime.posterUrl : null;

  return (
    <div
      id={`anime-card-${anime.slug}`}
      onClick={() => onSelectAnime(anime)}
      className="group relative flex flex-col bg-[#0d0d0d] hover:bg-[#121212] border border-neutral-800/80 hover:border-neutral-600 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full bg-[#161616] overflow-hidden">
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={anime.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#181818] to-[#0e0e0e]">
            <Video className="w-8 h-8 text-neutral-600 mb-2" />
            <span className="text-xs font-semibold text-neutral-400 line-clamp-2">
              {anime.title}
            </span>
          </div>
        )}

        {/* Top Overlay Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {/* Format Badge */}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-black/75 backdrop-blur-md text-white border border-white/10">
            {anime.format || 'TV'}
          </span>

          {/* Favorite Toggle Button */}
          <button
            onClick={(e) => onToggleFavorite(e, anime)}
            title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            className="pointer-events-auto p-1.5 rounded-full bg-black/70 backdrop-blur-md hover:bg-black text-white hover:scale-110 active:scale-95 transition-all border border-white/10"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isFavorite
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-neutral-300 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Rating and Episodes Floating Bar on Poster Bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-6 pb-2.5 px-3 flex items-center justify-between text-xs">
          {/* Rating */}
          <div className="flex items-center gap-1 font-mono font-semibold">
            {anime.rating && anime.rating > 0 ? (
              <>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-amber-300">{anime.rating.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-neutral-500 text-[11px] font-mono">Puan: -</span>
            )}
          </div>

          {/* Episode Count */}
          <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-300">
            <Layers className="w-3 h-3 text-neutral-400" />
            <span>{anime.episodeCount > 0 ? `${anime.episodeCount} Bölüm` : 'Arşivde'}</span>
          </div>
        </div>

        {/* Quick Play Hover Trigger */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3
            title={anime.title}
            className="text-sm font-bold text-neutral-100 group-hover:text-rose-400 transition-colors line-clamp-1"
          >
            {anime.title}
          </h3>

          {/* Genres Chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {anime.genres && anime.genres.length > 0 ? (
              anime.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/50"
                >
                  {genre}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-neutral-600">Anime</span>
            )}
          </div>
        </div>

        {/* Providers Preview */}
        {anime.providers && anime.providers.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
            <span className="truncate max-w-[150px]">
              {anime.providers.slice(0, 3).join(', ')}
            </span>
            <span className="text-neutral-400 font-bold shrink-0">
              {anime.linkCount} Link
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
