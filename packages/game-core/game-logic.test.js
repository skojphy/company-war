import assert from 'node:assert/strict';
import {
  createGame,
  dropPiece,
  getValidDrops,
  getValidMoves,
  movePiece,
  piece
} from './game-logic.js';

const game = createGame();
assert.deepEqual(getValidMoves(game.board, 3, 1).sort(), [
  [2, 0],
  [2, 2]
].sort());
assert.deepEqual(getValidMoves(game.board, 2, 1), [[1, 1]]);

let promotion = createGame();
promotion.board = [
  [null, null, null],
  [null, piece('DEV', 'P1'), null],
  [null, null, null],
  [null, piece('CEO', 'P1'), piece('CEO', 'P2')]
];
promotion = movePiece(promotion, { row: 1, col: 1 }, { row: 0, col: 1 });
assert.equal(promotion.board[0][1].type, 'CTO');

let capture = createGame();
capture.board = [
  [null, piece('CEO', 'P2'), null],
  [null, piece('MKT', 'P1'), null],
  [null, null, null],
  [null, piece('CEO', 'P1'), null]
];
capture = movePiece(capture, { row: 1, col: 1 }, { row: 0, col: 1 });
assert.equal(capture.winner, 'P1');
assert.equal(capture.winReason, 'CEO_CAPTURED');

let drops = createGame();
drops.hands.P1 = [{ type: 'DEV', owner: 'P1' }];
assert.equal(getValidDrops(drops.board, 'DEV', 'P1').some(([row]) => row === 0), false);
drops = dropPiece(drops, 0, { row: 1, col: 0 });
assert.equal(drops.board[1][0].type, 'DEV');
assert.equal(drops.turn, 'P2');

console.log('game-core tests passed');
