import { constructRequestInit, fetchApi } from "$lib/utils/request";
import type { YGOProDeckCard } from "$lib/types/ygoprodeck";

interface YGOProDeckResponseJson {
  data: YGOProDeckCard[];
}

const API_BASE_URL = "https://db.ygoprodeck.com/api/v7";
async function fetchYGOProDeckAPI(fetchFunction: typeof fetch, path: string): Promise<YGOProDeckResponseJson | null> {
  const requestInit = constructRequestInit();
  const requestConfig = {
    ...requestInit,
    method: "GET",
  };
  const url = `${API_BASE_URL}/${path}`;
  const response = await fetchApi(fetchFunction, url, requestConfig);
  if (!response.ok) return null;
  return await response.json();
}

export async function getCardById(fetchFunction: typeof fetch, id: number): Promise<YGOProDeckCard | null> {
  const path = `cardinfo.php?id=${id}`;
  const data = await fetchYGOProDeckAPI(fetchFunction, path);
  return data?.data[0] || null;
}

export async function getCardsByIds(fetchFunction: typeof fetch, ids: number[]): Promise<YGOProDeckCard[]> {
  if (ids.length === 0) return [];
  const idsString = ids.join(",");
  const path = `cardinfo.php?id=${idsString}`;
  const data = await fetchYGOProDeckAPI(fetchFunction, path);
  return data?.data || [];
}

export async function searchCardsByName(fetchFunction: typeof fetch, name: string): Promise<YGOProDeckCard[]> {
  const encodedName = encodeURIComponent(name);
  const path = `cardinfo.php?fname=${encodedName}`;
  const data = await fetchYGOProDeckAPI(fetchFunction, path);
  return data?.data || [];
}
