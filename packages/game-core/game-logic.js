export const BOARD_ROWS = 4;
export const BOARD_COLS = 3;

export const PLAYERS = {
  P1: 'P1',
  P2: 'P2'
};

export const PIECE_TYPES = {
  CEO: { id: 'CEO', name: 'CEO', nameEn: 'CEO', tag: 'C', desc: '8방향 1칸' },
  MKT: { id: 'MKT', name: '마케팅', nameEn: 'MKT', tag: 'M', desc: '상하좌우 1칸' },
  PM: { id: 'PM', name: '기획', nameEn: 'PM', tag: 'P', desc: '대각선 1칸' },
  DEV: { id: 'DEV', name: '개발자', nameEn: 'DEV', tag: 'D', desc: '직진 1칸' },
  CTO: { id: 'CTO', name: 'CTO', nameEn: 'CTO', tag: 'T', desc: '상하좌우, 상좌, 상우 1칸' }
};

export const MOVE_DELTAS = {
  CEO: [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
  ],
  MKT: [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ],
  PM: [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1]
  ],
  DEV: [[-1, 0]],
  CTO: [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, 0]
  ]
};

export function initialBoard() {
  return [
    [piece('PM', 'P2'), piece('CEO', 'P2'), piece('MKT', 'P2')],
    [null, piece('DEV', 'P2'), null],
    [null, piece('DEV', 'P1'), null],
    [piece('MKT', 'P1'), piece('CEO', 'P1'), piece('PM', 'P1')]
  ];
}

export function createGame() {
  return {
    board: initialBoard(),
    hands: { P1: [], P2: [] },
    turn: 'P1',
    winner: null,
    winReason: null,
    lastMove: null,
    moveNumber: 1,
    log: []
  };
}

export function piece(type, owner) {
  return { type, owner };
}

export function otherPlayer(owner) {
  return owner === 'P1' ? 'P2' : 'P1';
}

export function cloneGame(game) {
  return {
    ...game,
    board: game.board.map((row) => row.map((cell) => (cell ? { ...cell } : null))),
    hands: {
      P1: game.hands.P1.map((p) => ({ ...p })),
      P2: game.hands.P2.map((p) => ({ ...p }))
    },
    lastMove: game.lastMove ? { ...game.lastMove } : null,
    log: game.log.map((entry) => ({ ...entry }))
  };
}

export function isInside(row, col) {
  return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
}

export function forwardSign(owner) {
  return owner === 'P1' ? 1 : -1;
}

export function promotionRow(owner) {
  return owner === 'P1' ? 0 : BOARD_ROWS - 1;
}

export function getValidMoves(board, row, col) {
  const moving = board[row]?.[col];
  if (!moving) return [];

  const flip = moving.owner === 'P2' ? -1 : 1;
  return MOVE_DELTAS[moving.type]
    .map(([dr, dc]) => [row + dr * flip, col + dc])
    .filter(([r, c]) => {
      if (!isInside(r, c)) return false;
      const target = board[r][c];
      return !target || target.owner !== moving.owner;
    });
}

export function getValidDrops(board, type, owner) {
  const baseType = demote(type);
  const drops = [];
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      if (board[row][col]) continue;
      if (baseType === 'DEV' && row === promotionRow(owner)) continue;
      drops.push([row, col]);
    }
  }
  return drops;
}

export function canMove(board, from, to) {
  return getValidMoves(board, from.row, from.col).some(([row, col]) => row === to.row && col === to.col);
}

export function canDrop(board, type, owner, to) {
  return getValidDrops(board, type, owner).some(([row, col]) => row === to.row && col === to.col);
}

export function movePiece(game, from, to) {
  if (game.winner) return game;
  const next = cloneGame(game);
  const moving = next.board[from.row]?.[from.col];
  if (!moving || moving.owner !== next.turn || !canMove(next.board, from, to)) return game;

  const captured = next.board[to.row][to.col];
  next.board[from.row][from.col] = null;
  next.board[to.row][to.col] = promoteIfNeeded(moving, to.row);

  if (captured) {
    next.hands[moving.owner].push({ type: demote(captured.type), owner: moving.owner });
  }

  next.lastMove = { kind: 'move', from, to, piece: moving.type, captured: captured?.type ?? null };
  next.log = [
    { turn: next.moveNumber, owner: moving.owner, text: describeMove(moving, from, to, captured) },
    ...next.log
  ].slice(0, 8);
  applyWinState(next, moving.owner, captured, to);
  advanceTurn(next);
  return next;
}

export function dropPiece(game, handIndex, to) {
  if (game.winner) return game;
  const next = cloneGame(game);
  const hand = next.hands[next.turn];
  const dropping = hand[handIndex];
  if (!dropping || !canDrop(next.board, dropping.type, next.turn, to)) return game;

  const [removed] = hand.splice(handIndex, 1);
  next.board[to.row][to.col] = { type: demote(removed.type), owner: next.turn };
  next.lastMove = { kind: 'drop', to, piece: removed.type };
  next.log = [{ turn: next.moveNumber, owner: next.turn, text: describeDrop(removed, to) }, ...next.log].slice(0, 8);
  advanceTurn(next);
  return next;
}

export function demote(type) {
  return type === 'CTO' ? 'DEV' : type;
}

export function promoteIfNeeded(moving, row) {
  if (moving.type === 'DEV' && row === promotionRow(moving.owner)) {
    return { type: 'CTO', owner: moving.owner, promoted: true };
  }
  return { ...moving };
}

function advanceTurn(game) {
  if (!game.winner) {
    game.turn = otherPlayer(game.turn);
    game.moveNumber += 1;
  }
}

function applyWinState(game, owner, captured, to) {
  if (captured?.type === 'CEO') {
    game.winner = owner;
    game.winReason = 'CEO_CAPTURED';
    return;
  }

  const arrived = game.board[to.row][to.col];
  if (arrived?.type === 'CEO' && to.row === promotionRow(owner)) {
    game.winner = owner;
    game.winReason = 'CEO_ENTERED_HQ';
  }
}

function describeMove(pieceValue, from, to, captured) {
  const hit = captured ? ` x ${PIECE_TYPES[captured.type].nameEn}` : '';
  return `${pieceValue.owner} ${PIECE_TYPES[pieceValue.type].nameEn} ${coord(from)}-${coord(to)}${hit}`;
}

function describeDrop(pieceValue, to) {
  return `${pieceValue.owner} hires ${PIECE_TYPES[pieceValue.type].nameEn} @ ${coord(to)}`;
}

export function coord(pos) {
  return `${String.fromCharCode(65 + pos.col)}${pos.row + 1}`;
}
