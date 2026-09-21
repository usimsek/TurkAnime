import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Tv,
  CheckCircle2,
  Server,
  ExternalLink,
  Heart,
  Loader2,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { AnimeItem, EpisodeData, EpisodeLink } from '../types';
import { fetchAnimeEpisodes } from '../services/animeApi';
import { saveWatchHistory } from '../utils/storage';

interface PlayerViewProps {
  anime: AnimeItem;
  currentEpisodeSlug: string;
  onSelectEpisode: (episodeSlug: string, episodeTitle: string) => void;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, anime: AnimeItem) => void;
  onOpenDetails: () => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  anime,
  currentEpisodeSlug,
  onSelectEpisode,
  onBack,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
}) => {
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Fetch episodes on mount or anime change
  useEffect(() => {
    setLoadingEpisodes(true);
    fetchAnimeEpisodes(anime.slug)
      .then((eps) => {
        setEpisodes(eps);
      })
      .finally(() => setLoadingEpisodes(false));
  }, [anime.slug]);

  // Current episode object
  const currentEpisodeIndex = episodes.findIndex((ep) => ep.slug === currentEpisodeSlug);
  const currentEpisode =
    currentEpisodeIndex >= 0 ? episodes[currentEpisodeIndex] : episodes[0];

  // Save to history whenever episode changes
  useEffect(() => {
    if (currentEpisode) {
      saveWatchHistory({
        animeSlug: anime.slug,
        animeTitle: anime.title,
        episodeSlug: currentEpisode.slug,
        episodeTitle: currentEpisode.ad || `${currentEpisode.no}. Bölüm`,
        episodeNo: currentEpisode.no,
        poster: anime.posterUrl,
        timestamp: Date.now(),
        playerName: currentEpisode.links?.[activePlayerIndex]?.player,
      });
    }
  }, [anime.slug, currentEpisode?.slug, activePlayerIndex]);

  // Reset active player when episode changes
  useEffect(() => {
    setActivePlayerIndex(0);
  }, [currentEpisodeSlug]);

  const activeLinks: EpisodeLink[] = currentEpisode?.links || [];
  const currentLink = activeLinks[activePlayerIndex];

  const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
  const nextEpisode =
    currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1
      ? episodes[currentEpisodeIndex + 1]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d0d0d] border border-neutral-800/80 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Geri</span>
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{anime.title}</h2>
            <p className="text-[11px] text-neutral-400 font-mono truncate">
              {currentEpisode ? currentEpisode.ad : 'Bölüm yükleniyor...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Details info button */}
          <button
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Anime Detayı</span>
          </button>

          {/* Favorite button */}
          <button
            onClick={(e) => onToggleFavorite(e, anime)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
              isFavorite
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
            />
            <span className="hidden sm:inline">
              {isFavorite ? 'Favorilerinde' : 'Favorilere Ekle'}
            </span>
          </button>

          {/* Theater mode */}
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            title="Sinema Modu"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
          >
            {isTheaterMode ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Player on left, episode list on right */}
      <div
        className={`grid gap-4 ${
          isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
        }`}
      >
        {/* Video Player Column */}
        <div className={isTheaterMode ? 'w-full' : 'lg:col-span-8 xl:col-span-9 space-y-3'}>
          {/* Iframe Video Container */}
          <div className="relative aspect-video w-full bg-black rounded-xl border border-neutral-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {loadingEpisodes ? (
              <div className="flex flex-col items-center gap-3 text-neutral-400 font-mono text-xs">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                <span>Oynatıcı ve video kaynağı yükleniyor...</span>
              </div>
            ) : currentLink && currentLink.url ? (
              <iframe
                key={currentLink.url}
                src={currentLink.url}
                title={`${anime.title} - ${currentEpisode?.ad || 'Bölüm'}`}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="p-8 text-center space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white font-mono">
                  Oynatıcı Kaynağı Bulunamadı
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Bu bölüm için aktif bir HTTPS embed linki bulunamadı veya link arşivi güncelleniyor. Lütfen aşağıdaki diğer oynatıcı alternatiflerini deneyin.
                </p>
              </div>
            )}
          </div>

          {/* Player controls & server selection */}
          <div className="bg-[#0d0d0d] border border-neutral-800 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Prev / Next Episode Buttons */}
              <div className="flex items-center gap-2">
                <button
                  disabled={!prevEpisode}
                  onClick={() =>
                    prevEpisode && onSelectEpisode(prevEpisode.slug, prevEpisode.ad)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 disabled:opacity-40 font-mono text-xs font-semibold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Önceki Bölüm
                </button>
                <button
                  disabled={!nextEpisode}
                  onClick={() =>
                    nextEpisode && onSelectEpisode(nextEpisode.slug, nextEpisode.ad)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 font-mono text-xs font-bold transition-colors shadow"
                >
                  Sonraki Bölüm <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Open Link (Fallback for strict frame restrictions) */}
              {currentLink?.url && (
                <a
                  href={currentLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-mono text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Yeni Sekmede Aç</span>
                </a>
              )}
            </div>

            {/* Server / Player Chips Selection */}
            {activeLinks.length > 0 && (
              <div className="pt-2 border-t border-neutral-800/80">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono text-neutral-400">
                  <Server className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Mevcut Alternatif Sunucular ({activeLinks.length}):</span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {activeLinks.map((link, idx) => {
                    const isSelected = idx === activePlayerIndex;
                    return (
                      <button
                        key={`${link.player}-${idx}`}
                        onClick={() => setActivePlayerIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-white text-black border-white shadow font-bold'
                            : 'bg-[#141414] text-neutral-300 border-neutral-800 hover:border-neutral-600'
                        }`}
                      >
                        <span>{link.player}</span>
                        {link.fansub && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded ${
                              isSelected
                                ? 'bg-neutral-200 text-black'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {link.fansub}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episodes Sidebar Column */}
        <div
          className={
            isTheaterMode
              ? 'w-full'
              : 'lg:col-span-4 xl:col-span-3 bg-[#0d0d0d] border border-neutral-800 rounded-xl p-4 flex flex-col h-[600px]'
          }
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
            <h3 className="text-xs font-bold font-mono text-neutral-200 uppercase tracking-wider flex items-center gap-2">
              <Tv className="w-4 h-4 text-rose-500" />
              Bölümler ({episodes.length})
            </h3>
            <span className="text-[11px] font-mono text-neutral-500">
              {currentEpisode ? `${currentEpisode.no}. Bölüm` : ''}
            </span>
          </div>

          {/* Episode List Items */}
          <div className="mt-3 space-y-1.5 overflow-y-auto flex-1 pr-1">
            {episodes.map((ep, idx) => {
              const isActive = ep.slug === currentEpisode?.slug;
              return (
                <div
                  key={ep.slug || idx}
                  onClick={() => onSelectEpisode(ep.slug, ep.ad)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow font-semibold'
                      : 'bg-[#121212] border-neutral-800/80 text-neutral-400 hover:text-neutral-100 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] shrink-0 font-bold ${
                        isActive
                          ? 'bg-rose-500 text-white'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {ep.no || idx + 1}
                    </span>
                    <span className="truncate">{ep.ad || `${idx + 1}. Bölüm`}</span>
                  </div>

                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
