// utils/clientCache.ts
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export const fetchWithCache = async (url: string) => {
  if (typeof window === 'undefined') {
    return fetch(url).then(res => res.json());
  }

  const cachedData = localStorage.getItem(url);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_DURATION) {
      // console.log(`Client cache hit for ${url}`);
      return { data, fromCache: true };
    }
  }

  // console.log(`Client cache miss for ${url}, fetching from server`);
  const response = await fetch(url);
  const { data, timestamp } = await response.json();
  localStorage.setItem(url, JSON.stringify({ data, timestamp }));
  return { data, fromCache: false };
};