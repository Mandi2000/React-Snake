import { useEffect, useRef, useState } from 'react';
import { advance, DIRECTIONS, newGame, TICK } from './game';
import './Snake.css';

function draw(ctx, game) {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#101d25';
  ctx.fillRect(0, 0, 500, 500);
  ctx.fillStyle = '#1a2a31';
  for (let y = 5; y < 500; y += 10) for (let x = 5; x < 500; x += 10) ctx.fillRect(x, y, 1, 1);
  game.snake.forEach(({ x, y }, index) => {
    const px = x * 10, py = y * 10;
    ctx.fillStyle = index === 0 ? '#d5ff90' : '#a5db5c';
    ctx.fillRect(px, py, 10, 10);
    ctx.fillStyle = '#6da246';
    ctx.fillRect(px, py + 8, 10, 2);
    if (index === 0) {
      ctx.fillStyle = '#152623';
      const { x: dx, y: dy } = game.direction;
      if (dx) { ctx.fillRect(px + (dx > 0 ? 6 : 2), py + 2, 2, 2); ctx.fillRect(px + (dx > 0 ? 6 : 2), py + 6, 2, 2); }
      else { ctx.fillRect(px + 2, py + (dy > 0 ? 6 : 2), 2, 2); ctx.fillRect(px + 6, py + (dy > 0 ? 6 : 2), 2, 2); }
    } else if (index % 3 === 0) {
      ctx.fillStyle = '#c6ef82'; ctx.fillRect(px + 2, py + 2, 2, 2);
    }
  });
  if (game.food) {
    const sprite = ['0004400000', '0000440000', '0220022000', '2332233200', '2333333200', '2333333200', '0233332000', '0022220000'];
    const colors = { 2: '#d74f59', 3: '#ff7880', 4: '#bcf56b' };
    sprite.forEach((row, y) => [...row].forEach((pixel, x) => {
      if (colors[pixel]) { ctx.fillStyle = colors[pixel]; ctx.fillRect(game.food.x * 10 + x, game.food.y * 10 + y, 1, 1); }
    }));
  }
}

const pad = value => String(value).padStart(3, '0');

export default function Snake() {
  const [game, setGame] = useState(newGame);
  const [record, setRecord] = useState(0);
  const current = useRef(game);
  const pending = useRef(null);
  const canvas = useRef(null);
  const action = useRef(null);

  function publish(next) { current.current = next; setGame(next); }
  function togglePause() {
    const g = current.current;
    if (g.status === 'running' || g.status === 'paused') publish({ ...g, status: g.status === 'running' ? 'paused' : 'running' });
  }
  function start() { pending.current = null; publish({ ...newGame(), status: 'running' }); }

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    if (ctx) draw(ctx, game);
    if (game.status === 'over' || game.status === 'won') action.current?.focus();
  }, [game]);

  useEffect(() => {
    function onKey(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const direction = DIRECTIONS[key];
      if (direction && current.current.status === 'running') {
        event.preventDefault();
        const prev = current.current.direction;
        if (!pending.current && !(direction.x === -prev.x && direction.y === -prev.y)) pending.current = direction;
      }
      if (event.code === 'Space' && event.target.tagName !== 'BUTTON' && !event.repeat) {
        event.preventDefault();
        togglePause();
      }
    }
    function onVisibility() {
      if (document.hidden && current.current.status === 'running') publish({ ...current.current, status: 'paused' });
    }
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onVisibility); };
    // Event handlers read the current game through its ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (game.status !== 'running') return;
    const timer = setInterval(() => {
      const next = advance(current.current, pending.current || current.current.direction);
      pending.current = null;
      publish(next);
      setRecord(previous => Math.max(previous, next.score));
    }, TICK);
    return () => clearInterval(timer);
  }, [game.status]);

  const titles = { ready: '¿UNA PARTIDA?', paused: 'EN PAUSA', over: 'FIN DEL JUEGO', won: '¡LO LOGRASTE!' };
  const descriptions = { ready: 'Come, crece y supera tu récord.', paused: 'Respira. Tus píxeles te esperan.', over: game.score + ' puntos. Siempre hay otro intento.', won: 'Cada píxel del tablero es tuyo.' };

  return (
    <section className="snake-game" aria-label="Juego Snake">
      <div className="game-heading"><span className="eyebrow"><i /> EL ARCADE NUNCA DUERME</span><h1>SNAKE<span className="title-dot">.</span></h1><p>Un clásico de siempre. Píxel a píxel.</p></div>
      <div className="arcade-machine">
        <div className="dashboard">
          <div className="stat"><span>PUNTOS</span><strong aria-label={'Puntos: ' + game.score}>{pad(game.score)}</strong></div>
          <div className="machine-label"><span className="tiny-snake" aria-hidden="true">▰▰▰</span><span>NOCTURNO / 01</span></div>
          <div className="stat record"><span>RÉCORD <span aria-hidden="true">♛</span></span><strong aria-label={'Récord: ' + record}>{pad(record)}</strong></div>
        </div>
        <div className="board-frame"><div className="board">
          <canvas ref={canvas} width="500" height="500" role="img" aria-label="Tablero de Snake: usa WASD o las flechas para moverte" />
          {game.status !== 'running' && <div className="game-overlay"><div className="overlay-content">
            <div className="pixel-apple" aria-hidden="true" />
            <span className="overlay-kicker">{game.status === 'ready' ? 'INSERTA UN POCO DE NOSTALGIA' : 'SNAKE / ARCADE NOCTURNO'}</span>
            <h2>{titles[game.status]}</h2><p>{descriptions[game.status]}</p>
            <button ref={action} className="pixel-button" onClick={game.status === 'paused' ? togglePause : start}><span aria-hidden="true">▶</span> {game.status === 'ready' ? 'JUGAR AHORA' : game.status === 'paused' ? 'CONTINUAR' : 'VOLVER A JUGAR'}</button>
            <span className="overlay-hint">{game.status === 'ready' ? 'SIN PRISAS. HASTA QUE EMPIECES.' : game.status === 'paused' ? 'ESPACIO PARA CONTINUAR' : 'RÉCORD DE LA SESIÓN: ' + pad(record)}</span>
          </div></div>}
        </div></div>
        <div className="machine-bottom"><span className={'status ' + (game.status === 'running' ? 'is-running' : '')} role="status"><i />{({ ready: 'LISTO PARA JUGAR', running: 'EN PARTIDA', paused: 'PARTIDA EN PAUSA', over: 'PARTIDA TERMINADA', won: 'TABLERO COMPLETADO' })[game.status]}</span><button className="pause-button" disabled={!['running', 'paused'].includes(game.status)} onClick={togglePause}>{game.status === 'paused' ? '▶ CONTINUAR' : 'Ⅱ PAUSA'}</button></div>
      </div>
      <div className="controls"><div className="key-group"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span className="or">/</span><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd></span><span>MOVER</span></div><span className="control-divider" /><div className="key-group"><kbd className="space-key">ESPACIO</kbd><span>PAUSAR</span></div></div>
      <p className="game-tip"><span aria-hidden="true">✦</span> Come manzanas. Evita las paredes. No te muerdas la cola.</p>
    </section>
  );
}

