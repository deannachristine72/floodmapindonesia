<script lang="ts">
  import type { LayerMode } from '$lib/types';

  let {
    layerMode    = $bindable<LayerMode>('centroids'),
    featureCount = 0,
  }: {
    layerMode: LayerMode;
    featureCount: number;
  } = $props();

  const modes: { value: LayerMode; label: string; icon: string }[] = [
    { value: 'centroids', label: 'Centroid',  icon: '◉' },
    { value: 'heatmap',   label: 'Heatmap',   icon: '■' },
  ];

  // C4: Label dinamis di bawah tombol mode
  const countLabel = $derived(
    featureCount > 0
      ? `Menampilkan ${featureCount.toLocaleString('id-ID')} ${layerMode === 'centroids' ? 'titik' : 'kab/kota'}`
      : null
  );
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
  <!-- C4: Deskripsi dinamis jumlah fitur tampil -->
  {#if countLabel}
    <div class="text-[11px] text-gray-500 px-1 leading-tight">{countLabel}</div>
  {/if}
</div>
