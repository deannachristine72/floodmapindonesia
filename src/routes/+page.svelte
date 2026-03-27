<script lang="ts">
  import { onMount } from 'svelte';
  import MapView from '$lib/components/MapView.svelte';
  import YearFilter from '$lib/components/YearFilter.svelte';
  import LayerToggle from '$lib/components/LayerToggle.svelte';
  import { fetchYears } from '$lib/api';
  import type { LayerMode, YearCount } from '$lib/types';

  // ─── State ──────────────────────────────────────────────────────────────────
  let selectedYear = $state<number | null>(null);
  let layerMode    = $state<LayerMode>('polygons');
  let years        = $state<YearCount[]>([]);

  onMount(async () => {
    try {
      years = await fetchYears();
    } catch {
      console.warn('Gagal memuat daftar tahun — backend mungkin belum berjalan');
    }
  });
</script>

<!-- Full-screen layout -->
<div class="w-screen h-screen relative bg-gray-950">

  <!-- Header -->
  <header class="absolute top-0 left-0 right-0 z-20 pointer-events-none">
    <div class="px-4 pt-3 flex items-start justify-between">
      <!-- Judul -->
      <div class="bg-gray-900/95 backdrop-blur rounded-xl px-4 py-2.5 shadow-xl pointer-events-auto">
        <h1 class="text-white font-bold text-base leading-tight">
          GeoData Indonesia
        </h1>
        <p class="text-gray-400 text-xs">Deforestasi 2000–2026</p>
      </div>

      <!-- Layer Toggle -->
      <div class="pointer-events-auto">
        <LayerToggle bind:layerMode />
      </div>
    </div>
  </header>

  <!-- Map (full screen, behind controls) -->
  <div class="absolute inset-0 z-0">
    <MapView bind:selectedYear bind:layerMode />
  </div>

  <!-- Bottom Controls -->
  <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
    <YearFilter {years} bind:selectedYear />
  </div>

  <!-- Legend Heatmap -->
  {#if layerMode === 'heatmap'}
    <div class="absolute bottom-6 right-4 z-20
                bg-gray-900/95 backdrop-blur rounded-xl px-3 py-2.5 shadow-xl
                text-xs text-white w-36">
      <div class="font-semibold mb-2 text-gray-300">Intensitas</div>
      <div class="h-2.5 w-full rounded mb-1"
           style="background: linear-gradient(to right, #228b22, #9acd32, #ffc800, #ff6400, #c80000)">
      </div>
      <div class="flex justify-between text-gray-400">
        <span>Rendah</span>
        <span>Tinggi</span>
      </div>
    </div>
  {/if}

</div>
