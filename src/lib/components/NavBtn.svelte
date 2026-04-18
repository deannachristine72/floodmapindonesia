<!-- Reusable navbar icon button with hover tooltip -->
<script lang="ts">
  let {
    label    = '',
    onclick  = () => {},
    disabled = false,
    active   = false,
  }: {
    label?:    string;
    onclick?:  () => void;
    disabled?: boolean;
    active?:   boolean;
  } = $props();
</script>

<div class="relative group">
  <button
    {onclick}
    {disabled}
    aria-label={label}
    class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors
           {active
             ? 'bg-teal-600/20 text-teal-500 dark:text-teal-400'
             : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}
           disabled:opacity-30 disabled:cursor-not-allowed
           disabled:hover:bg-transparent"
  >
    <slot />
  </button>

  <!-- Tooltip (appears on group-hover, including disabled) -->
  {#if label}
    <div
      class="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[100]
             pointer-events-none opacity-0 group-hover:opacity-100
             transition-opacity duration-150"
    >
      <!-- Arrow -->
      <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2
                  bg-gray-800 dark:bg-gray-900 rotate-45"></div>
      <!-- Box -->
      <div class="relative bg-gray-800 dark:bg-gray-900 text-white text-[11px]
                  px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap leading-tight">
        {label}
      </div>
    </div>
  {/if}
</div>
