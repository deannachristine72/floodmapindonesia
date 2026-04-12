<script lang="ts">
  import { onDestroy } from 'svelte';
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

  // ─── C9/H10: Animasi Tahun ───────────────────────────────────────────────────
  const yearsAsc = $derived([...years].sort((a, b) => a.year - b.year));
  let playing = $state(false);
  let playInterval: ReturnType<typeof setInterval> | null = null;

  function currentIndex(): number {
    return selectedYear != null ? yearsAsc.findIndex(y => y.year === selectedYear) : -1;
  }

  function pauseAnimation() {
    playing = false;
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
  }

  function startAnimation() {
    if (yearsAsc.length === 0) return;
    playing = true;
    // Mulai dari awal jika belum ada tahun terpilih atau sudah di tahun terakhir
    const idx = currentIndex();
    if (idx < 0 || idx >= yearsAsc.length - 1) selectedYear = yearsAsc[0].year;

    playInterval = setInterval(() => {
      const i = currentIndex();
      if (i < 0 || i >= yearsAsc.length - 1) {
        pauseAnimation(); // berhenti di tahun terakhir
      } else {
        selectedYear = yearsAsc[i + 1].year;
      }
    }, 1200);
  }

  function togglePlay() {
    playing ? pauseAnimation() : startAnimation();
  }

  function resetAnimation() {
    pauseAnimation();
    selectedYear = null; // kembali ke "semua tahun"
  }

  onDestroy(() => { if (playInterval) clearInterval(playInterval); });
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

    <!-- C9/H10: Animasi Tahun — slider + play/pause -->
    {#if yearsAsc.length > 1}
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Animasi Tahun</span>
          <span class="text-xs font-mono {playing ? 'text-orange-400' : 'text-teal-400'}">
            {selectedYear ?? 'Semua'}
          </span>
        </div>
        <!-- Scrubber -->
        <input
          type="range"
          min={0}
          max={yearsAsc.length - 1}
          value={currentIndex() >= 0 ? currentIndex() : 0}
          oninput={(e) => {
            const idx = parseInt((e.target as HTMLInputElement).value, 10);
            if (idx >= 0 && idx < yearsAsc.length) selectedYear = yearsAsc[idx].year;
          }}
          class="w-full h-1.5 cursor-pointer accent-teal-500"
        />
        <div class="flex justify-between text-[10px] text-gray-600 -mt-1">
          <span>{yearsAsc[0].year}</span>
          <span>{yearsAsc[yearsAsc.length - 1].year}</span>
        </div>
        <!-- Controls -->
        <div class="flex items-center gap-2">
          <button
            onclick={togglePlay}
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                   {playing
                     ? 'bg-orange-600/80 hover:bg-orange-600 text-white'
                     : 'bg-teal-600/80 hover:bg-teal-600 text-white'}"
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onclick={resetAnimation}
            title="Reset ke semua tahun"
            class="px-2.5 py-1.5 rounded-lg text-xs bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >⏮</button>
        </div>
      </div>
    {/if}

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
