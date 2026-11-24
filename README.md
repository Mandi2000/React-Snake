# Snake · Pixel Play

Un Snake con estética pixel art nocturna, hecho con React 17 y Canvas 2D.

## Desarrollo

Requiere Node.js y npm. Instala las dependencias con `npm ci` y ejecuta `npm start`.
Abre http://localhost:3000.

- `npm test -- --watchAll=false --runInBand`: pruebas de lógica e interfaz.
- `npm run build`: compilación de producción.

Los comandos de inicio y compilación activan el proveedor OpenSSL heredado para
compatibilizar Webpack 4 (Create React App 4) con Node.js 22. No necesitas configurar
`NODE_OPTIONS` manualmente. Esta compatibilidad queda limitada al proceso de desarrollo
o compilación; no cambia el código del juego ejecutado en el navegador.

## Cómo jugar

Pulsa **Jugar ahora**. Usa **WASD** o las **flechas** para moverte y **espacio** o el
botón **Pausa** para pausar o continuar. Al cambiar de pestaña se pausa la partida;
debes reanudarla manualmente.

Cada manzana suma un punto y añade cuatro segmentos. Chocar contra una pared o
tu cuerpo termina la partida. Completar las 2500 casillas es una victoria.
El récord se conserva durante la sesión del componente, hasta recargar la página.

## Diseño y estructura

- Canvas lógico de 500 × 500 con cuadrícula de 50 × 50, escalado cuadrado sin suavizado.
- Sprites dibujados directamente en canvas; decoración pixelada en CSS.
- Motor puro en `src/Components/game.js` y ciclo de vida en `Snake.js`.
- Fuente Press Start 2P incluida localmente bajo SIL Open Font License; licencia en `src/assets/OFL.txt`.

La distribución se adapta a pantallas pequeñas; esta versión se controla con teclado.

