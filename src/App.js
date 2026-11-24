import './App.css';
import Snake from './Components/Snake';

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <a className="brand" href="./" aria-label="Snake, inicio"><span className="brand-mark" aria-hidden="true">▟</span> PIXEL PLAY</a>
        <span className="edition">EST. 1976 <span> / </span> REIMAGINADO</span>
      </header>
      <main><Snake /></main>
      <footer className="App-footer"><span>UN CLÁSICO. UN INTENTO MÁS.</span><span>HECHO DE PÍXELES Y NOSTALGIA <span className="footer-star">✦</span></span></footer>
    </div>
  );
}

