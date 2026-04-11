<script lang="ts">
  import type { LayerMode } from '$lib/types';

  let {
    layerMode = $bindable<LayerMode>('centroids'),
  }: {
    layerMode: LayerMode;
  } = $props();

  const modes: { value: LayerMode; label: string; icon: string }[] = [
    { value: 'centroids', label: 'Centroid',  icon: '◉' },
    { value: 'heatmap',   label: 'Heatmap',   icon: '■' },
  ];
</script>

<div class="space-y-1.5">
  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tampilan</span>
  <div class="flex flex-col gap-1">
    {#each modes as mode}
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
               {layerMode === mode.value
                 ? 'bg-teal-600 text-white font-semibold shadow-md'
                 : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'}"
        onclick={() => (layerMode = mode.value)}
      >
        <span class="text-base leading-none">{mode.icon}</span>
        {mode.label}
      </button>
    {/each}
  </div>
</div>
