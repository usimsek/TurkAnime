import { FavoriteItem, WatchHistoryItem } from '../types';

const FAVORITES_KEY = 'turkanime_favorites_v1';
const HISTORY_KEY = 'turkanime_history_v1';

export function getStoredFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read favorites:', e);
    return [];
  }
}

export function saveFavorite(item: FavoriteItem): FavoriteItem[] {
  const current = getStoredFavorites();
  const exists = current.some((f) => f.slug === item.slug);
  let updated: FavoriteItem[];
  if (exists) {
    updated = current.filter((f) => f.slug !== item.slug);
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
  return updated;
}

export function isFavoriteStored(slug: string): boolean {
  const current = getStoredFavorites();
  return current.some((f) => f.slug === slug);
}

export function getStoredHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read history:', e);
    return [];
  }
}

export function saveWatchHistory(item: WatchHistoryItem): WatchHistoryItem[] {
  const current = getStoredHistory();
  // Filter out same episode if previously watched, and keep max 50 items
  const filtered = current.filter(
    (h) => !(h.animeSlug === item.animeSlug && h.episodeSlug === item.episodeSlug)
  );
  const updated = [item, ...filtered].slice(0, 50);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
  return updated;
}

export function clearStoredHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

export function removeHistoryItem(animeSlug: string, episodeSlug: string): WatchHistoryItem[] {
  const current = getStoredHistory();
  const updated = current.filter(
    (h) => !(h.animeSlug === animeSlug && h.episodeSlug === episodeSlug)
  );
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update history:', e);
  }
  return updated;
}
