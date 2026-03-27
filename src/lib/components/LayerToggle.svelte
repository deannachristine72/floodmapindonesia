<script lang="ts">
  import type { LayerMode } from '$lib/types';

  let {
    layerMode = $bindable<LayerMode>('polygons'),
  }: {
    layerMode: LayerMode;
  } = $props();
</script>

<div class="bg-gray-900/95 backdrop-blur rounded-xl shadow-xl overflow-hidden flex text-sm font-medium">
  <button
    class="px-4 py-2.5 flex items-center gap-2 transition-colors
           {layerMode === 'polygons'
             ? 'bg-orange-600 text-white'
             : 'text-gray-400 hover:text-white hover:bg-gray-800'}"
    onclick={() => (layerMode = 'polygons')}
  >
    <!-- Polygon icon -->
    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" opacity="0.3"/>
      <path fill-rule="evenodd" d="M2 2h7v7H2V2zm1 1v5h5V3H3zm8-1h7v7h-7V2zm1 1v5h5V3h-5zM2 11h7v7H2v-7zm1 1v5h5v-5H3zm8-1h7v7h-7v-7zm1 1v5h5v-5h-5z"/>
    </svg>
    Polygon
  </button>

  <div class="w-px bg-gray-700"></div>

  <button
    class="px-4 py-2.5 flex items-center gap-2 transition-colors
           {layerMode === 'heatmap'
             ? 'bg-orange-600 text-white'
             : 'text-gray-400 hover:text-white hover:bg-gray-800'}"
    onclick={() => (layerMode = 'heatmap')}
  >
    <!-- Heatmap icon -->
    <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="10" cy="10" r="8" opacity="0.15"/>
      <circle cx="10" cy="10" r="5" opacity="0.3"/>
      <circle cx="10" cy="10" r="2.5" opacity="0.7"/>
    </svg>
    Heatmap Kota
  </button>
</div>
