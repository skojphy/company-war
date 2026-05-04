<script>
  export let owner = 'P1';
  export let name = 'NOWBIZ';
  export let rating = '1762';
  export let active = false;
  export let handCount = 0;
  export let flipped = false;
</script>

<div class:flipped class:active class:p2={owner === 'P2'} class="hud pixel-box">
  <div class="avatar">{owner === 'P1' ? '나' : 'R'}</div>
  <div>
    <strong>{name}</strong>
    <span>★ {rating} · 영입 {handCount}</span>
  </div>
  <time>{active ? 'LIVE' : 'WAIT'}</time>
</div>

<style>
  .hud {
    display: grid;
    grid-template-columns: 38px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
  }

  .hud.active {
    border-color: var(--p1-base);
    box-shadow: 0 0 0 2px var(--p1-base), var(--shadow-md);
  }

  .hud.p2.active {
    border-color: var(--p2-base);
    box-shadow: 0 0 0 2px var(--p2-base), var(--shadow-md);
  }

  .flipped {
    transform: rotate(180deg);
  }

  .avatar {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: 2px solid var(--p1-dark);
    background: var(--p1-base);
    color: #fff;
    font-weight: 700;
  }

  .p2 .avatar {
    border-color: var(--p2-dark);
    background: var(--p2-base);
    color: var(--text-on-amber);
  }

  strong {
    display: block;
    font-size: 13px;
  }

  span,
  time {
    color: var(--text-tertiary);
    font: 700 10px/1.3 var(--font-mono);
  }

  time {
    color: var(--accent);
  }
</style>
