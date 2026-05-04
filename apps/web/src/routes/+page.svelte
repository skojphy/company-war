<script>
  import HandTray from '$lib/HandTray.svelte';
  import PixelPiece from '$lib/PixelPiece.svelte';
  import PlayerHud from '$lib/PlayerHud.svelte';
  import {
    PIECE_TYPES,
    createGame,
    dropPiece,
    getValidDrops,
    getValidMoves,
    movePiece
  } from '$game-core';

  let game = createGame();
  let selected = null;
  let selectedHand = null;
  let screen = 'game';

  $: validMoves = selected ? getValidMoves(game.board, selected.row, selected.col) : [];
  $: validDrops = selectedHand ? getValidDrops(game.board, selectedHand.type, selectedHand.owner) : [];
  $: activePlayer = game.turn === 'P1' ? 'NOWBIZ' : 'RIVAL INC.';

  function resetGame() {
    game = createGame();
    selected = null;
    selectedHand = null;
    screen = 'game';
  }

  function pickHand(owner, index) {
    if (game.winner || owner !== game.turn) return;
    const item = game.hands[owner][index];
    selected = null;
    selectedHand = { owner, index, type: item.type };
  }

  function handleCell(row, col) {
    if (game.winner) return;
    const cell = game.board[row][col];

    if (selectedHand) {
      game = dropPiece(game, selectedHand.index, { row, col });
      selectedHand = null;
      return;
    }

    if (selected) {
      const before = game;
      game = movePiece(game, selected, { row, col });
      selected = null;
      if (game !== before) return;
    }

    if (cell?.owner === game.turn) {
      selected = { row, col };
      selectedHand = null;
    }
  }

  function isValid(list, row, col) {
    return list.some(([r, c]) => r === row && c === col);
  }
</script>

<svelte:head>
  <title>회사장기</title>
  <meta
    name="description"
    content="동물장기 룰을 회사 테마로 바꾼 모바일 퍼스트 온라인 턴제 추상전략 게임"
  />
</svelte:head>

<main class="app-shell">
  <div class="dot-pattern bg-dots"></div>

  <section class="phone">
    <header class="topbar">
      <button class="icon-button" aria-label="뒤로">‹</button>
      <div>
        <strong>회사장기</strong>
        <span>ONLINE TURN · 3x4</span>
      </div>
      <button class="icon-button" aria-label="메뉴">≡</button>
    </header>

    {#if screen === 'home'}
      <section class="home">
        <div class="logo">
          <span>PIXEL CORPORATE</span>
          <h1>회사장기</h1>
          <p>M&A.exe</p>
        </div>

        <div class="piece-line" aria-label="말 미리보기">
          {#each ['CEO', 'MKT', 'PM', 'DEV', 'CTO'] as type, index}
            <PixelPiece {type} owner={index % 2 === 0 ? 'P1' : 'P2'} size={50} />
          {/each}
        </div>

        <div class="menu-stack">
          <button class="pixel-button amber" on:click={() => (screen = 'game')}>랭크 매칭</button>
          <button class="pixel-button" on:click={() => (screen = 'game')}>친구와 대전</button>
          <button class="pixel-button ghost" on:click={() => (screen = 'rules')}>룰 보기</button>
        </div>
      </section>
    {:else if screen === 'rules'}
      <section class="rules pixel-box">
        <h2>말 이동</h2>
        {#each Object.values(PIECE_TYPES) as piece}
          <div class="rule-row">
            <PixelPiece type={piece.id} owner="P1" size={38} />
            <div>
              <strong>{piece.name}</strong>
              <span>{piece.desc}</span>
            </div>
          </div>
        {/each}
        <p>개발자가 상대 진영 끝줄에 도착하면 CTO로 승급합니다. 잡은 말은 내 손패가 되어 빈 칸에 영입할 수 있습니다.</p>
        <button class="pixel-button amber" on:click={() => (screen = 'game')}>대국 시작</button>
      </section>
    {:else}
      <section class="game-screen">
        <PlayerHud
          owner="P2"
          name="RIVAL INC."
          rating="1840"
          active={game.turn === 'P2'}
          handCount={game.hands.P2.length}
          flipped
        />

        <HandTray
          owner="P2"
          label="상대 영입대기"
          pieces={game.hands.P2}
          selectedIndex={selectedHand?.owner === 'P2' ? selectedHand.index : -1}
          on:pick={(event) => pickHand(event.detail.owner, event.detail.index)}
          flipped
        />

        <div class="turn-strip">
          <span>{game.winner ? `${game.winner} WINS` : `${activePlayer} 차례`}</span>
          <b>{String(game.moveNumber).padStart(2, '0')}</b>
        </div>

        <div class="board-wrap" aria-label="회사장기 보드">
          <small class="zone enemy-zone">▼ RIVAL HQ</small>
          <div class="board">
            {#each game.board as rowCells, row}
              {#each rowCells as cell, col}
                {@const isSelected = selected?.row === row && selected?.col === col}
                {@const canTarget = isValid(validMoves, row, col)}
                {@const canHire = isValid(validDrops, row, col)}
                {@const wasTo = game.lastMove?.to?.row === row && game.lastMove?.to?.col === col}
                {@const wasFrom = game.lastMove?.from?.row === row && game.lastMove?.from?.col === col}
                <button
                  class:top-row={row === 0}
                  class:bottom-row={row === 3}
                  class:selected-cell={isSelected}
                  class:valid={canTarget || canHire}
                  class:capture={canTarget && cell}
                  class:last-to={wasTo}
                  class:last-from={wasFrom}
                  class="cell"
                  aria-label={`${row + 1}행 ${col + 1}열`}
                  on:click={() => handleCell(row, col)}
                >
                  {#if cell}
                    <PixelPiece
                      type={cell.type}
                      owner={cell.owner}
                      size={62}
                      selected={isSelected}
                      dim={cell.owner !== game.turn && !game.winner}
                    />
                  {:else if canTarget || canHire}
                    <span class="move-dot" aria-hidden="true"></span>
                  {/if}
                </button>
              {/each}
            {/each}
          </div>
          <small class="zone home-zone">▲ NOWBIZ HQ</small>
        </div>

        <HandTray
          owner="P1"
          label="내 영입대기"
          pieces={game.hands.P1}
          selectedIndex={selectedHand?.owner === 'P1' ? selectedHand.index : -1}
          on:pick={(event) => pickHand(event.detail.owner, event.detail.index)}
        />

        <PlayerHud
          owner="P1"
          name="NOWBIZ"
          rating="1762"
          active={game.turn === 'P1'}
          handCount={game.hands.P1.length}
        />

        <footer class="actionbar">
          <button on:click={() => (screen = 'home')}>홈</button>
          <button on:click={() => (screen = 'rules')}>룰</button>
          <button class="danger" on:click={resetGame}>재시작</button>
        </footer>

        {#if game.winner}
          <div class="result">
            <div class="pixel-box">
              <span>{game.winReason === 'CEO_CAPTURED' ? 'CEO 포획' : '본사 진입'}</span>
              <h2>{game.winner === 'P1' ? 'NOWBIZ 승리' : 'RIVAL INC. 승리'}</h2>
              <button class="pixel-button amber" on:click={resetGame}>다시 대국</button>
            </div>
          </div>
        {/if}
      </section>
    {/if}
  </section>

  <aside class="desktop-panel pixel-box">
    <h2>서버 분리 준비</h2>
    <p>
      게임 룰은 <code>packages/game-core</code>, 웹 클라이언트는 <code>apps/web</code>,
      웹소켓 서버 자리는 <code>apps/realtime</code>로 나눴습니다.
    </p>
    <div class="log">
      {#each game.log as entry}
        <span>{entry.text}</span>
      {:else}
        <span>대국 로그가 여기에 표시됩니다.</span>
      {/each}
    </div>
  </aside>
</main>

<div class="crt-overlay"></div>

<style>
  .app-shell {
    min-height: 100svh;
    position: relative;
    display: grid;
    place-items: center;
    padding: 0;
    overflow: hidden;
  }

  .bg-dots {
    position: fixed;
    inset: 0;
    opacity: 0.5;
  }

  .app-shell::before {
    content: '';
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, rgba(10, 14, 39, 0.2), var(--bg-deep));
  }

  .phone {
    position: relative;
    z-index: 1;
    width: min(100vw, 430px);
    min-height: 100svh;
    background: var(--bg-deep);
    overflow: hidden;
  }

  .topbar {
    height: calc(56px + env(safe-area-inset-top));
    padding: calc(12px + env(safe-area-inset-top)) 14px 8px;
    display: grid;
    grid-template-columns: 34px 1fr 34px;
    align-items: center;
    gap: 8px;
  }

  .topbar div {
    text-align: center;
  }

  .topbar strong {
    display: block;
    font-size: 15px;
  }

  .topbar span {
    display: block;
    margin-top: 2px;
    color: var(--text-tertiary);
    font: 700 9px/1 var(--font-mono);
  }

  .icon-button {
    width: 34px;
    height: 34px;
    border: 2px solid var(--line-hard);
    background: var(--bg-panel);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
    font-size: 18px;
  }

  .game-screen {
    position: relative;
    display: grid;
    grid-template-rows: auto auto auto 1fr auto auto 50px;
    gap: 8px;
    min-height: calc(100svh - 56px - env(safe-area-inset-top));
    padding: 6px 12px 0;
  }

  .turn-strip {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    min-height: 32px;
    color: var(--accent);
    font-size: 11px;
  }

  .turn-strip::before,
  .turn-strip::after {
    content: '';
    height: 2px;
    background: var(--line-hard);
  }

  .turn-strip span {
    justify-self: center;
    grid-column: 1 / -1;
    grid-row: 1;
    padding: 5px 10px;
    border: 2px solid var(--accent);
    background: var(--bg-night);
  }

  .turn-strip b {
    grid-column: 2;
    grid-row: 1;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
  }

  .board-wrap {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 5px;
    min-height: 0;
  }

  .zone {
    color: var(--p1-light);
    font: 700 10px/1 var(--font-mono);
    letter-spacing: 0;
  }

  .enemy-zone {
    color: var(--p2-light);
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, minmax(74px, 104px));
    grid-template-rows: repeat(4, minmax(74px, 104px));
    width: min(100%, 336px);
    aspect-ratio: 3 / 4;
    padding: 8px;
    border: 4px solid var(--line-hard);
    background: #2a1f0f;
    box-shadow: var(--shadow-lg);
  }

  .cell {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    min-width: 0;
    min-height: 0;
    border: 2px solid rgba(0, 0, 0, 0.45);
    background: #5a3920;
    cursor: pointer;
  }

  .cell.top-row {
    background: #3d2410;
  }

  .cell.bottom-row {
    background: #1e2a4a;
  }

  .cell:nth-child(n + 7):nth-child(-n + 9) {
    background: #2c3863;
  }

  .selected-cell {
    outline: 4px solid var(--accent-glow);
    outline-offset: -7px;
  }

  .last-to,
  .last-from {
    box-shadow: inset 0 0 0 4px rgba(252, 211, 77, 0.34);
  }

  .capture {
    outline: 4px solid var(--danger);
    outline-offset: -6px;
  }

  .move-dot {
    width: 28%;
    aspect-ratio: 1;
    display: block;
    border: 3px solid #000;
    background: var(--accent-glow);
    box-shadow: var(--shadow-sm);
    animation: pixel-pulse 0.8s infinite;
  }

  .actionbar {
    margin-inline: -12px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-top: 2px solid var(--line-hard);
    background: var(--bg-night);
  }

  .actionbar button {
    border: 0;
    border-right: 1px solid var(--line-hard);
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
  }

  .actionbar .danger {
    color: var(--danger);
  }

  .home {
    min-height: calc(100svh - 56px);
    display: grid;
    align-content: center;
    gap: 34px;
    padding: 24px;
    text-align: center;
  }

  .logo span {
    color: var(--accent);
    font: 700 11px/1 var(--font-mono);
  }

  .logo h1 {
    margin: 10px 0 4px;
    font-size: 42px;
    line-height: 1;
    letter-spacing: 0;
  }

  .logo p {
    margin: 0;
    color: var(--text-tertiary);
    font: 700 11px/1 var(--font-mono);
  }

  .piece-line {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .menu-stack {
    display: grid;
    gap: 14px;
  }

  .rules {
    margin: 18px 12px;
    padding: 16px;
  }

  .rules h2 {
    margin: 0 0 12px;
    font-size: 18px;
  }

  .rule-row {
    display: grid;
    grid-template-columns: 44px 1fr;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid var(--line-soft);
  }

  .rule-row strong,
  .rule-row span {
    display: block;
  }

  .rule-row span,
  .rules p {
    color: var(--text-secondary);
    font-size: 12px;
  }

  .result {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgba(10, 14, 39, 0.72);
  }

  .result > div {
    width: 100%;
    padding: 18px;
    text-align: center;
  }

  .result span {
    color: var(--accent);
    font-size: 11px;
  }

  .result h2 {
    margin: 8px 0 18px;
  }

  .desktop-panel {
    display: none;
  }

  @media (min-width: 880px) {
    .app-shell {
      grid-template-columns: auto 320px;
      gap: 28px;
      padding: 28px;
    }

    .phone {
      width: 393px;
      min-height: 852px;
      max-height: 852px;
      border: 4px solid var(--line-hard);
      box-shadow: 12px 12px 0 0 rgba(0, 0, 0, 0.45);
    }

    .desktop-panel {
      position: relative;
      z-index: 1;
      display: block;
      width: 320px;
      padding: 18px;
    }

    .desktop-panel h2 {
      margin: 0 0 10px;
      font-size: 18px;
    }

    .desktop-panel p,
    .log {
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.6;
    }

    .log {
      display: grid;
      gap: 8px;
      margin-top: 18px;
      font-family: var(--font-mono);
      font-size: 11px;
    }
  }
</style>
