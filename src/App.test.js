import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { TICK } from './Components/game';

let context;
beforeEach(() => {
  jest.useFakeTimers();
  context = { fillRect: jest.fn(), imageSmoothingEnabled: true };
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
});
afterEach(() => { jest.clearAllTimers(); jest.useRealTimers(); jest.restoreAllMocks(); });
const tick = (count = 1) => act(() => jest.advanceTimersByTime(TICK * count));
const play = () => fireEvent.click(screen.getByRole('button', { name: /jugar ahora/i }));
const key = value => fireEvent.keyDown(window, { key: value, code: value === ' ' ? 'Space' : value });

test('starts only on request, draws without smoothing and scores in React', () => {
  const interval = jest.spyOn(window, 'setInterval');
  render(<App />);
  expect(screen.getByRole('heading', { name: /una partida/i })).toBeInTheDocument();
  expect(interval).not.toHaveBeenCalled();
  expect(context.imageSmoothingEnabled).toBe(false);
  play();
  expect(screen.getByRole('status')).toHaveTextContent('EN PARTIDA');
  tick(10);
  expect(screen.getByLabelText('Puntos: 1')).toHaveTextContent('001');
  expect(screen.getByLabelText('Récord: 1')).toHaveTextContent('001');
});

test('pauses and resumes with space and button without duplicate timers', () => {
  render(<App />);
  play();
  key(' ');
  expect(screen.getByRole('heading', { name: 'EN PAUSA' })).toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
  tick(50);
  expect(screen.getByLabelText('Puntos: 0')).toBeInTheDocument();
  key(' ');
  expect(jest.getTimerCount()).toBe(1);
  fireEvent.click(screen.getByRole('button', { name: /pausa/i }));
  expect(jest.getTimerCount()).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: /^▶ CONTINUAR$/i }));
  expect(jest.getTimerCount()).toBe(1);
});

test('rejects reverse moves and accepts only one turn per tick', () => {
  render(<App />);
  play();
  key('a');
  tick();
  expect(context.fillRect).toHaveBeenCalledWith(250, 250, 10, 10);
  context.fillRect.mockClear();
  key('ArrowUp');
  key('ArrowLeft');
  tick();
  expect(context.fillRect).toHaveBeenCalledWith(250, 240, 10, 10);
  context.fillRect.mockClear();
  key('A');
  tick();
  expect(context.fillRect).toHaveBeenCalledWith(240, 240, 10, 10);
});

test('ends, focuses restart, and resets score while preserving record', () => {
  render(<App />);
  play();
  tick(26);
  expect(screen.getByRole('heading', { name: 'FIN DEL JUEGO' })).toBeInTheDocument();
  const restart = screen.getByRole('button', { name: /volver a jugar/i });
  expect(restart).toHaveFocus();
  expect(jest.getTimerCount()).toBe(0);
  fireEvent.click(restart);
  expect(screen.getByLabelText('Puntos: 0')).toBeInTheDocument();
  expect(screen.getByLabelText('Récord: 1')).toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(1);
});

test('pauses on hiding the page and requires explicit resume', () => {
  render(<App />);
  play();
  jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  expect(screen.getByRole('heading', { name: 'EN PAUSA' })).toBeInTheDocument();
  jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  fireEvent(document, new Event('visibilitychange'));
  expect(jest.getTimerCount()).toBe(0);
});

test('cleans timers and event listeners on unmount', () => {
  const removeWindow = jest.spyOn(window, 'removeEventListener');
  const removeDocument = jest.spyOn(document, 'removeEventListener');
  const { unmount } = render(<App />);
  play();
  unmount();
  expect(jest.getTimerCount()).toBe(0);
  expect(removeWindow).toHaveBeenCalledWith('keydown', expect.any(Function));
  expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
});

