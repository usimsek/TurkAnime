import {
  AnimeIndexTuple,
  AnimeItem,
  AnimeMetaTuple,
  AnimeDetailInfo,
  EpisodeData,
  EpisodeLink,
} from '../types';

const BERKE_RAW_BASE = 'https://raw.githubusercontent.com/Berke-aras/turkanime-arsiv/main';
const AGNOGAD_RAW_BASE = 'https://raw.githubusercontent.com/agnogad/TurkAnimeTV_Arsiv_json/main/animeler';

// Memory Caches
let cachedAnimeList: AnimeItem[] | null = null;
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
    // 1. Fetch index and meta in parallel from static bundle or GitHub Raw CDN
    let indexData: AnimeIndexTuple[] = [];
    let metaData: Record<string, AnimeMetaTuple> = {};

    try {
      const [resIndex, resMeta] = await Promise.all([
        fetch('/data/anime_index.json'),
        fetch('/data/anime_meta.json'),
      ]);

      if (resIndex.ok && resMeta.ok) {
        indexData = await resIndex.json();
        metaData = await resMeta.json();
      }
    } catch (e) {
      console.warn('Local /data/ not accessible, falling back to GitHub Raw CDN', e);
    }

    // Fallback directly to GitHub Raw if local files weren't loaded
    if (indexData.length === 0) {
      const rawDataRes = await fetch(`${BERKE_RAW_BASE}/kaynak/data.js`);
      if (rawDataRes.ok) {
        const text = await rawDataRes.text();
        const match = text.match(/window\.INDEX\s*=\s*\/\*INDEX_START\*\/(.*?)\/\*INDEX_END\*\/;/s);
        if (match) {
          indexData = JSON.parse(match[1]);
        }
      }

      const rawMetaRes = await fetch(`${BERKE_RAW_BASE}/meta.js`);
      if (rawMetaRes.ok) {
        const text = await rawMetaRes.text();
        const match = text.match(/window\.META\s*=\s*(\{.*?\});\s*$/s);
        if (match) {
          metaData = JSON.parse(match[1]);
        }
      }
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

  // Try Berke-aras repository first
  try {
    const res = await fetch(`${BERKE_RAW_BASE}/kaynak/animeler/${slug}/info.json`);
    if (res.ok) {
      info = await res.json();
    }
  } catch (e) {
    console.warn(`Failed to fetch info from Berke repo for ${slug}:`, e);
  }

  // Fallback to agnogad repo
  if (!info) {
    try {
      const res = await fetch(`${AGNOGAD_RAW_BASE}/${slug}/info.json`);
      if (res.ok) {
        info = await res.json();
      }
    } catch (e) {
      console.warn(`Failed to fetch info from agnogad repo for ${slug}:`, e);
    }
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

  // 1. Primary method: fetch full series episode package from Berke-aras repo (1 single fast request)
  try {
    const res = await fetch(`${BERKE_RAW_BASE}/kaynak/b/${slug}.js`);
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/window\.__TKA__\[.*?\]\s*=\s*(\[.*\]);?\s*$/s);
      if (match) {
        const rawEpisodes = JSON.parse(match[1]);
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
    }
  } catch (e) {
    console.warn(`Error fetching episode package for ${slug}:`, e);
  }

  // 2. Fallback method: agnogad repo bolumler.json
  try {
    const res = await fetch(`${AGNOGAD_RAW_BASE}/${slug}/bolumler.json`);
    if (res.ok) {
      const bolumler: [string, string][] = await res.json();
      if (Array.isArray(bolumler) && bolumler.length > 0) {
        const episodes: EpisodeData[] = bolumler.map(([epSlug, epTitle], idx) => ({
          no: idx + 1,
          ad: epTitle || `${idx + 1}. Bölüm`,
          slug: epSlug,
          links: [], // will be loaded on demand if needed
        }));
        episodesCache.set(slug, episodes);
        return episodes;
      }
    }
  } catch (e) {
    console.warn(`Error fetching bolumler for ${slug}:`, e);
  }

  return [];
}

/**
 * Fetch episode player links if not already present
 */
export async function fetchEpisodeLinksForAgnogad(
  animeSlug: string,
  episodeSlug: string
): Promise<EpisodeLink[]> {
  try {
    const res = await fetch(`${AGNOGAD_RAW_BASE}/${animeSlug}/${episodeSlug}.json`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          player: item.player || 'Oynatıcı',
          fansub: item.fansub || '',
          url: item.url || '',
          mask: item.mask || '',
        }));
      }
    }
  } catch (e) {
    console.error(`Failed to fetch episode players for ${episodeSlug}:`, e);
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
