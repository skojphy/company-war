<script>
  import { PIECE_TYPES } from '$game-core';

  export let type = 'CEO';
  export let owner = 'P1';
  export let size = 56;
  export let selected = false;
  export let dim = false;

  $: isP1 = owner === 'P1';
  $: meta = PIECE_TYPES[type];
  $: palette = isP1
    ? {
        bg: 'var(--p1-base)',
        bgDark: 'var(--p1-dark)',
        bgDeep: 'var(--p1-deep)',
        fg: '#ffffff',
        accent: '#fcd34d',
        dark: '#0c1e4f'
      }
    : {
        bg: 'var(--p2-base)',
        bgDark: 'var(--p2-dark)',
        bgDeep: 'var(--p2-deep)',
        fg: '#1a0f00',
        accent: '#ffffff',
        dark: '#3d1f00'
      };
</script>

<div
  class:selected
  class:dim
  class:enemy={!isP1}
  class="piece"
  style={`--piece-size: ${size}px; --piece-bg: ${palette.bg}; --piece-border: ${palette.bgDark}; --piece-shadow: ${palette.bgDeep};`}
  aria-label={`${meta.name} ${owner}`}
>
  <svg viewBox="0 0 28 28" width="100%" height="100%" aria-hidden="true">
    {#if type === 'CEO'}
      <rect x="6" y="14" width="16" height="10" fill={palette.fg} />
      <rect x="6" y="22" width="16" height="2" fill={palette.dark} />
      <rect x="4" y="6" width="3" height="10" fill={palette.fg} />
      <rect x="13" y="3" width="3" height="13" fill={palette.fg} />
      <rect x="22" y="6" width="3" height="10" fill={palette.fg} />
      <rect x="13" y="6" width="3" height="3" fill={palette.accent} />
      <rect x="9" y="12" width="2" height="2" fill={palette.accent} />
      <rect x="18" y="12" width="2" height="2" fill={palette.accent} />
      <rect x="6" y="16" width="16" height="2" fill={palette.dark} />
    {:else if type === 'MKT'}
      <rect x="4" y="11" width="3" height="6" fill={palette.fg} />
      <rect x="7" y="9" width="3" height="10" fill={palette.fg} />
      <rect x="10" y="7" width="3" height="14" fill={palette.fg} />
      <rect x="13" y="5" width="9" height="18" fill={palette.fg} />
      <rect x="22" y="5" width="2" height="18" fill={palette.accent} />
      <rect x="13" y="5" width="9" height="2" fill={palette.dark} />
      <rect x="13" y="21" width="9" height="2" fill={palette.dark} />
      <rect x="2" y="11" width="2" height="2" fill={palette.accent} />
      <rect x="2" y="15" width="2" height="2" fill={palette.accent} />
    {:else if type === 'PM'}
      <rect x="6" y="6" width="16" height="20" fill={palette.fg} />
      <rect x="6" y="6" width="16" height="2" fill={palette.dark} />
      <rect x="6" y="24" width="16" height="2" fill={palette.dark} />
      <rect x="11" y="3" width="6" height="5" fill={palette.dark} />
      <rect x="12" y="4" width="4" height="3" fill={palette.accent} />
      <rect x="9" y="11" width="10" height="2" fill={palette.accent} />
      <rect x="9" y="15" width="8" height="2" fill={palette.accent} />
      <rect x="9" y="19" width="10" height="2" fill={palette.accent} />
    {:else if type === 'DEV'}
      <rect x="4" y="8" width="20" height="12" fill={palette.fg} />
      <rect x="4" y="8" width="20" height="2" fill={palette.dark} />
      <rect x="6" y="10" width="16" height="8" fill={palette.dark} />
      <rect x="8" y="12" width="3" height="1" fill={palette.accent} />
      <rect x="8" y="14" width="5" height="1" fill={palette.accent} />
      <rect x="8" y="16" width="2" height="1" fill={palette.accent} />
      <rect x="2" y="20" width="24" height="3" fill={palette.fg} />
      <rect x="2" y="22" width="24" height="1" fill={palette.dark} />
    {:else}
      <rect x="13" y="3" width="3" height="3" fill={palette.accent} />
      <rect x="11" y="6" width="7" height="3" fill={palette.fg} />
      <rect x="9" y="9" width="11" height="10" fill={palette.fg} />
      <rect x="9" y="9" width="11" height="2" fill={palette.dark} />
      <rect x="12" y="12" width="5" height="4" fill={palette.accent} />
      <rect x="6" y="14" width="3" height="6" fill={palette.fg} />
      <rect x="20" y="14" width="3" height="6" fill={palette.fg} />
      <rect x="11" y="19" width="7" height="3" fill={palette.fg} />
      <rect x="12" y="22" width="2" height="3" fill={palette.accent} />
      <rect x="15" y="22" width="2" height="3" fill={palette.accent} />
      <rect x="13" y="25" width="3" height="2" fill={palette.dark} />
    {/if}
  </svg>
  <span>{meta.nameEn}</span>
  {#if type === 'CTO'}
    <b>↑</b>
  {/if}
</div>

<style>
  .piece {
    position: relative;
    width: var(--piece-size);
    height: var(--piece-size);
    border: 3px solid var(--piece-border);
    background: var(--piece-bg);
    box-shadow: 2px 2px 0 0 var(--piece-shadow);
    opacity: 1;
    transition:
      transform 0.08s ease,
      opacity 0.12s ease;
  }

  .piece.enemy {
    transform: rotate(180deg);
  }

  .piece.selected {
    animation: pixel-pulse 0.7s infinite;
  }

  .piece.dim {
    opacity: 0.38;
  }

  svg {
    display: block;
    shape-rendering: crispEdges;
  }

  span {
    position: absolute;
    right: 3px;
    bottom: 1px;
    color: rgba(255, 255, 255, 0.78);
    font: 700 8px/1 var(--font-mono);
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.7);
  }

  b {
    position: absolute;
    top: -7px;
    right: -7px;
    width: 17px;
    height: 17px;
    border: 2px solid #000;
    background: var(--gold);
    color: #000;
    display: grid;
    place-items: center;
    font: 700 10px/1 var(--font-mono);
  }
</style>
