import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { AnimeCard } from './components/AnimeCard';
import { AnimeDetailModal } from './components/AnimeDetailModal';
import { PlayerView } from './components/PlayerView';
import { FavoritesView } from './components/FavoritesView';
import { HistoryView } from './components/HistoryView';
import { DailyFeaturedBanner } from './components/DailyFeaturedBanner';
import {
  AnimeItem,
  ActiveView,
  FavoriteItem,
  WatchHistoryItem,
} from './types';
import { loadAnimeCatalog, fetchAnimeEpisodes } from './services/animeApi';
import {
  getStoredFavorites,
  saveFavorite,
  getStoredHistory,
  clearStoredHistory,
  removeHistoryItem,
} from './utils/storage';
import {
  Loader2,
  AlertCircle,
  Flame,
  Film,
  Sparkles,
  ChevronDown,
  ArrowUp,
} from 'lucide-react';

const ITEMS_PER_PAGE = 48;

export default function App() {
  const [allAnime, setAllAnime] = useState<AnimeItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'episodes' | 'name' | 'rank'>('rating');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // Selected for Modal & Watch
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [watchAnime, setWatchAnime] = useState<AnimeItem | null>(null);
  const [watchEpisodeSlug, setWatchEpisodeSlug] = useState<string>('');

  // Favorites & History
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  // Load catalog and stored preferences on mount
  useEffect(() => {
    setFavorites(getStoredFavorites());
    setHistory(getStoredHistory());

    loadAnimeCatalog()
      .then((catalog) => {
        setAllAnime(catalog);
      })
      .finally(() => {
        setLoadingCatalog(false);
      });
  }, []);

  // Sync favorites helper
  const handleToggleFavorite = (e: React.MouseEvent, anime: AnimeItem) => {
    e.stopPropagation();
    const item: FavoriteItem = {
      slug: anime.slug,
      title: anime.title,
      poster: anime.posterUrl,
      rating: anime.rating,
      episodeCount: anime.episodeCount,
      genres: anime.genres,
      addedAt: Date.now(),
    };
    const updated = saveFavorite(item);
    setFavorites(updated);
  };

  const isFavorite = (slug: string) => {
    return favorites.some((f) => f.slug === slug);
  };

  // Günün Animesi (Daily Anime chosen deterministically based on date)
  const dailyAnime = useMemo(() => {
    if (allAnime.length === 0) return null;
    const highRated = allAnime.filter(
      (a) => (a.rating || 0) >= 8.2 && a.episodeCount > 0 && a.posterUrl
    );
    if (highRated.length === 0) return allAnime[0];
    const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return highRated[daySeed % highRated.length];
  }, [allAnime]);

  // Random Anime Selector
  const handleRandomAnime = () => {
    if (allAnime.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allAnime.length);
    const chosen = allAnime[randomIndex];
    setSelectedAnime(chosen);
    setIsDetailModalOpen(true);
  };

  // Open Daily Anime
  const handleOpenDailyAnime = () => {
    if (dailyAnime) {
      setSelectedAnime(dailyAnime);
      setIsDetailModalOpen(true);
    }
  };

  // Quick Watch handler
  const handleQuickWatch = async (anime: AnimeItem) => {
    // Check if user watched this anime before to resume
    const lastWatched = history.find((h) => h.animeSlug === anime.slug);
    if (lastWatched) {
      setWatchAnime(anime);
      setWatchEpisodeSlug(lastWatched.episodeSlug);
      setActiveView('watch');
      return;
    }

    // Otherwise fetch first episode
    try {
      const eps = await fetchAnimeEpisodes(anime.slug);
      if (eps.length > 0) {
        setWatchAnime(anime);
        setWatchEpisodeSlug(eps[0].slug);
        setActiveView('watch');
      } else {
        setSelectedAnime(anime);
        setIsDetailModalOpen(true);
      }
    } catch (e) {
      setSelectedAnime(anime);
      setIsDetailModalOpen(true);
    }
  };

  // Filtered & Sorted anime list
  const filteredAnime = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allAnime
      .filter((anime) => {
        // Search query filter
        if (q) {
          const matchTitle = anime.title.toLowerCase().includes(q);
          const matchSlug = anime.slug.toLowerCase().includes(q);
          const matchGenre = anime.genres?.some((g) => g.toLowerCase().includes(q));
          if (!matchTitle && !matchSlug && !matchGenre) return false;
        }

        // Genre filter
        if (selectedGenre) {
          if (!anime.genres?.includes(selectedGenre)) return false;
        }

        // Format filter
        if (selectedFormat) {
          if (anime.format !== selectedFormat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'episodes') {
          return b.episodeCount - a.episodeCount;
        }
        if (sortBy === 'name') {
          return a.title.localeCompare(b.title, 'tr');
        }
        if (sortBy === 'rank') {
          return b.rank - a.rank;
        }
        return 0;
      });
  }, [allAnime, searchQuery, selectedGenre, selectedFormat, sortBy]);

  // Reset pagination when filter changes
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedGenre, selectedFormat, sortBy]);

  const displayedAnime = useMemo(() => {
    return filteredAnime.slice(0, displayCount);
  }, [filteredAnime, displayCount]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-neutral-100 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => setActiveView(view)}
        favoritesCount={favorites.length}
        historyCount={history.length}
        onRandomAnime={handleRandomAnime}
        onOpenDailyAnime={handleOpenDailyAnime}
        onSearchFocus={() => {
          document.getElementById('hero-search-input')?.focus();
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {activeView === 'watch' && watchAnime ? (
          <PlayerView
            anime={watchAnime}
            currentEpisodeSlug={watchEpisodeSlug}
            onSelectEpisode={(slug) => setWatchEpisodeSlug(slug)}
            onBack={() => setActiveView('home')}
            isFavorite={isFavorite(watchAnime.slug)}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetails={() => {
              setSelectedAnime(watchAnime);
              setIsDetailModalOpen(true);
            }}
          />
        ) : activeView === 'favorites' ? (
          <FavoritesView
            favorites={favorites}
            onRemoveFavorite={(slug) => {
              const item = favorites.find((f) => f.slug === slug);
              if (item) {
                const updated = saveFavorite(item);
                setFavorites(updated);
              }
            }}
            onSelectAnimeBySlug={(slug) => {
              const found = allAnime.find((a) => a.slug === slug);
              if (found) {
                setSelectedAnime(found);
                setIsDetailModalOpen(true);
              }
            }}
            onBackToHome={() => setActiveView('home')}
          />
        ) : activeView === 'history' ? (
          <HistoryView
            history={history}
            onClearHistory={() => {
              clearStoredHistory();
              setHistory([]);
            }}
            onRemoveHistoryItem={(animeSlug, episodeSlug) => {
              const updated = removeHistoryItem(animeSlug, episodeSlug);
              setHistory(updated);
            }}
            onResumeWatch={(item) => {
              const found = allAnime.find((a) => a.slug === item.animeSlug) || {
                slug: item.animeSlug,
                title: item.animeTitle,
                episodeCount: 0,
                linkCount: 0,
                rank: 0,
                providers: [],
                posterUrl: item.poster,
              };
              setWatchAnime(found);
              setWatchEpisodeSlug(item.episodeSlug);
              setActiveView('watch');
            }}
            onBackToHome={() => setActiveView('home')}
          />
        ) : (
          /* Home View with Hero Search & Grid */
          <div className="pb-16">
            {/* Search Header */}
            <HeroSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedGenre={selectedGenre}
              setSelectedGenre={setSelectedGenre}
              selectedFormat={selectedFormat}
              setSelectedFormat={setSelectedFormat}
              sortBy={sortBy}
              setSortBy={setSortBy}
              totalCount={allAnime.length}
              filteredCount={filteredAnime.length}
              onOpenDailyAnime={handleOpenDailyAnime}
            />

            {/* Daily Featured Banner (when no search query is typed) */}
            {!searchQuery && !selectedGenre && (
              <DailyFeaturedBanner
                anime={dailyAnime}
                onSelectAnime={(a) => {
                  setSelectedAnime(a);
                  setIsDetailModalOpen(true);
                }}
                onQuickWatch={handleQuickWatch}
              />
            )}

            {/* Anime Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
              {loadingCatalog ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-neutral-400">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                  <span className="font-mono text-sm">
                    6,100+ Anime arşivi ve indeksleri yükleniyor...
                  </span>
                </div>
              ) : filteredAnime.length === 0 ? (
                <div className="py-20 text-center bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-8 max-w-lg mx-auto">
                  <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">Sonuç bulunamadı</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    "{searchQuery}" aramasıyla eşleşen anime bulunamadı. Filtreleri temizlemeyi deneyin.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGenre('');
                      setSelectedFormat('');
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors"
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
                    {displayedAnime.map((anime) => (
                      <AnimeCard
                        key={anime.slug}
                        anime={anime}
                        isFavorite={isFavorite(anime.slug)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectAnime={(a) => {
                          setSelectedAnime(a);
                          setIsDetailModalOpen(true);
                        }}
                        onQuickWatch={handleQuickWatch}
                      />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {displayCount < filteredAnime.length && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={() =>
                          setDisplayCount((prev) => prev + ITEMS_PER_PAGE)
                        }
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111] hover:bg-[#181818] border border-neutral-800 hover:border-neutral-600 text-white text-xs font-mono font-semibold transition-all shadow-lg hover:shadow-black/50"
                      >
                        <ChevronDown className="w-4 h-4 text-rose-500" />
                        <span>
                          Daha Fazla Göster ({filteredAnime.length - displayCount} anime daha)
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#070707] py-6 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-neutral-300">TÜRKANİME ARŞİV</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1 hover:text-neutral-300 transition-colors"
            >
              <ArrowUp className="w-3 h-3" /> Yukarı Çık
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isFavorite={selectedAnime ? isFavorite(selectedAnime.slug) : false}
        onToggleFavorite={handleToggleFavorite}
        onStartWatch={(anime, epSlug) => {
          setIsDetailModalOpen(false);
          setWatchAnime(anime);
          setWatchEpisodeSlug(epSlug);
          setActiveView('watch');
        }}
      />
    </div>
  );
}
