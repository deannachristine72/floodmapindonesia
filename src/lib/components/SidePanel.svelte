<script lang="ts">
  import type { KotaSearchItem, LayerMode, StatsData, YearCount } from '$lib/types';
  import SearchBar from './SearchBar.svelte';
  import StatsPanel from './StatsPanel.svelte';
  import YearDropdown from './YearDropdown.svelte';
  import ViewToggle from './ViewToggle.svelte';

  let {
    selectedYear = $bindable<number | null>(null),
    layerMode    = $bindable<LayerMode>('centroids'),
    years        = [],
    kotaList     = [],
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

    <!-- Divider -->
    <div class="border-t border-gray-800"></div>

    <!-- Year Filter -->
    <YearDropdown {years} bind:selectedYear />

    <!-- Divider -->
    <div class="border-t border-gray-800"></div>

    <!-- View Toggle -->
    <ViewToggle bind:layerMode />
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
