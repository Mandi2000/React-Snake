import logo from './logo.svg';
import './App.css';
import Snake from './Components/Snake';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Snake Game with React</p> 
        
      </header>
      <body className="App-body">
        <Snake/>
      </body>
    </div>
  );
}

export default App;
