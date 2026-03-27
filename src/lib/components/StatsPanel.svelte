<script lang="ts">
  import type { StatsData } from '$lib/types';

  let {
    stats = null,
    showingOnMap = 0,
    loading = false,
  }: {
    stats: StatsData | null;
    showingOnMap: number;
    loading: boolean;
  } = $props();

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatNum(n: number | null | undefined, decimals = 0): string {
    if (n == null) return '—';
    return n.toLocaleString('id-ID', { maximumFractionDigits: decimals });
  }
</script>

<div class="space-y-3">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stats</span>
    {#if stats}
      <span class="text-sm font-bold text-orange-400">{formatNum(stats.total_events)} events</span>
    {/if}
  </div>

  {#if loading}
    <div class="flex items-center gap-2 text-sm text-gray-400">
      <span class="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
      Memuat statistik...
    </div>
  {:else if stats}
    <!-- Date Range -->
    <div>
      <div class="text-xs text-gray-500 mb-0.5">Rentang Waktu</div>
      <div class="text-sm text-gray-200">
        {formatDate(stats.date_range[0])} – {formatDate(stats.date_range[1])}
      </div>
    </div>

    <!-- Area Stats -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <div class="text-xs text-gray-500 mb-0.5">Rata-rata Luas</div>
        <div class="text-sm font-semibold text-gray-200">{formatNum(stats.avg_area_km2, 1)} km²</div>
      </div>
      <div>
        <div class="text-xs text-gray-500 mb-0.5">Maks Luas</div>
        <div class="text-sm font-semibold text-gray-200">{formatNum(stats.max_area_km2, 1)} km²</div>
      </div>
    </div>

    <!-- Showing -->
    <div>
      <div class="text-xs text-gray-500 mb-0.5">Ditampilkan di Peta</div>
      <div class="text-sm text-orange-300 font-semibold">{formatNum(showingOnMap)} titik</div>
    </div>
  {:else}
    <div class="text-sm text-gray-500">Belum ada data</div>
  {/if}
</div>
