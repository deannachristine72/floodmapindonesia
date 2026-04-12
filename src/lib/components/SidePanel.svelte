<script lang="ts">
  import type { KotaHeatmapProperties, KotaSearchItem, LayerMode, StatsData, YearCount } from '$lib/types';
  import SearchBar from './SearchBar.svelte';
  import StatsPanel from './StatsPanel.svelte';
  import YearDropdown from './YearDropdown.svelte';
  import ViewToggle from './ViewToggle.svelte';

  let {
    selectedYear = $bindable<number | null>(null),
    layerMode    = $bindable<LayerMode>('centroids'),
    years        = [],
    kotaList     = [],
    topKota      = [] as KotaHeatmapProperties[],
    stats        = null,
    showingOnMap = 0,
    statsLoading = false,
    selectedKota = $bindable<KotaSearchItem | null>(null),
    onSelectKota,
  }: {
    selectedYear: number | null;
    layerMode: LayerMode;
    years: YearCount[];
    kotaList: KotaSearchItem[];
    topKota: KotaHeatmapProperties[];
    stats: StatsData | null;
    showingOnMap: number;
    statsLoading: boolean;
    selectedKota: KotaSearchItem | null;
    onSelectKota: (kota: KotaSearchItem | null) => void;
  } = $props();
</script>

<div class="h-full flex flex-col bg-gray-900 border-l border-gray-800">
  <!-- Header -->
  <div class="px-4 pt-4 pb-3 border-b border-gray-800">
    <h1 class="text-white font-bold text-lg leading-tight">GeoData Indonesia</h1>
    <p class="text-gray-400 text-xs mt-0.5">Deforestasi 2000–2026</p>
  </div>

  <!-- Scrollable content -->
  <div class="flex-1 overflow-y-auto px-4 py-4 space-y-5">
    <!-- Search -->
    <SearchBar {kotaList} onSelect={onSelectKota} />

    <!-- Divider -->
    <div class="border-t border-gray-800"></div>

    <!-- Stats -->
    <StatsPanel {stats} {showingOnMap} loading={statsLoading} {layerMode} />

    <!-- H4: Top 10 Kabupaten Terparah (heatmap mode only) -->
    {#if layerMode === 'heatmap' && topKota.length > 0}
      <div class="border-t border-gray-800"></div>
      <div class="space-y-2">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top 10 Terparah</span>
        <div class="space-y-1.5">
          {#each topKota as kota, i}
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-gray-600 font-mono w-5 text-right shrink-0">#{i + 1}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs text-white truncate font-medium">{kota.kota_name}</div>
                <div class="text-[10px] text-gray-500 truncate">{kota.provinsi}</div>
              </div>
              <span class="text-[11px] text-orange-400 font-semibold shrink-0 tabular-nums">
                {kota.record_count.toLocaleString('id-ID')}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Divider -->
    <div class="border-t border-gray-800"></div>

    <!-- Year Filter -->
    <YearDropdown {years} bind:selectedYear />

    <!-- Divider -->
    <div class="border-t border-gray-800"></div>

    <!-- View Toggle -->
    <ViewToggle bind:layerMode featureCount={showingOnMap} />
  </div>

  <!-- Footer / Selected Kota -->
  {#if selectedKota}
    <div class="px-4 py-3 border-t border-gray-800 bg-gray-850">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-400">Wilayah Dipilih</div>
          <div class="text-sm font-semibold text-teal-400">{selectedKota.kota_name}</div>
          <div class="text-xs text-gray-400">{selectedKota.provinsi}</div>
        </div>
        <button
          class="text-gray-400 hover:text-white text-lg"
          onclick={() => onSelectKota(null)}
        >✕</button>
      </div>
    </div>
  {/if}
</div>
