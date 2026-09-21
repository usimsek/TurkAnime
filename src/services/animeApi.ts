import {
  AnimeIndexTuple,
  AnimeItem,
  AnimeMetaTuple,
  AnimeDetailInfo,
  EpisodeData,
  EpisodeLink,
} from '../types';

// Memory Caches
let cachedAnimeList: AnimeItem[] | null = null;
let allDetailsMap: Record<string, AnimeDetailInfo> | null = null;
const detailsCache = new Map<string, AnimeDetailInfo>();
const episodesCache = new Map<string, EpisodeData[]>();
const anilistCache = new Map<string, { cover?: string; banner?: string }>();

export const slugToReadableTitle = (slug: string): string => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Loads the full catalog of ~6,100 anime with meta (ratings, genres, format, posters).
 */
export async function loadAnimeCatalog(): Promise<AnimeItem[]> {
  if (cachedAnimeList && cachedAnimeList.length > 0) {
    return cachedAnimeList;
  }

  try {
    const [resIndex, resMeta] = await Promise.all([
      fetch('/data/anime_index.json'),
      fetch('/data/anime_meta.json'),
    ]);

    let indexData: AnimeIndexTuple[] = [];
    let metaData: Record<string, AnimeMetaTuple> = {};

    if (resIndex.ok && resMeta.ok) {
      indexData = await resIndex.json();
      metaData = await resMeta.json();
    }

    const merged: AnimeItem[] = indexData.map(([slug, title, episodeCount, linkCount, rank, providers]) => {
      const meta = metaData[slug];
      return {
        slug,
        title: title || slugToReadableTitle(slug),
        episodeCount: Number(episodeCount) || 0,
        linkCount: Number(linkCount) || 0,
        rank: Number(rank) || 0,
        providers: Array.isArray(providers) ? providers : [],
        format: meta ? meta[0] : 'TV',
        genres: meta && Array.isArray(meta[1]) ? meta[1] : [],
        rating: meta && typeof meta[2] === 'number' ? meta[2] : 0,
        posterUrl: meta && meta[3] ? meta[3] : undefined,
      };
    });

    cachedAnimeList = merged;
    return merged;
  } catch (error) {
    console.error('Error loading anime catalog:', error);
    return [];
  }
}

/**
 * Fetch detailed info for a single anime
 */
export async function fetchAnimeDetails(slug: string): Promise<AnimeDetailInfo | null> {
  if (detailsCache.has(slug)) {
    return detailsCache.get(slug)!;
  }

  let info: AnimeDetailInfo | null = null;

  try {
    if (!allDetailsMap) {
      const res = await fetch('/data/anime_details.json');
      if (res.ok) {
        allDetailsMap = await res.json();
      }
    }
    if (allDetailsMap && allDetailsMap[slug]) {
      info = { ...allDetailsMap[slug] };
    }
  } catch (e) {
    console.warn(`Local anime_details not loaded for ${slug}:`, e);
  }

  // If still null, create fallback from slug
  if (!info) {
    info = {
      Kategori: 'TV',
      Özet: 'Bu anime için detaylı özet bilgisi arşivde bulunamadı.',
    };
  }

  // Check AniList for high-res cover and banner
  try {
    const aniListMedia = await fetchAniListMedia(slugToReadableTitle(slug));
    if (aniListMedia) {
      if (aniListMedia.cover && (!info.Resim || info.Resim.includes('turkanime.co'))) {
        info.Resim = aniListMedia.cover;
      }
      if (aniListMedia.banner) {
        info.Banner = aniListMedia.banner;
      }
    }
  } catch (e) {
    // Ignore AniList error
  }

  detailsCache.set(slug, info);
  return info;
}

/**
 * Fetch episode list and player sources for an anime
 */
export async function fetchAnimeEpisodes(slug: string): Promise<EpisodeData[]> {
  if (episodesCache.has(slug)) {
    return episodesCache.get(slug)!;
  }

  try {
    const res = await fetch(`/data/episodes/${slug}.json`);
    if (res.ok) {
      const rawEpisodes = await res.json();
      if (Array.isArray(rawEpisodes) && rawEpisodes.length > 0) {
        const episodes: EpisodeData[] = rawEpisodes.map((ep, idx) => ({
          no: ep.no ?? (idx + 1),
          ad: ep.ad || `${ep.no || idx + 1}. Bölüm`,
          slug: ep.slug || `${slug}-${idx + 1}-bolum`,
          links: Array.isArray(ep.links)
            ? ep.links.map((l: any) => ({
                player: l.player || 'Oynatıcı',
                fansub: l.fansub || '',
                tip: l.tip || 'url',
                url: l.url || '',
              }))
            : [],
        }));
        episodesCache.set(slug, episodes);
        return episodes;
      }
    }
  } catch (e) {
    console.warn(`Local episode data not loaded for ${slug}:`, e);
  }

  return [];
}

/**
 * Fetch cover and banner image from AniList GraphQL
 */
export async function fetchAniListMedia(
  searchTerm: string
): Promise<{ cover?: string; banner?: string } | null> {
  const clean = searchTerm.trim().toLowerCase();
  if (!clean) return null;

  if (anilistCache.has(clean)) {
    return anilistCache.get(clean)!;
  }

  try {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          coverImage {
            extraLarge
            large
          }
          bannerImage
        }
      }
    `;

    const res = await fetch('https://graphql.anilist.co/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { search: searchTerm } }),
    });

    if (res.ok) {
      const data = await res.json();
      const media = data?.data?.Media;
      const result = {
        cover: media?.coverImage?.extraLarge || media?.coverImage?.large,
        banner: media?.bannerImage,
      };
      anilistCache.set(clean, result);
      return result;
    }
  } catch (e) {
    // Ignore network / rate limit errors
  }

  return null;
}
