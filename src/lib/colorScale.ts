/**
 * Color scale untuk choropleth heatmap deforestasi.
 * Input: intensity 0.0–1.0 (log-normalized dari record_count)
 * Output: RGBA tuple untuk deck.gl
 */

// Palet warna: hijau (rendah) → kuning → oranye → merah (tinggi)
const COLOR_STOPS: Array<[number, [number, number, number]]> = [
  [0.0,  [34,  139, 34]],    // forest green — tidak ada/sangat sedikit
  [0.25, [154, 205, 50]],    // yellow-green
  [0.5,  [255, 200, 0]],     // kuning
  [0.75, [255, 100, 0]],     // oranye
  [1.0,  [200, 0,   0]],     // merah tua — sangat tinggi
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function intensityToRgba(intensity: number, alpha = 180): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, intensity));

  // Cari dua stop yang mengapit intensity
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [t0, c0] = COLOR_STOPS[i];
    const [t1, c1] = COLOR_STOPS[i + 1];
    if (clamped <= t1) {
      const t = (clamped - t0) / (t1 - t0);
      return [
        Math.round(lerp(c0[0], c1[0], t)),
        Math.round(lerp(c0[1], c1[1], t)),
        Math.round(lerp(c0[2], c1[2], t)),
        alpha
      ];
    }
  }
  return [200, 0, 0, alpha];
}

// Warna polygon deforestasi — oranye transparan
export function polygonFillColor(area_km2: number): [number, number, number, number] {
  // Polygon lebih besar → sedikit lebih opak
  const opacity = Math.min(200, 80 + area_km2 * 0.02);
  return [255, 120, 30, Math.round(opacity)];
}

export const POLYGON_LINE_COLOR: [number, number, number, number] = [255, 80, 0, 220];
export const HEATMAP_LINE_COLOR: [number, number, number, number] = [255, 255, 255, 60];

// ─── C2: Warna centroid berdasarkan severity area_km² ────────────────────────
// < 1 km²    → Kuning   (rendah)
// 1–10 km²   → Oranye   (sedang)
// 10–50 km²  → Merah    (tinggi)
// > 50 km²   → Merah tua (sangat tinggi)
export function centroidSeverityColor(area_km2: number, alpha = 200): [number, number, number, number] {
  // Guard: nilai invalid/negatif/NaN → kelas terkecil (kuning)
  if (!Number.isFinite(area_km2) || area_km2 <= 0) return [252, 211, 77, alpha];
  if (area_km2 < 1)   return [252, 211, 77,  alpha]; // kuning
  if (area_km2 < 10)  return [249, 115, 22,  alpha]; // oranye
  if (area_km2 < 50)  return [239, 68,  68,  alpha]; // merah
  return               [159, 18,  57,  alpha];        // merah tua / crimson
}

// H2: Kelas legend heatmap dengan nilai aktual record_count
export const HEATMAP_LEGEND_CLASSES = [
  { label: '< 100 event',     color: '#228b22', desc: 'Rendah'        },
  { label: '100–500 event',   color: '#ffc800', desc: 'Sedang'        },
  { label: '500–2.000 event', color: '#ff6400', desc: 'Tinggi'        },
  { label: '> 2.000 event',   color: '#c80000', desc: 'Sangat Tinggi' },
] as const;

// C1: Kelas severity untuk legenda — size field menggantikan ternary string-matching
export const CENTROID_SEVERITY_CLASSES = [
  { label: '< 1 km²',    color: '#FCD34D', desc: 'Kecil',        size: 8  },
  { label: '1–10 km²',   color: '#F97316', desc: 'Sedang',       size: 11 },
  { label: '10–50 km²',  color: '#EF4444', desc: 'Besar',        size: 14 },
  { label: '> 50 km²',   color: '#9F1239', desc: 'Sangat Besar', size: 18 },
] as const;

// ─── H7: Delta color untuk mode komparasi dua tahun ──────────────────────────
// delta > 0 → merah (lebih buruk), delta < 0 → hijau (membaik), 0 → abu
export function deltaColor(delta: number, maxDelta: number, alpha = 190): [number, number, number, number] {
  if (maxDelta === 0 || delta === 0) return [100, 100, 100, alpha];
  const t = Math.max(-1, Math.min(1, delta / maxDelta));
  if (t < 0) {
    // Hijau — deforestasi berkurang (membaik)
    const a = -t;
    return [Math.round(lerp(100, 22, a)), Math.round(lerp(130, 163, a)), Math.round(lerp(100, 74, a)), alpha];
  }
  // Merah — deforestasi meningkat (memburuk)
  return [Math.round(lerp(100, 220, t)), Math.round(lerp(100, 38, t)), Math.round(lerp(100, 38, t)), alpha];
}

export const DELTA_LEGEND_CLASSES = [
  { label: 'Meningkat tajam', color: '#DC2626', desc: '↑ Jauh lebih buruk'  },
  { label: 'Meningkat',       color: '#F97316', desc: '↑ Lebih buruk'       },
  { label: 'Tidak berubah',   color: '#6B7280', desc: '— Sama'              },
  { label: 'Berkurang',       color: '#4ADE80', desc: '↓ Lebih baik'        },
  { label: 'Berkurang tajam', color: '#16A34A', desc: '↓ Jauh lebih baik'   },
] as const;
