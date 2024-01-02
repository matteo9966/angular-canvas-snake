import { Injectable, signal, NgZone, inject, computed } from '@angular/core';
import { GameStatus, Direction, SnakeBlock, SnakeStatus } from '../types/Types';
import { CanvasService } from './canvas.service';

const initialStatus: GameStatus = {
  refreshTime: 50,
  maxFruits: 2,
  snakes: [
    {
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      currentDirection: 'up',
      directionQueue: [],
      id: 'blue',
      status: 'play',
      keys: { a: 'left', w: 'up', s: 'down', d: 'right' },
    },
    {
      blocks: [
        { x: 8, y: 6 },
        { x: 9, y: 6 },
      ],
      currentDirection: 'right',
      directionQueue: [],
      id: 'violet',
      status: 'lost',
      keys: {
        arrowup: 'up',
        arrowdown: 'down',
        arrowleft: 'left',
        arrowright: 'right',
      },
    },
  ],
  fruits: [],
};
@Injectable({
  providedIn: 'root',
})
export class SnakeService {
  animationFrameId: number | null = null;
  zone = inject(NgZone);
  private canvasService = inject(CanvasService);
  lastUpdate = 0;
  canvasSettings = this.canvasService.canvasSettings;
  private gameStatus = signal<GameStatus>(initialStatus);
  gamePhase = computed<'play' | 'pause' | 'lost'>(() => {
    const statuses = this.gameStatus().snakes.map((s) => s.status);
    if (statuses.includes('play')) return 'play';
    if (statuses.includes('pause')) return 'pause';
    if (statuses.every((s) => s === 'lost')) return 'lost';
    return 'play';
  });

  initCanvas(canvas: HTMLCanvasElement) {
    this.canvasService.initCanvas(canvas);
  }

  constructor() {}

  resetGame() {
    this.resetStatus();
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }

  playGame() {
    this.gameStatus.update((status) => {
      const snakes = [...status.snakes];
      snakes.forEach((s) => {
        if (s.status === 'pause') {
          s.status = 'play';
        }
      });
      status.snakes = snakes;
      return status;
    });
    this.animationFrameId = requestAnimationFrame((ts) => this.animate(ts));
  }

  initBackground() {
    this.canvasService.drawBackground();
  }

  pauseGame() {
    this.gameStatus.update((status) => {
      const snakes = [...status.snakes];
      snakes.forEach((s) => {
        if (s.status === 'play') {
          s.status = 'pause';
        }
      });
      status.snakes = snakes;
      return status;
    });
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
  }
  resetStatus() {
    this.gameStatus.set(initialStatus);
  }

  animate(timestamp: number) {
    if (timestamp - this.lastUpdate > this.gameStatus().refreshTime) {
      this.lastUpdate = timestamp;
      this.canvasService.draw(this.gameStatus());
      this.updateSnakesStatusPositions();
      this.updateFruitsGameStatus();
    }

    this.zone.runOutsideAngular(() => {
      requestAnimationFrame((ts) => this.animate(ts));
    });
  }
  /**
   * @description updates the snake and checks if it eats the fruit
   */
  updateSnakesStatusPositions() {
    this.gameStatus.update((currentStatus) => {
      const newStatus = { ...currentStatus };
      let fruits = [...currentStatus.fruits];
      newStatus.snakes = newStatus.snakes.map((snake) => {
        if (snake.status !== 'play') return snake;
        const updatedSnake = this.updateSnakeCurrentDirection(snake);
        const fruitEaten = this.checkIfSnakeAteFruit(
          updatedSnake.blocks,
          currentStatus.fruits
        );
        if (fruitEaten) {
          fruits = this.removeFruit(fruitEaten, fruits);
          //dont shift so snake can grow
        } else {
          updatedSnake.blocks.shift();
        }
        //check if snake eats itself
        return {
          ...updatedSnake,
          blocks: this.moveSnake(
            updatedSnake.blocks,
            updatedSnake.currentDirection,
            updatedSnake.status
          ),
        };
      });
      newStatus.fruits = fruits;
      return newStatus;
    });
  }

  enqueueSnakeDirection(
    direction: Direction,
    snakeID: 'blue' | 'red' | 'green' | 'violet'
  ) {
    this.gameStatus.update((status) => {
      const newStatus = { ...status };
      const index = newStatus.snakes.findIndex((s) => s.id === snakeID);
      if (index < 0) {
        return status;
      }
      newStatus.snakes = [...newStatus.snakes];
      newStatus.snakes[index].directionQueue.unshift(direction);
      return newStatus;
    });
  }

  isInvalidDirection(
    nextDirection: Direction,
    currentDirection: Direction
  ): boolean {
    if (
      nextDirection === currentDirection ||
      (nextDirection === 'down' && currentDirection === 'up') ||
      (nextDirection === 'up' && currentDirection === 'down') ||
      (nextDirection === 'left' && currentDirection === 'right') ||
      (nextDirection === 'right' && currentDirection === 'left')
    ) {
      return true;
    }
    return false;
  }

  handleDirectionInput(key: string) {
    const snakeIndex = this.gameStatus().snakes.findIndex(
      (s) => !!s.keys[key.toLowerCase()]
    );

    if (snakeIndex < 0) {
      return;
    }

    const snakeKeys = this.gameStatus().snakes[snakeIndex].keys;
    const nextDirection = snakeKeys[key.toLowerCase()];
    if (
      this.isInvalidDirection(
        nextDirection,
        this.gameStatus().snakes[snakeIndex].currentDirection
      )
    ) {
      return;
    }
    const snakeId = this.gameStatus().snakes[snakeIndex].id;
    this.enqueueSnakeDirection(nextDirection, snakeId);
  }

  /**
   * @description get a direction from a queue and add it to the current direction
   * @param snake
   * @returns
   */
  updateSnakeCurrentDirection(snake: SnakeStatus): SnakeStatus {
    if (snake.directionQueue.length <= 0) {
      return snake;
    }
    const updatedSnake = { ...snake };
    const newDirection = updatedSnake.directionQueue.pop()!;
    updatedSnake.currentDirection = newDirection;
    return updatedSnake;
  }

  moveSnake(
    snake: SnakeBlock[],
    direction: Direction,
    status: 'play' | 'lost' | 'pause'
  ): SnakeBlock[] {
    if (status !== 'play') {
      return snake;
    }
    const [...updatedSnake] = snake;
    switch (direction) {
      case 'up': {
        const nextY =
          snake[snake.length - 1].y === 0
            ? this.canvasSettings.height - 1
            : snake[snake.length - 1].y - 1;
        updatedSnake.push({ x: snake[snake.length - 1].x, y: nextY });

        return updatedSnake;
      }
      case 'down': {
        const nextY =
          snake[snake.length - 1].y === this.canvasSettings.height - 1
            ? 0
            : snake[snake.length - 1].y + 1;
        updatedSnake.push({
          x: updatedSnake[updatedSnake.length - 1].x,
          y: nextY,
        });
        return updatedSnake;
      }
      case 'left': {
        const nextX =
          snake[snake.length - 1].x === 0
            ? this.canvasSettings.width - 1
            : snake[snake.length - 1].x - 1;
        updatedSnake.push({ x: nextX, y: snake[snake.length - 1].y });

        return updatedSnake;
      }
      case 'right': {
        const nextX =
          snake[snake.length - 1].x === this.canvasSettings.width - 1
            ? 0
            : snake[snake.length - 1].x + 1;
        updatedSnake.push({ x: nextX, y: snake[snake.length - 1].y });
        return updatedSnake;
      }

      default:
        return snake;
    }
  }

  checkCollision(x1: number, y1: number, x2: number, y2: number) {
    if (x1 == x2 && y1 === y2) {
      return true;
    }
    return false;
  }

  getRandomBlock() {
    return {
      x: randomInteger(0, this.canvasSettings.width),
      y: randomInteger(0, this.canvasSettings.height),
    };
  }

  createFruit() {
    const MAX_ATTEMPTS = 200;
    let attempt = 0,
      x = -1,
      y = -1;
    if (
      this.canvasSettings.height * this.canvasSettings.width <=
      this.gameStatus().snakes.reduce((prev, s) => s.blocks.length + prev, 0)
    ) {
      //no more space
      return null;
    }
    while (attempt < MAX_ATTEMPTS && x < 0 && y < 0) {
      const block = this.getRandomBlock();
      let foundCollision = false;
      for (let snake of this.gameStatus().snakes) {
        if (this.collisionWithSnake(block, snake.blocks)) {
          foundCollision = true;
          break;
        }
      }
      if (!foundCollision) {
        x = block.x;
        y = block.y;
      }
      attempt++;
    }
    return { x, y };
  }

  collisionWithSnake(block: SnakeBlock, snakeBlocks: SnakeBlock[]) {
    return snakeBlocks.findIndex((b) => b.x == block.x && b.y == block.y) >= 0;
  }

  updateFruitsGameStatus() {
    if (this.gameStatus().fruits.length >= this.gameStatus().maxFruits) {
      return;
    }
    const fruit = this.createFruit();
    if (!fruit) return;
    this.gameStatus.update((status) => {
      status.fruits = [...status.fruits, fruit];
      return status;
    });
  }

  checkIfSnakeAteFruit(snake: SnakeBlock[], fruits: SnakeBlock[]) {
    for (let fruit of fruits) {
      if (this.collisionWithSnake(fruit, snake)) {
        return fruit;
      }
    }
    return null;
  }

  removeFruit(
    fruitToRemove: SnakeBlock,
    currentFruits: SnakeBlock[]
  ): SnakeBlock[] {
    const fruitIndex = currentFruits.findIndex(
      (fruit) => fruit.x === fruitToRemove.x && fruit.y === fruitToRemove.y
    );
    if (fruitIndex < 0) {
      return currentFruits;
    }
    const fruits = [...currentFruits];
    fruits.splice(fruitIndex, 1);

    return fruits;
  }
}

function randomInteger(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}
