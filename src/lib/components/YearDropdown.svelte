<script lang="ts">
  import type { YearCount } from '$lib/types';

  let {
    years = [],
    selectedYear = $bindable<number | null>(null),
  }: {
    years: YearCount[];
    selectedYear: number | null;
  } = $props();

  function onChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    selectedYear = val === 'all' ? null : Number(val);
  }
</script>

<div class="space-y-1.5">
  <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter Tahun</span>
  <div class="relative">
    <select
      class="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5
             border border-gray-700 appearance-none cursor-pointer
             focus:outline-none focus:border-teal-500 transition-colors"
      value={selectedYear === null ? 'all' : String(selectedYear)}
      onchange={onChange}
    >
      <option value="all">Semua Tahun</option>
      {#each years as y}
        <option value={String(y.year)}>{y.year} — {y.count.toLocaleString('id-ID')} events</option>
      {/each}
    </select>
    <!-- Dropdown arrow -->
    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
         fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  </div>
</div>
