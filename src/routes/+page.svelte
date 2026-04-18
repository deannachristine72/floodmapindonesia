<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import MapView        from '$lib/components/MapView.svelte';
  import SidePanel      from '$lib/components/SidePanel.svelte';
  import SearchBar      from '$lib/components/SearchBar.svelte';
  import BottomTimeline from '$lib/components/BottomTimeline.svelte';
  import { fetchYears, fetchSearchKota, fetchStats } from '$lib/api';
  import type {
    KotaHeatmapProperties, LayerMode, YearCount,
    KotaSearchItem, StatsData
  } from '$lib/types';
  import type { IslandGroup } from '$lib/islands';

  // ── State ────────────────────────────────────────────────────────────────
  let selectedYear      = $state<number | null>(null);
  let layerMode         = $state<LayerMode>('centroids');
  let years             = $state<YearCount[]>([]);
  let kotaList          = $state<KotaSearchItem[]>([]);
  let stats             = $state<StatsData | null>(null);
  let statsLoading      = $state(false);
  let featureCount      = $state(0);
  let mapLoading        = $state(false);
  let selectedKota      = $state<KotaSearchItem | null>(null);
  let selectedBoundaryHasc = $state<string | null>(null);
  let topKota           = $state<KotaHeatmapProperties[]>([]);
  let allHeatmapKota    = $state<KotaHeatmapProperties[]>([]);
  let selectedProvinces = $state<string[]>([]);
  let selectedKotaHasc  = $state<string | null>(null);
  let selectedKotaBbox  = $state<[number, number, number, number] | null>(null);
  let searchValue       = $state('');
  let dataEnabled       = $state(false);
  let mapView: MapView;

  // ── C10: Share Link ───────────────────────────────────────────────────────
  let copySuccess = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  function shareLink() {
    const params = new URLSearchParams();
    if (selectedYear != null) params.set('year', String(selectedYear));
    if (layerMode !== 'centroids') params.set('mode', layerMode);
    const qs  = params.toString();
    const url = `${window.location.origin}${window.location.pathname}${qs ? '?' + qs : ''}`;
    navigator.clipboard.writeText(url).then(() => {
      copySuccess = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => { copySuccess = false; }, 2000);
    }).catch(() => {});
  }

  // ── H8: Export CSV ────────────────────────────────────────────────────────
  let exportLoading = $state(false);

  function escapeCSV(val: string | number): string {
    if (typeof val === 'number') return String(val);
    if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
    return val;
  }

  function exportCSV() {
    if (allHeatmapKota.length === 0 || exportLoading) return;
    exportLoading = true;
    try {
      const headers = ['hasc_code', 'kota_name', 'provinsi', 'record_count', 'total_area_km2', 'intensity'];
      const rows = allHeatmapKota.map(k => [
        escapeCSV(k.hasc_code),
        escapeCSV(k.kota_name),
        escapeCSV(k.provinsi),
        k.record_count,
        k.total_area_km2.toFixed(2),
        k.intensity.toFixed(4),
      ]);
      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const a    = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = `deforestasi-kota-${selectedYear ?? 'semua'}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      exportLoading = false;
    }
  }

  // ── Mount ────────────────────────────────────────────────────────────────
  onMount(async () => {
    const params    = new URLSearchParams(window.location.search);
    const yearParam = params.get('year');
    if (yearParam) { const y = parseInt(yearParam, 10); if (!isNaN(y)) selectedYear = y; }
    const modeParam = params.get('mode');
    if (modeParam === 'heatmap' || modeParam === 'centroids') layerMode = modeParam;

    const [yearsData, kotaData] = await Promise.all([
      fetchYears().catch(() => []),
      fetchSearchKota().catch(() => []),
    ]);
    years    = yearsData;
    kotaList = kotaData;
  });

  onDestroy(() => { if (copyTimeout) clearTimeout(copyTimeout); });

  // ── Stats ────────────────────────────────────────────────────────────────
  async function loadStats() {
    statsLoading = true;
    try { stats = await fetchStats(selectedYear); }
    catch { console.warn('Gagal memuat statistik'); }
    finally { statsLoading = false; }
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  function handleReset() {
    searchValue      = '';
    selectedKota     = null;
    selectedBoundaryHasc = null;
    selectedProvinces    = [];
    selectedKotaHasc     = null;
    selectedKotaBbox     = null;
    dataEnabled          = false;
    stats                = null;
  }

  // ── Search handler ───────────────────────────────────────────────────────
  function handleSearch(result: KotaSearchItem | IslandGroup | null) {
    if (result === null) { handleReset(); return; }

    if ('type' in result && result.type === 'island') {
      const island = result as IslandGroup;
      selectedKota         = null;
      selectedBoundaryHasc = null;
      selectedKotaHasc     = null;
      selectedKotaBbox     = null;
      selectedProvinces    = island.provinces;
      dataEnabled          = true;
      mapView?.flyTo(island.center, island.zoom);
      loadStats();
    } else {
      const kota           = result as KotaSearchItem;
      selectedKota         = kota;
      selectedBoundaryHasc = kota.hasc_code;
      selectedKotaHasc     = kota.hasc_code;
      selectedKotaBbox     = kota.bbox;
      selectedProvinces    = [];
      dataEnabled          = true;
      mapView?.flyTo(kota.centroid, 10);
      loadStats();
    }
  }

  // ── Reactive: reload stats on year change ───────────────────────────────
  $effect(() => {
    const _year = selectedYear;
    if (dataEnabled) loadStats();
  });
</script>

<!-- ── Full-page flex-col layout ── -->
<div class="w-screen h-screen flex flex-col bg-gray-950">

  <!-- ── Top Navbar ──────────────────────────────────────────────────────── -->
  <nav class="h-12 flex-shrink-0 bg-gray-900 border-b border-gray-800
              flex items-center gap-3 px-4">

    <!-- Logo + Title -->
    <div class="flex items-center gap-2.5 shrink-0">
      <div class="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      </div>
      <div class="leading-tight">
        <h1 class="text-white font-bold text-sm tracking-tight">BanjirMap Indonesia</h1>
        <p class="text-gray-500 text-[10px] uppercase tracking-wider">
          Peta Kejadian · 2000–2025
        </p>
      </div>
    </div>

    <!-- Search (center, flex-1) — z-50 so dropdown clears the map canvas -->
    <div class="flex-1 max-w-md mx-auto relative z-50">
      <SearchBar
        {kotaList}
        bind:searchValue
        onSelect={handleSearch}
      />
    </div>

    <!-- Action buttons (right) -->
    <div class="flex items-center gap-1 shrink-0">

      <!-- Share Link button -->
      <button
        onclick={shareLink}
        title={copySuccess ? 'Link tersalin!' : 'Salin Link'}
        class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors
               {copySuccess
                 ? 'bg-green-900/50 text-green-400'
                 : 'text-gray-400 hover:bg-gray-700 hover:text-white'}"
        aria-label="Salin link halaman"
      >
        {#if copySuccess}
          <!-- Check icon -->
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        {:else}
          <!-- Link icon -->
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        {/if}
      </button>

      <!-- Export CSV button -->
      <button
        onclick={exportCSV}
        disabled={allHeatmapKota.length === 0 || exportLoading}
        title={allHeatmapKota.length === 0
          ? 'Aktifkan mode Heatmap untuk ekspor'
          : 'Export CSV semua kab/kota'}
        class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors
               disabled:opacity-30 disabled:cursor-not-allowed
               text-gray-400 hover:bg-gray-700 hover:text-white
               disabled:hover:bg-transparent disabled:hover:text-gray-400"
        aria-label="Export data sebagai CSV"
      >
        {#if exportLoading}
          <!-- Spinner -->
          <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
                     M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        {:else}
          <!-- Download icon -->
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        {/if}
      </button>

    </div>
  </nav>

  <!-- ── Content row: Map + Sidebar ──────────────────────────────────────── -->
  <div class="flex-1 flex min-h-0">

    <!-- Map -->
    <div class="flex-1 relative">
      <MapView
        bind:this={mapView}
        bind:selectedYear
        bind:layerMode
        bind:featureCount
        bind:loading={mapLoading}
        bind:topKota
        bind:allHeatmapKota
        {selectedBoundaryHasc}
        {selectedProvinces}
        {selectedKotaHasc}
        {selectedKotaBbox}
        {dataEnabled}
        {kotaList}
        onReset={handleReset}
      />

      <!-- C8 + C9: Bottom Timeline Panel -->
      <BottomTimeline bind:selectedYear {years} />
    </div>

    <!-- Sidebar -->
    <aside class="w-80 flex-shrink-0">
      <SidePanel
        bind:selectedYear
        bind:layerMode
        {years}
        {topKota}
        {stats}
        showingOnMap={featureCount}
        {statsLoading}
        {selectedKota}
        onDeselectKota={() => handleSearch(null)}
      />
    </aside>

  </div>
</div>
