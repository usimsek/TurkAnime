import React, { useEffect, useState } from 'react';
import {
  X,
  Star,
  Play,
  Heart,
  Calendar,
  Layers,
  Building2,
  Tv,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { AnimeItem, AnimeDetailInfo, EpisodeData } from '../types';
import { fetchAnimeDetails, fetchAnimeEpisodes } from '../services/animeApi';
import { getStoredHistory } from '../utils/storage';

interface AnimeDetailModalProps {
  anime: AnimeItem | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, anime: AnimeItem) => void;
  onStartWatch: (anime: AnimeItem, episodeSlug: string, episodeTitle: string) => void;
}

export const AnimeDetailModal: React.FC<AnimeDetailModalProps> = ({
  anime,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onStartWatch,
}) => {
  const [details, setDetails] = useState<AnimeDetailInfo | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [watchedSet, setWatchedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!anime || !isOpen) return;

    // Load watched history for this anime
    const history = getStoredHistory();
    const watched = new Set(
      history.filter((h) => h.animeSlug === anime.slug).map((h) => h.episodeSlug)
    );
    setWatchedSet(watched);

    // Fetch details
    setLoadingDetails(true);
    fetchAnimeDetails(anime.slug)
      .then((data) => setDetails(data))
      .finally(() => setLoadingDetails(false));

    // Fetch episodes
    setLoadingEpisodes(true);
    fetchAnimeEpisodes(anime.slug)
      .then((eps) => setEpisodes(eps))
      .finally(() => setLoadingEpisodes(false));
  }, [anime, isOpen]);

  if (!isOpen || !anime) return null;

  const posterImage = details?.Resim || anime.posterUrl;
  const bannerImage = details?.Banner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-[#0d0d0d] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner header if available */}
        <div className="relative h-44 sm:h-56 w-full bg-[#151515] overflow-hidden shrink-0">
          {bannerImage ? (
            <img
              src={bannerImage}
              alt={anime.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-40 blur-sm scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-rose-950/40 via-neutral-900 to-indigo-950/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anime Header Info */}
        <div className="relative px-6 -mt-20 sm:-mt-24 pb-4 border-b border-neutral-800 flex flex-col sm:flex-row gap-5 items-start shrink-0">
          {/* Poster */}
          <div className="relative w-28 sm:w-36 aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900 border-2 border-neutral-700 shadow-2xl shrink-0">
            {posterImage ? (
              <img
                src={posterImage}
                alt={anime.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                Afiş Yok
              </div>
            )}
          </div>

          {/* Titles & Meta */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {details?.Kategori || anime.format || 'TV'}
              </span>
              {anime.rating && anime.rating > 0 ? (
                <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {anime.rating.toFixed(2)}
                </span>
              ) : null}
              <span className="text-xs font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                {anime.episodeCount > 0 ? `${anime.episodeCount} Bölüm` : 'Arşiv'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {anime.title}
            </h2>
            {details?.Japonca && (
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                {details.Japonca}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(details?.['Anime Türü'] || anime.genres || []).map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={(e) => onToggleFavorite(e, anime)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isFavorite
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                    : 'bg-neutral-800 text-neutral-200 border-neutral-700 hover:bg-neutral-700'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                />
                {isFavorite ? 'Favorilerinde' : 'Favorilere Ekle'}
              </button>

              {episodes.length > 0 && (
                <button
                  onClick={() =>
                    onStartWatch(anime, episodes[0].slug, episodes[0].ad)
                  }
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition-colors shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-black" /> 1. Bölümü İzle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body content scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#121212] p-3.5 rounded-xl border border-neutral-800/80">
            {details?.Stüdyo && (
              <div>
                <span className="text-neutral-500 block mb-0.5">Stüdyo</span>
                <span className="font-semibold text-neutral-200">{details.Stüdyo}</span>
              </div>
            )}
            {details?.['Başlama Tarihi'] && (
              <div>
                <span className="text-neutral-500 block mb-0.5">Başlama</span>
                <span className="font-semibold text-neutral-200">
                  {details['Başlama Tarihi']}
                </span>
              </div>
            )}
            {details?.['Bitiş Tarihi'] && (
              <div>
                <span className="text-neutral-500 block mb-0.5">Bitiş</span>
                <span className="font-semibold text-neutral-200">
                  {details['Bitiş Tarihi']}
                </span>
              </div>
            )}
            <div>
              <span className="text-neutral-500 block mb-0.5">Mevcut Linkler</span>
              <span className="font-semibold text-emerald-400">
                {anime.linkCount} Alternatif
              </span>
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider mb-2">
              Özet & Konusu
            </h3>
            {loadingDetails ? (
              <div className="flex items-center gap-2 text-neutral-400 text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Özet yükleniyor...</span>
              </div>
            ) : (
              <p
                className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-prose"
                dangerouslySetInnerHTML={{
                  __html:
                    details?.Özet ||
                    'Bu animeye ait detaylı açıklama metni arşivde kayıtlı değil.',
                }}
              />
            )}
          </div>

          {/* Episode List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                <Tv className="w-4 h-4 text-rose-500" />
                Bölümler ({episodes.length})
              </h3>
              {watchedSet.size > 0 && (
                <span className="text-xs font-mono text-emerald-400">
                  {watchedSet.size} / {episodes.length} izlendi
                </span>
              )}
            </div>

            {loadingEpisodes ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                <span>Bölüm listesi ve sunucular getiriliyor...</span>
              </div>
            ) : episodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {episodes.map((ep, idx) => {
                  const isWatched = watchedSet.has(ep.slug);
                  return (
                    <div
                      key={ep.slug || idx}
                      onClick={() => onStartWatch(anime, ep.slug, ep.ad)}
                      className="group/ep p-2.5 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-neutral-800 hover:border-neutral-600 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded bg-neutral-900 border border-neutral-800 group-hover/ep:bg-rose-500 group-hover/ep:text-white group-hover/ep:border-rose-500 text-neutral-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-colors">
                          {ep.no || idx + 1}
                        </span>
                        <span className="text-xs font-medium text-neutral-200 group-hover/ep:text-white truncate">
                          {ep.ad || `${idx + 1}. Bölüm`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isWatched && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <Play className="w-3.5 h-3.5 text-neutral-500 group-hover/ep:text-white transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-900/50 rounded-xl border border-neutral-800">
                Bu anime için arşivlenmiş bölüm bulunamadı veya veri dosyası güncelleniyor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
