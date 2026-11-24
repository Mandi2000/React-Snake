import { advance, newGame, placeFood, WIDTH } from './game';

const running = overrides => ({ ...newGame(), status: 'running', ...overrides });

test('moves one cell without mutating the previous game', () => {
  const game = running();
  const snapshot = JSON.stringify(game);
  const next = advance(game);
  expect(next.snake[0]).toEqual({ x: 25, y: 25 });
  expect(next.snake).toHaveLength(7);
  expect(JSON.stringify(game)).toBe(snapshot);
});

test('scores on entering food and grows exactly four valid segments', () => {
  let game = running({ food: { x: 25, y: 25 } });
  game = advance(game, game.direction, () => 0);
  expect(game.score).toBe(1);
  expect(game.snake).toHaveLength(8);
  expect(game.growing).toBe(3);
  for (let i = 0; i < 3; i++) game = advance(game);
  expect(game.snake).toHaveLength(11);
  expect(game.growing).toBe(0);
  game = advance(game);
  expect(game.snake).toHaveLength(11);
  expect(game.snake.every(p => Number.isInteger(p.x) && Number.isInteger(p.y))).toBe(true);
});

test.each([
  [{ x: 0, y: 20 }, { x: -1, y: 0 }],
  [{ x: 49, y: 20 }, { x: 1, y: 0 }],
  [{ x: 20, y: 0 }, { x: 0, y: -1 }],
  [{ x: 20, y: 49 }, { x: 0, y: 1 }],
])('ends on crossing a wall', (head, direction) => {
  expect(advance(running({ snake: [head], direction })).status).toBe('over');
});

test('ends on body collision but permits entering the vacating tail', () => {
  const snake = [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }];
  expect(advance(running({ snake }), { x: 0, y: 1 }).status).toBe('over');
  expect(advance(running({ snake }), { x: -1, y: 0 }).status).toBe('running');
  expect(advance(running({ snake, growing: 1 }), { x: -1, y: 0 }).status).toBe('over');
});

test('food occupies only a free cell, including a nearly full board', () => {
  const snake = [];
  for (let y = 0; y < WIDTH; y++) for (let x = 0; x < WIDTH; x++) snake.push({ x, y });
  expect(placeFood(snake)).toBeNull();
  snake.pop();
  expect(placeFood(snake, () => 0.999)).toEqual({ x: 49, y: 49 });
});

test('wins when the last free cell is eaten', () => {
  const snake = [{ x: 48, y: 49 }];
  for (let y = 0; y < WIDTH; y++) for (let x = 0; x < WIDTH; x++) {
    if (y === 49 && (x === 48 || x === 49)) continue;
    snake.push({ x, y });
  }
  const next = advance(running({ snake, food: { x: 49, y: 49 } }));
  expect(next.status).toBe('won');
  expect(next.food).toBeNull();
  expect(next.snake).toHaveLength(2500);
});

test.each(['ready', 'paused', 'over', 'won'])('does not advance in %s state', status => {
  const game = { ...newGame(), status };
  expect(advance(game)).toBe(game);
});

