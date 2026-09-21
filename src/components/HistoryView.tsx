import React from 'react';
import { History, Play, Trash2, ArrowLeft, Clock } from 'lucide-react';
import { WatchHistoryItem } from '../types';

interface HistoryViewProps {
  history: WatchHistoryItem[];
  onClearHistory: () => void;
  onRemoveHistoryItem: (animeSlug: string, episodeSlug: string) => void;
  onResumeWatch: (historyItem: WatchHistoryItem) => void;
  onBackToHome: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onRemoveHistoryItem,
  onResumeWatch,
  onBackToHome,
}) => {
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Az önce';
    if (mins < 60) return `${mins} dakika önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
              <History className="w-5 h-5 text-neutral-400" />
              İzleme Geçmişi
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              En son izlediğin {history.length} bölüm
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Geçmişi Temizle</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-[#0d0d0d] rounded-2xl border border-neutral-800/80 mt-6 p-8">
          <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">İzleme geçmişin boş</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            İzlediğin bölümler otomatik olarak buraya kaydedilir ve kaldığın yeri kolayca bulmanı sağlar.
          </p>
          <button
            onClick={onBackToHome}
            className="mt-5 px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors"
          >
            Anime İzlemeye Başla
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-2.5">
          {history.map((item) => (
            <div
              key={`${item.animeSlug}-${item.episodeSlug}`}
              className="group flex items-center justify-between gap-4 p-3 rounded-xl bg-[#0d0d0d] hover:bg-[#121212] border border-neutral-800/80 hover:border-neutral-700 transition-all"
            >
              <div
                onClick={() => onResumeWatch(item)}
                className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-12 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.animeTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">
                      Anime
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <Play className="w-4 h-4 fill-white text-white opacity-80 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-neutral-200 group-hover:text-rose-400 transition-colors truncate">
                    {item.animeTitle}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                    <span className="font-mono text-neutral-300 font-medium">
                      {item.episodeTitle}
                    </span>
                    {item.playerName && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                        {item.playerName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp & Remove */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-xs text-neutral-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(item.timestamp)}</span>
                </div>

                <button
                  onClick={() => onResumeWatch(item)}
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span className="hidden sm:inline">İzle</span>
                </button>

                <button
                  onClick={() =>
                    onRemoveHistoryItem(item.animeSlug, item.episodeSlug)
                  }
                  title="Geçmişten Kaldır"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
