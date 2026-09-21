import React from 'react';
import {
  Film,
  Heart,
  History,
  Sparkles,
  Shuffle,
  Search,
  BookOpen,
} from 'lucide-react';
import { ActiveView } from '../types';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  favoritesCount: number;
  historyCount: number;
  onRandomAnime: () => void;
  onOpenDailyAnime: () => void;
  onSearchFocus: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  favoritesCount,
  historyCount,
  onRandomAnime,
  onOpenDailyAnime,
  onSearchFocus,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-[#070707]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          id="nav-logo"
          onClick={() => {
            setActiveView('home');
            setSearchQuery('');
          }}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-rose-400 transition-colors">
                TÜRKANİME
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                Arşiv
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 hidden sm:block">
              ~6,100 Anime · Statik Mirror
            </p>
          </div>
        </div>

        {/* Quick Search on desktop when not in home view */}
        {activeView !== 'home' && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveView('home');
                }}
                placeholder="Hemen anime ara..."
                className="w-full bg-[#111] text-sm text-neutral-200 pl-9 pr-4 py-1.5 rounded-lg border border-neutral-800 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Günün Animesi */}
          <button
            id="nav-daily-anime"
            onClick={onOpenDailyAnime}
            title="Günün Animesi"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Günün Animesi</span>
          </button>

          {/* Rastgele Anime */}
          <button
            id="nav-random-anime"
            onClick={onRandomAnime}
            title="Rastgele Bir Anime Keşfet"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-neutral-800 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Rastgele</span>
          </button>

          {/* Favoriler */}
          <button
            id="nav-favorites"
            onClick={() => setActiveView('favorites')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'favorites'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-neutral-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-400' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">Favoriler</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Geçmiş / İzlenenler */}
          <button
            id="nav-history"
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'history'
                ? 'bg-neutral-800 text-white border border-neutral-600'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/80 border border-neutral-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Geçmiş</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
