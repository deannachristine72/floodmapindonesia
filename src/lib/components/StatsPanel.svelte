<script lang="ts">
  import type { LayerMode, StatsData } from '$lib/types';

  let {
    stats        = null,
    showingOnMap = 0,
    loading      = false,
    layerMode    = 'centroids',
  }: {
    stats:        StatsData | null;
    showingOnMap: number;
    loading:      boolean;
    layerMode:    LayerMode;
  } = $props();

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function formatNum(n: number | null | undefined, decimals = 0): string {
    if (n == null) return '—';
    return n.toLocaleString('id-ID', { maximumFractionDigits: decimals });
  }

  const mapLabel = $derived(layerMode === 'heatmap' ? 'kab/kota' : 'titik');
</script>

<div class="space-y-3">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      Stats
    </span>
    {#if stats && !loading}
      <span class="text-sm font-bold text-orange-500 dark:text-orange-400">
        {formatNum(stats.total_events)} events
      </span>
    {/if}
  </div>

  {#if loading}
    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
         role="status" aria-label="Memuat statistik">
      <span class="inline-block w-3 h-3 border-2 border-gray-400 dark:border-gray-400
                   border-t-transparent rounded-full animate-spin"></span>
      Memuat statistik...
    </div>

  {:else if stats}
    <!-- Total Luas -->
    <div class="bg-gray-100 dark:bg-gray-800/60 rounded-lg px-3 py-2.5">
      <div class="text-xs text-gray-500 mb-0.5">Total Luas</div>
      <div class="text-lg font-bold text-teal-600 dark:text-teal-400 leading-tight">
        {formatNum(stats.total_area_km2, 0)} km²
      </div>
      <div class="text-xs text-gray-500 mt-0.5">
        {formatNum(stats.total_events)} kejadian tercatat
      </div>
    </div>

    <!-- Grid: Rata-rata & Maks -->
    <div class="grid grid-cols-2 gap-2">
      <div class="bg-gray-100/70 dark:bg-gray-800/40 rounded-lg px-2.5 py-2">
        <div class="text-xs text-gray-500 mb-0.5">Rata-rata</div>
        <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {formatNum(stats.avg_area_km2, 1)} km²
        </div>
      </div>
      <div class="bg-gray-100/70 dark:bg-gray-800/40 rounded-lg px-2.5 py-2">
        <div class="text-xs text-gray-500 mb-0.5">Terbesar</div>
        <div class="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {formatNum(stats.max_area_km2, 1)} km²
        </div>
      </div>
    </div>

    <!-- Rentang Waktu -->
    <div>
      <div class="text-xs text-gray-500 mb-0.5">Rentang Waktu</div>
      <div class="text-xs text-gray-700 dark:text-gray-300">
        {formatDate(stats.date_range[0])} – {formatDate(stats.date_range[1])}
      </div>
    </div>

    <!-- Tampil di Peta -->
    {#if showingOnMap > 0}
      <div class="flex items-center justify-between pt-1
                  border-t border-gray-200 dark:border-gray-800">
        <span class="text-xs text-gray-500">Tampil di peta</span>
        <span class="text-xs font-semibold text-orange-500 dark:text-orange-300">
          {formatNum(showingOnMap)} {mapLabel}
        </span>
      </div>
    {/if}

  {:else}
    <div class="text-sm text-gray-500">Belum ada data</div>
  {/if}
</div>
