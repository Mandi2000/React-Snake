export const WIDTH = 50;
export const TICK = 80;
export const DIRECTIONS = { ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 } };

export function placeFood(snake, random = Math.random) {
  const occupied = new Set(snake.map(({ x, y }) => x + ',' + y));
  const free = [];
  for (let y = 0; y < WIDTH; y++) for (let x = 0; x < WIDTH; x++) {
    if (!occupied.has(x + ',' + y)) free.push({ x, y });
  }
  return free.length ? free[Math.floor(random() * free.length)] : null;
}

export function newGame() {
  const snake = Array.from({ length: 7 }, (_, i) => ({ x: 24 - i, y: 25 }));
  return { snake, direction: { x: 1, y: 0 }, food: { x: 34, y: 25 }, growing: 0, score: 0, status: 'ready' };
}

export function advance(game, direction = game.direction, random = Math.random) {
  if (game.status !== 'running') return game;
  const head = { x: game.snake[0].x + direction.x, y: game.snake[0].y + direction.y };
  const ate = game.food && head.x === game.food.x && head.y === game.food.y;
  const growing = game.growing + (ate ? 4 : 0);
  const body = growing ? game.snake : game.snake.slice(0, -1);
  if (head.x < 0 || head.y < 0 || head.x >= WIDTH || head.y >= WIDTH || body.some(p => p.x === head.x && p.y === head.y)) {
    return { ...game, direction, status: 'over' };
  }
  const snake = [head, ...game.snake];
  if (!growing) snake.pop();
  const food = ate ? placeFood(snake, random) : game.food;
  return { ...game, snake, direction, food, growing: Math.max(0, growing - 1), score: game.score + (ate ? 1 : 0), status: food ? 'running' : 'won' };
}

