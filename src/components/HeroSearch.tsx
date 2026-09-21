import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Tv,
  Film,
  Award,
} from 'lucide-react';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedFormat: string;
  setSelectedFormat: (format: string) => void;
  sortBy: 'rating' | 'episodes' | 'name' | 'rank';
  setSortBy: (sort: 'rating' | 'episodes' | 'name' | 'rank') => void;
  totalCount: number;
  filteredCount: number;
  onOpenDailyAnime: () => void;
}

const POPULAR_GENRES = [
  'Tümü',
  'Aksiyon',
  'Shounen',
  'Doğaüstü Güçler',
  'Komedi',
  'Dram',
  'Romantizm',
  'Gizem',
  'Bilim Kurgu',
  'Fantastik',
  'Macera',
  'Psikolojik',
  'Gerilim',
  'Okul',
  'Büyü',
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedFormat,
  setSelectedFormat,
  sortBy,
  setSortBy,
  totalCount,
  filteredCount,
  onOpenDailyAnime,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keydown shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className="relative pt-8 pb-4 sm:pt-12 sm:pb-6 px-4 max-w-5xl mx-auto text-center">
      {/* Decorative gradient aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-rose-600/10 via-amber-500/10 to-indigo-600/10 blur-3xl -z-10 pointer-events-none rounded-full" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 mb-4 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono font-semibold">
          {totalCount > 0 ? `${totalCount.toLocaleString('tr-TR')} Anime Arşivde` : 'Arşiv Yükleniyor...'}
        </span>
        <span className="text-neutral-600">·</span>
        <span className="text-neutral-400">Türkçe Altyazı & Çoklu Sunucu</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-tight">
        TürkAnime Arşivi & <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">Mirror</span>
      </h1>
      <p className="text-neutral-400 text-sm sm:text-base mt-2.5 max-w-2xl mx-auto font-normal">
        Tüm bölümler, alternatif oynatıcılar (GDrive, Mail.ru, Sibnet, Ok.ru) ve AniList afişleriyle tek tıkla arayın ve izleyin.
      </p>

      {/* Center Search Box */}
      <div className="mt-8 relative max-w-2xl mx-auto">
        <div className="relative flex items-center bg-[#0d0d0d] border-2 border-neutral-800 focus-within:border-rose-500 rounded-2xl shadow-2xl shadow-black/80 transition-all overflow-hidden">
          <div className="pl-4 pr-2 text-neutral-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="hero-search-input"
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Anime adı, Japonca isim veya tür yazın..."
            className="w-full bg-transparent py-4 text-base sm:text-lg text-neutral-100 placeholder-neutral-500 focus:outline-none font-medium"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="p-2 mr-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 mr-3 px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <kbd>/</kbd> veya <kbd>Ctrl+K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {POPULAR_GENRES.map((genre) => {
          const isSelected =
            genre === 'Tümü' ? selectedGenre === '' : selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre === 'Tümü' ? '' : genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                isSelected
                  ? 'bg-white text-black border-white shadow font-semibold'
                  : 'bg-[#111] text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Controls Bar: Format, Sorting, Results Count */}
      <div className="mt-4 pt-4 border-t border-neutral-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
        {/* Format tabs */}
        <div className="flex items-center gap-1 bg-[#111] p-1 rounded-lg border border-neutral-800">
          {['Tümü', 'TV', 'Movie', 'OVA'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt === 'Tümü' ? '' : fmt)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all ${
                (fmt === 'Tümü' && !selectedFormat) || selectedFormat === fmt
                  ? 'bg-neutral-800 text-white font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-neutral-500">Sırala:</span>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#111] text-neutral-200 text-xs px-2.5 py-1 rounded-lg border border-neutral-800 focus:outline-none focus:border-neutral-600 font-mono cursor-pointer"
          >
            <option value="rating">En Yüksek Puan</option>
            <option value="episodes">Bölüm Sayısı</option>
            <option value="name">İsim (A-Z)</option>
            <option value="rank">Popülerlik / Sıra</option>
          </select>
        </div>

        {/* Filter count */}
        <div className="font-mono text-neutral-500">
          <span className="text-neutral-300 font-semibold">
            {filteredCount.toLocaleString('tr-TR')}
          </span>{' '}
          anime listeleniyor
        </div>
      </div>
    </section>
  );
};
