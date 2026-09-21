export type AnimeIndexTuple = [
  slug: string,
  title: string,
  episodeCount: number,
  linkCount: number,
  rank: number,
  providers: string[]
];

export type AnimeMetaTuple = [
  format: string,
  genres: string[],
  rating: number,
  posterUrl: string
];

export interface AnimeItem {
  slug: string;
  title: string;
  episodeCount: number;
  linkCount: number;
  rank: number;
  providers: string[];
  format?: string;
  genres?: string[];
  rating?: number;
  posterUrl?: string;
}

export interface AnimeDetailInfo {
  Kategori?: string;
  Japonca?: string;
  "Anime Türü"?: string[];
  "Bölüm Sayısı"?: string;
  "Başlama Tarihi"?: string;
  "Bitiş Tarihi"?: string;
  Stüdyo?: string | null;
  Puanı?: number;
  Özet?: string;
  Resim?: string;
  Banner?: string;
}

export interface EpisodeLink {
  player: string;
  fansub?: string;
  tip?: string;
  url?: string;
  path?: string;
  mask?: string;
}

export interface EpisodeData {
  no: number;
  ad: string;
  slug: string;
  links: EpisodeLink[];
}

export interface WatchHistoryItem {
  animeSlug: string;
  animeTitle: string;
  episodeSlug: string;
  episodeTitle: string;
  episodeNo: number;
  poster?: string;
  timestamp: number;
  playerName?: string;
}

export interface FavoriteItem {
  slug: string;
  title: string;
  poster?: string;
  rating?: number;
  episodeCount: number;
  genres?: string[];
  addedAt: number;
}

export type ActiveView = 'home' | 'anime-detail' | 'watch' | 'favorites' | 'history';
