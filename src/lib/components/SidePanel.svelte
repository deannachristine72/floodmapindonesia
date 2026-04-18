<script lang="ts">
  import type { KotaHeatmapProperties, KotaSearchItem, LayerMode, StatsData, YearCount } from '$lib/types';
  import StatsPanel   from './StatsPanel.svelte';
  import YearDropdown from './YearDropdown.svelte';
  import ViewToggle   from './ViewToggle.svelte';

  let {
    selectedYear     = $bindable<number | null>(null),
    layerMode        = $bindable<LayerMode>('centroids'),
    years            = [] as YearCount[],
    topKota          = [] as KotaHeatmapProperties[],
    stats            = null as StatsData | null,
    showingOnMap     = 0,
    statsLoading     = false,
    selectedKota     = null as KotaSearchItem | null,
    onDeselectKota,
  }: {
    selectedYear:   number | null;
    layerMode:      LayerMode;
    years:          YearCount[];
    topKota:        KotaHeatmapProperties[];
    stats:          StatsData | null;
    showingOnMap:   number;
    statsLoading:   boolean;
    selectedKota:   KotaSearchItem | null;
    onDeselectKota: () => void;
  } = $props();
</script>

<div class="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">

  <!-- Scrollable content -->
  <div class="flex-1 overflow-y-auto px-4 py-4 space-y-5">

    <!-- Stats -->
    <StatsPanel {stats} {showingOnMap} loading={statsLoading} {layerMode} />

    <!-- Top 10 Kabupaten Terparah (heatmap only) -->
    {#if layerMode === 'heatmap' && topKota.length > 0}
      <div class="border-t border-gray-200 dark:border-gray-800"></div>
      <div class="space-y-2">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Top 10 Terparah
        </span>
        <div class="space-y-1.5">
          {#each topKota as kota, i}
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-gray-400 dark:text-gray-600 font-mono w-5 text-right shrink-0">
                #{i + 1}
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-xs text-gray-900 dark:text-white truncate font-medium">
                  {kota.kota_name}
                </div>
                <div class="text-[10px] text-gray-500 truncate">{kota.provinsi}</div>
              </div>
              <span class="text-[11px] text-orange-500 dark:text-orange-400 font-semibold shrink-0 tabular-nums">
                {kota.record_count.toLocaleString('id-ID')}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Year Filter -->
    <div class="border-t border-gray-200 dark:border-gray-800"></div>
    <YearDropdown {years} bind:selectedYear />

    <!-- View Toggle -->
    <div class="border-t border-gray-200 dark:border-gray-800"></div>
    <ViewToggle bind:layerMode featureCount={showingOnMap} />

  </div>

  <!-- Footer: Selected Kota -->
  {#if selectedKota}
    <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-800
                bg-gray-50 dark:bg-gray-850">
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[10px] text-gray-500 uppercase tracking-wide">Wilayah Dipilih</div>
          <div class="text-sm font-semibold text-teal-600 dark:text-teal-400 truncate">
            {selectedKota.kota_name}
          </div>
          <div class="text-xs text-gray-500 truncate">{selectedKota.provinsi}</div>
        </div>
        <button
          class="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-white
                 text-lg leading-none transition-colors"
          onclick={onDeselectKota}
          title="Batalkan pilihan"
        >✕</button>
      </div>
    </div>
  {/if}

</div>
