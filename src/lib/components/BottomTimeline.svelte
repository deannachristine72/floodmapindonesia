<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { YearCount } from '$lib/types';

  let {
    years        = [] as YearCount[],
    selectedYear = $bindable<number | null>(null),
  }: {
    years:        YearCount[];
    selectedYear: number | null;
  } = $props();

  // ── Derived ───────────────────────────────────────────────────────────
  const yearsAsc = $derived([...years].sort((a, b) => a.year - b.year));
  const maxCount = $derived(yearsAsc.reduce((m, y) => Math.max(m, y.count), 1));
  const currIdx  = $derived(
    selectedYear != null ? yearsAsc.findIndex(y => y.year === selectedYear) : -1
  );

  // ── Animation state ───────────────────────────────────────────────────
  let playing = $state(false);
  let speed   = $state(1);      // 0.5 | 1 | 2
  let loop    = $state(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      const i = yearsAsc.findIndex(y => y.year === selectedYear);
      if (i >= yearsAsc.length - 1 || i < 0) {
        if (loop) { selectedYear = yearsAsc[0].year; }
        else      { playing = false; stopTimer(); }
      } else {
        selectedYear = yearsAsc[i + 1].year;
      }
    }, Math.round(1200 / speed));
  }

  function togglePlay() {
    if (playing) {
      playing = false;
      stopTimer();
    } else {
      if (!yearsAsc.length) return;
      const i = yearsAsc.findIndex(y => y.year === selectedYear);
      if (i < 0 || i >= yearsAsc.length - 1) selectedYear = yearsAsc[0].year;
      playing = true;
      startTimer();
    }
  }

  function setSpeed(s: number) {
    speed = s;
    if (playing) startTimer(); // restart with new interval
  }

  function reset() {
    playing = false;
    stopTimer();
    selectedYear = null;
  }

  onDestroy(stopTimer);
</script>

{#if yearsAsc.length > 1}
<!-- ── Floating glass panel at bottom-center of map ── -->
<div
  class="absolute bottom-5 left-1/2 -translate-x-1/2 z-10
         w-[min(760px,calc(100%-2.5rem))]
         bg-gray-900/90 backdrop-blur-md
         border border-gray-700/50
         rounded-2xl shadow-2xl
         px-5 pt-3.5 pb-3.5"
>

  <!-- Row 1: Histogram + Year badge ───────────────────────────────────── -->
  <div class="flex items-end gap-3 mb-1">

    <!-- Histogram bars (clickable) -->
    <div class="flex-1 flex items-end gap-[2px] h-11">
      {#each yearsAsc as y}
        {@const barH = Math.max(3, Math.round((y.count / maxCount) * 40))}
        {@const active = y.year === selectedYear}
        <button
          class="flex-1 rounded-[2px] transition-colors duration-100
                 {active ? 'bg-teal-400' : 'bg-gray-700 hover:bg-gray-500'}"
          style="height:{barH}px"
          onclick={() => { selectedYear = active ? null : y.year; }}
          title="{y.year}: {y.count.toLocaleString('id-ID')} kejadian"
          aria-label="Pilih tahun {y.year}"
        ></button>
      {/each}
    </div>

    <!-- Year badge -->
    <div class="text-right w-20 shrink-0 pb-0.5">
      <div class="text-lg font-bold tabular-nums leading-none
                  {playing ? 'text-orange-400' : 'text-teal-400'}">
        {selectedYear ?? '—'}
      </div>
      <div class="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">
        {#if playing}sedang putar
        {:else if selectedYear}tahun dipilih
        {:else}semua tahun
        {/if}
      </div>
    </div>
  </div>

  <!-- Row 2: Year axis labels ──────────────────────────────────────────── -->
  <div class="flex justify-between text-[9px] text-gray-600 mb-1.5 leading-none pr-[5.5rem]">
    <span>{yearsAsc[0]?.year}</span>
    {#if yearsAsc.length > 8}
      {@const mid = Math.floor(yearsAsc.length / 2)}
      <span>{yearsAsc[mid].year}</span>
    {/if}
    <span>{yearsAsc[yearsAsc.length - 1]?.year}</span>
  </div>

  <!-- Row 3: Scrubber ─────────────────────────────────────────────────── -->
  <input
    type="range"
    min={0}
    max={yearsAsc.length - 1}
    value={currIdx >= 0 ? currIdx : 0}
    oninput={(e) => {
      const i = parseInt((e.target as HTMLInputElement).value, 10);
      if (i >= 0 && i < yearsAsc.length) selectedYear = yearsAsc[i].year;
    }}
    class="w-full h-1 cursor-pointer accent-teal-500 mb-3"
  />

  <!-- Row 4: Controls ─────────────────────────────────────────────────── -->
  <div class="flex items-center gap-2 flex-wrap">

    <!-- Reset -->
    <button
      onclick={reset}
      title="Reset ke semua tahun"
      class="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700/80
             transition-colors text-sm leading-none"
    >⏮</button>

    <!-- Play / Pause -->
    <button
      onclick={togglePlay}
      class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold
             transition-colors min-w-[90px] justify-center
             {playing
               ? 'bg-orange-500/80 hover:bg-orange-500 text-white'
               : 'bg-teal-600/80  hover:bg-teal-600  text-white'}"
    >
      {#if playing}
        <!-- Pause icon -->
        <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6"  y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
        Pause
      {:else}
        <!-- Play icon -->
        <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21"/>
        </svg>
        Animasi
      {/if}
    </button>

    <!-- Speed selector -->
    <div class="flex items-center bg-gray-800 rounded-lg overflow-hidden
                border border-gray-700/50 text-[11px] font-semibold">
      {#each [0.5, 1, 2] as s}
        <button
          onclick={() => setSpeed(s)}
          class="px-2.5 py-1.5 transition-colors
                 {speed === s ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-200'}"
        >{s}×</button>
      {/each}
    </div>

    <!-- Loop toggle -->
    <button
      onclick={() => loop = !loop}
      title={loop ? 'Loop aktif — klik untuk nonaktifkan' : 'Loop nonaktif — klik untuk aktifkan'}
      class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium
             transition-colors border
             {loop
               ? 'text-teal-400 bg-teal-900/30 border-teal-800/50'
               : 'text-gray-500 bg-gray-800   border-gray-700/50 hover:text-gray-300'}"
    >
      <!-- Loop icon -->
      <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="17 1 21 5 17 9"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <polyline points="7 23 3 19 7 15"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
      Loop
    </button>

    <div class="flex-1"></div>

    <!-- Clear year shortcut -->
    {#if selectedYear !== null}
      <button
        onclick={reset}
        class="text-[10px] text-gray-500 hover:text-teal-400 transition-colors tabular-nums"
      >{selectedYear} × hapus filter</button>
    {/if}

  </div>
</div>
{/if}
