import React from 'react';
import './Snake.css';

const STATE_RUNNING = 1;
const STATE_LOSING = 2;

const TICK = 80;
const SQUARE_SIZE = 10;
const BOARD_WIDTH = 50;
const BOARD_HEIGHT = 50;
const GROW_SCALE= 4;
const DIRECTIONS_MAPS = {
    'A': [-1, 0],
    'D': [1, 0],
    'S': [0, 1],
    'W': [0, -1],
    'a': [-1, 0],
    'd': [1, 0],
    's': [0, 1],
    'w': [0, -1],
};



let state = {
    canvas: null,
    context: null,
    snake: [{x: 0, y: 0}],
    direction: {x: 1, y: 0},
    prey: {x: 0, y: 0},
    growing: 0,
    record: 0,
    cont: 0,
    runState: STATE_RUNNING
};

function randomXY() {
    return{
        x: parseInt(Math.random() * BOARD_WIDTH),
        y: parseInt(Math.random() * BOARD_HEIGHT)
    };
}

function tick() {
    const head = state.snake[0];
    const dx = state.direction.x;
    const dy = state.direction.y;
    const highestIndex = state.snake.length - 1;
    let tail = {};
    let interval = TICK;

    let didScore = (
        head.x === state.prey.x
        && head.y === state.prey.y
    );

    if (state.runState === STATE_RUNNING) {
        for (let index = highestIndex; index > -1; index--) {
            const sq = state.snake[index];

            if (index === 0) {
                sq.x += dx;
                sq.y += dy;
            } else {
                sq.x = state.snake[index -1].x;
                sq.y = state.snake[index -1].y;
            }
            
        }
    } else if(state.runState === STATE_LOSING){
        interval = 10;

        if(state.snake.length > 0){
            state.snake.splice(0, 1);
        }

        if(state.snake.length === 0){
            state.runState = STATE_RUNNING;
            state.snake.push(randomXY());
            state.prey = randomXY();
        }
    }

    if (didScore) {
        state.growing += GROW_SCALE;
        state.prey = randomXY();
        state.cont += 1; 
    }

    if(detectCollision()){
        state.runState = STATE_LOSING;
        state.growing = 0;
        if(state.record < state.cont){
            state.record = state.cont;
            alert('Felicitaciones haz conseguido un nuevo record: ' + state.record + ' puntos!!!');
        }
        state.cont = 0;
    }

    if(state.growing > 0){
        state.snake.push(tail);
        state.growing -= 1;
    }

    document.getElementById("score").innerHTML = "Score: " + state.cont;
    requestAnimationFrame(draw);
    setTimeout(tick, interval);
}

function detectCollision() {
    const head = state.snake[0];

    if (head.x < 0
        || head.x >= BOARD_WIDTH
        || head.y >= BOARD_HEIGHT
        || head.y < 0){
            return true;
        }

        for (let index = 1; index < state.snake.length; index++) {
            const sq = state.snake[index];
            
            if(sq.x === head.x && sq.y === head.y){
                return true;
            }
        }
    return false;
}

function drawPixel(color, x, y) {
    state.context.fillStyle = color;
    state.context.fillRect(
        x * SQUARE_SIZE,
        y *SQUARE_SIZE,
        SQUARE_SIZE,
        SQUARE_SIZE
    );
}   

function draw() {
    state.context.clearRect(0, 0, 500, 500);
  
    for (let i = 0; i < state.snake.length; i++) {
      const { x, y } = state.snake[i];
  
      if (i === 0) {
        drawPixel('black', x, y);
      } else {
        drawPixel('#22dd22', x, y);
      }
    }
  
    const { x, y } = state.prey;
    drawPixel('red', x, y);
}
  

 function start () {
    state.canvas = document.querySelector('canvas');
    state.context = state.canvas.getContext('2d');
    // Get the button element
    const startButton = document.getElementById("start-button");
    startButton.style.display = "none";

    window.onkeydown = function(e) {
        const direction = DIRECTIONS_MAPS[e.key];

        if (direction) {
            const[x,y] = direction;
            if (-x !== state.direction.x
                && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }

    tick();
};

function StartButton(props) {
    const handleClick = () => {
        start();
    };
  
    return <button onClick={handleClick} className='startButton' id='start-button'>Start Game</button>;
  }


function Snake() {
    return (
      <div className="container">
        <StartButton/>
        <div id="score"></div>    
        <canvas width="500" height="500">
        </canvas>
      </div>
    );
  }
  
  export default Snake;
  