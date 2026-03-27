<script lang="ts">
  import type { KotaSearchItem } from '$lib/types';

  let {
    kotaList = [],
    onSelect,
  }: {
    kotaList: KotaSearchItem[];
    onSelect: (kota: KotaSearchItem) => void;
  } = $props();

  let query = $state('');
  let isFocused = $state(false);
  let selectedIndex = $state(-1);

  // Filter lokal — instan tanpa network call
  const filtered = $derived(
    query.length < 1
      ? []
      : kotaList
          .filter(k =>
            k.kota_name.toLowerCase().includes(query.toLowerCase()) ||
            k.provinsi.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8)
  );

  function handleSelect(kota: KotaSearchItem) {
    query = `${kota.kota_name}, ${kota.provinsi}`;
    isFocused = false;
    selectedIndex = -1;
    onSelect(kota);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      isFocused = false;
    }
  }

  function handleClear() {
    query = '';
    isFocused = false;
    selectedIndex = -1;
    // Reset boundary — kirim null
    onSelect(null as unknown as KotaSearchItem);
  }
</script>

<div class="relative">
  <!-- Input -->
  <div class="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
    <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
    <input
      type="text"
      bind:value={query}
      onfocus={() => (isFocused = true)}
      onkeydown={handleKeydown}
      placeholder="Cari kota atau provinsi..."
      class="bg-transparent text-white text-sm w-full outline-none placeholder-gray-500"
    />
    {#if query.length > 0}
      <button onclick={handleClear} class="text-gray-400 hover:text-white text-sm">
        ✕
      </button>
    {/if}
  </div>

  <!-- Dropdown hasil -->
  {#if isFocused && filtered.length > 0}
    <div class="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-xl
                border border-gray-700 overflow-hidden z-50 max-h-64 overflow-y-auto">
      {#each filtered as kota, i}
        <button
          class="w-full text-left px-3 py-2 text-sm transition-colors
                 {i === selectedIndex ? 'bg-orange-600/30 text-white' : 'text-gray-300 hover:bg-gray-700'}"
          onmousedown={() => handleSelect(kota)}
        >
          <div class="font-medium">{kota.kota_name}</div>
          <div class="text-xs text-gray-400">{kota.kota_type} — {kota.provinsi}</div>
        </button>
      {/each}
    </div>
  {/if}

  {#if isFocused && query.length >= 1 && filtered.length === 0}
    <div class="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-xl
                border border-gray-700 px-3 py-3 text-sm text-gray-400 z-50">
      Tidak ditemukan "{query}"
    </div>
  {/if}
</div>
