<script>
  import { createEventDispatcher } from 'svelte';
  import { PIECE_TYPES } from '$game-core';
  import PixelPiece from './PixelPiece.svelte';

  export let owner = 'P1';
  export let label = '내 영입대기';
  export let pieces = [];
  export let selectedIndex = -1;
  export let flipped = false;

  const dispatch = createEventDispatcher();
</script>

<div class:flipped class:p2={owner === 'P2'} class="hand pixel-box">
  <div class="hand-head">
    <span>{label}</span>
    <b>×{pieces.length}</b>
  </div>
  <div class="hand-pieces">
    {#each pieces as piece, index}
      <button
        class:selected-hand={selectedIndex === index}
        aria-label={`${PIECE_TYPES[piece.type].name} 영입`}
        on:click={() => dispatch('pick', { owner, index })}
      >
        <PixelPiece type={piece.type} {owner} size={40} />
      </button>
    {:else}
      <small>영입 대기중</small>
    {/each}
  </div>
</div>

<style>
  .hand {
    min-height: 64px;
    padding: 7px 9px;
  }

  .flipped {
    transform: rotate(180deg);
  }

  .hand-head {
    display: flex;
    justify-content: space-between;
    color: var(--p1-light);
    font-size: 11px;
  }

  .hand.p2 .hand-head {
    color: var(--p2-light);
  }

  .hand-pieces {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 7px;
    padding-top: 6px;
  }

  .hand-pieces button {
    padding: 0;
    border: 0;
    background: transparent;
  }

  .hand-pieces small {
    color: var(--text-muted);
    font-size: 10px;
  }

  .selected-hand {
    transform: translateY(-3px);
    filter: drop-shadow(0 0 7px var(--accent-glow));
  }
</style>
