/**
 * API Client — wrapper untuk semua request ke backend FastAPI
 * Base URL via Vite proxy: /api → http://localhost:8000/api
 */

import type {
  FeatureCollection,
  KotaHeatmapProperties,
  PolygonProperties,
  YearCount
} from './types';

const BASE = '';  // Vite proxy meneruskan /api ke http://localhost:8000

// ─── Polygon Deforestasi (viewport-based) ────────────────────────────────────

export interface PolygonParams {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  year?: number | null;
  limit?: number;
}

export async function fetchPolygons(
  params: PolygonParams,
  signal?: AbortSignal
): Promise<FeatureCollection<PolygonProperties>> {
  const p = new URLSearchParams({
    min_lon: String(params.minLon),
    min_lat: String(params.minLat),
    max_lon: String(params.maxLon),
    max_lat: String(params.maxLat),
    limit:   String(params.limit ?? 5000)
  });
  if (params.year != null) p.set('year', String(params.year));

  const res = await fetch(`${BASE}/api/polygons?${p}`, { signal });
  if (!res.ok) throw new Error(`fetchPolygons: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Heatmap Kota (pre-computed, cached di server) ───────────────────────────

export async function fetchHeatmap(
  year?: number | null,
  signal?: AbortSignal
): Promise<FeatureCollection<KotaHeatmapProperties>> {
  const url = year != null
    ? `${BASE}/api/heatmap/kota?year=${year}`
    : `${BASE}/api/heatmap/kota`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`fetchHeatmap: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Daftar Tahun ─────────────────────────────────────────────────────────────

export async function fetchYears(): Promise<YearCount[]> {
  const res = await fetch(`${BASE}/api/years`);
  if (!res.ok) throw new Error(`fetchYears: ${res.status}`);
  const data = await res.json();
  return data.years as YearCount[];
}
