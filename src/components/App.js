import React, { Component } from "react";
import { connect } from "react-redux";

import {
  reset,
  setGameOver,
  createApple,
  updateSnakeTail,
  updateSnakeHead,
  updateSnakeVelocity,
} from "../actions";
import {
  GRID_SIZE,
  GAME_SPEED,
  INITIAL_STATE,
  LOCAL_STORAGE_KEY,
  UP,
  DOWN,
  LEFT,
  RIGHT,
  KEY_DOWN,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_UP,
  KEY_ENTER,
} from "../actions/types";

import "./style.css";
import EatSound from "../assets/EatSound.ogg";

class App extends Component {
  eatAudio = new Audio(EatSound);

  componentDidMount = () => {
    this.start();
  };
  playEatAudio = () => {
    return this.eatAudio.play();
  };
  start = () => {
    this.props.reset({
      state: INITIAL_STATE,
    });
    document.addEventListener("keydown", (e) => {
      this.moveSnake(e);
    });
    setTimeout(() => {
      this.gameLoop();
    }, GAME_SPEED);
  };

  gameLoop = () => {
    //if game is over exit game loop
    if (this.props.gameOver) return;

    //extracting data from props to change state
    const { snake } = this.props;

    // updating head
    const newHead = {
      row: snake.head.row + snake.velocity.y,
      col: snake.head.col + snake.velocity.x,
    };
    this.props.updateSnakeHead({
      newHead,
    });

    //move over condition
    this.moveOnEdge();

    // updating apple and tail
    let newTail = [snake.head, ...snake.tail];
    const isEat = this.snakeEatsApple();

    if (isEat) {
      this.playEatAudio()
        .then(() => {
          console.log("ate");
        })
        .catch((e) => {
          console.log(e);
        });
      const newApple = this.getRandomApple();
      this.props.createApple({
        newApple,
      });
    } else {
      newTail.pop();
    }
    this.props.updateSnakeTail({
      newTail,
    });

    //game over condition
    if (this.isGameOver()) {
      this.updateHigh();
      this.props.setGameOver({
        flag: true,
      });
    }

    //restart loop after defined time
    setTimeout(() => {
      this.gameLoop();
    }, GAME_SPEED);
  };

  moveOnEdge = () => {
    const { snake } = this.props;
    if (this.isOffEdge(snake.head)) {
      if (snake.head.col > GRID_SIZE - 1) {
        const newHead = {
          row: snake.head.row,
          col: 0,
        };
        this.props.updateSnakeHead({
          newHead,
        });
      } else if (snake.head.col < 0) {
        const newHead = {
          row: snake.head.row,
          col: GRID_SIZE - 1,
        };
        this.props.updateSnakeHead({
          newHead,
        });
      } else if (snake.head.row < 0) {
        const newHead = {
          row: GRID_SIZE - 1,
          col: snake.head.col,
        };
        this.props.updateSnakeHead({
          newHead,
        });
      } else if (snake.head.row > GRID_SIZE - 1) {
        const newHead = {
          row: 0,
          col: snake.head.col,
        };
        this.props.updateSnakeHead({
          newHead,
        });
      }
    }
  };

  getRandomApple = () => {
    const { grid } = this.props;
    const emptyCells = [];
    grid.forEach((row) => {
      row.forEach((cell) => {
        if (!(this.isTail(cell) || this.isHead(cell))) {
          emptyCells.push(cell);
        }
      });
    });
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  snakeEatsApple = () => {
    const { apple, snake } = this.props;

    return apple.row === snake.head.row && apple.col === snake.head.col;
  };

  isEating = () => {
    if (this.snakeEatsApple()) {
      console.log("here");
      return "eating";
    }
    return "";
  };

  isGameOver = () => {
    if (this.isTail(this.props.snake.head)) {
      return true;
    }
    return false;
  };

  isOffEdge = () => {
    const { snake } = this.props;
    if (
      snake.head.col > GRID_SIZE - 1 ||
      snake.head.col < 0 ||
      snake.head.row > GRID_SIZE - 1 ||
      snake.head.row < 0
    ) {
      return true;
    }
  };

  isHead = (cell) => {
    const { snake } = this.props;
    return snake.head.row === cell.row && snake.head.col === cell.col;
  };

  isApple = (cell) => {
    const { apple } = this.props;
    return apple.row === cell.row && apple.col === cell.col;
  };

  isTail = (cell) => {
    const { tail } = this.props.snake;
    return tail.find((inTail) => {
      return inTail.row === cell.row && inTail.col === cell.col;
    });
  };

  getHigh = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY);
  };

  updateHigh = () => {
    const { snake } = this.props;
    if (this.getHigh() === null || this.getHigh() < snake.tail.length - 2) {
      localStorage.setItem(LOCAL_STORAGE_KEY, snake.tail.length - 2);
    }
  };
  moveSnake = (event) => {
    const { snake } = this.props;
    switch (event.keyCode) {
      case KEY_UP:
        if (snake.velocity === UP || snake.velocity === DOWN) return;
        this.props.updateSnakeVelocity({
          newVelocity: UP,
        });
        return;
      case KEY_LEFT:
        if (snake.velocity === LEFT || snake.velocity === RIGHT) return;
        this.props.updateSnakeVelocity({
          newVelocity: LEFT,
        });
        return;
      case KEY_DOWN:
        if (snake.velocity === UP || snake.velocity === DOWN) return;
        this.props.updateSnakeVelocity({
          newVelocity: DOWN,
        });
        return;
      case KEY_RIGHT:
        if (snake.velocity === LEFT || snake.velocity === RIGHT) return;
        this.props.updateSnakeVelocity({
          newVelocity: RIGHT,
        });
        return;
      case KEY_ENTER:
        if (this.props.gameOver) this.start();
        return;
      default:
        return;
    }
  };

  renderGrid = () => {
    const { grid, snake } = this.props;

    return (
      <div className="center">
        <div className="snake-emoji">????</div>
        <div>
          <h3 className="score">
            Current Score: {snake.tail.length - 2}{" "}
            <span style={{ fontSize: "18px" }}> | </span> Highest Score:{" "}
            {this.getHigh() || 0}
          </h3>
          <section
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {grid.map((row) =>
              row.map((cell) => (
                <div
                  key={`${cell.row} ${cell.col}`}
                  style={{
                    width: `${800 / GRID_SIZE}`,
                    height: `${800 / GRID_SIZE}`,
                  }}
                  className={`cell ${
                    this.isHead(cell)
                      ? "head"
                      : this.snakeEatsApple(cell)
                      ? "eating"
                      : this.isApple(cell)
                      ? "apple"
                      : this.isTail(cell)
                      ? "tail"
                      : ""
                  }`}
                ></div>
              ))
            )}
          </section>
        </div>
        <div className="control-grid">
          <div
            className="control-up"
            onClick={() => this.moveSnake({ keyCode: 38 })}
          >
            &uarr;
          </div>
          <div
            className="control-left"
            onClick={() => this.moveSnake({ keyCode: 37 })}
          >
            &larr;
          </div>
          <div
            className="control-right"
            onClick={() => this.moveSnake({ keyCode: 39 })}
          >
            &rarr;
          </div>
          <div
            className="control-down"
            onClick={() => this.moveSnake({ keyCode: 40 })}
          >
            &darr;
          </div>
        </div>
      </div>
    );
  };

  renderGameOver = () => {
    return (
      <div className="card text-center">
        <div className="card-body">
          <h5 className="card-title">You bit yourself!!</h5>
          <p className="card-text">
            Your Score is: {this.props.snake.tail.length - 2}
          </p>
          <button className="btn btn-primary" onClick={this.start}>
            Restart
          </button>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="App">
        {this.props.gameOver ? this.renderGameOver() : this.renderGrid()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    grid: state.game.grid,
    apple: state.game.apple,
    snake: state.game.snake,
    gameOver: state.game.gameOver,
  };
};

export default connect(mapStateToProps, {
  reset,
  createApple,
  setGameOver,
  updateSnakeTail,
  updateSnakeHead,
  updateSnakeVelocity,
})(App);
