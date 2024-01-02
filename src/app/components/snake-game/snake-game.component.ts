import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  signal,
  NgZone,
  inject,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type Direction = 'up' | 'down' | 'left' | 'right';
type SnakeBlock = { x: number; y: number };
type SnakeStatus = {
  status: 'play' | 'pause' | 'lost';
  directionQueue: Direction[];
  currentDirection: Direction;
  id: 'blue' | 'red' | 'green' | 'violet';
  blocks: SnakeBlock[];
  keys: Record<string, Direction>;
};

function randomInteger(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}
@Component({
  selector: 'app-snake-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss'],
})
export class SnakeGameComponent implements AfterViewInit, OnInit {
  zone = inject(NgZone);
  cdr = inject(ChangeDetectorRef);
  value = 0;
  ngOnInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.canvas.nativeElement.width = 800;
    this.canvas.nativeElement.height = 800;
    // this.draw();
    requestAnimationFrame((ts) => this.animate(ts));
  }

  ngAfterViewInit(): void {}

  @HostListener('window:keydown', ['$event.key'])
  keyDown(eventKey: string) {
    this.handleDirectionInput(eventKey);
  }

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;

  canvasSettings = {
    width: 20,
    height: 20,
    lineColor: 'red',
    snakeColor: 'green',
    fruitColor: 'blue',
  };

  gameStatus = signal<{
    refreshTime: number;
    snakes: SnakeStatus[];
    fruits: { x: number; y: number }[];
    maxFruits: number;
  }>({
    refreshTime: 50,
    maxFruits: 2,
    snakes: [
      {
        blocks: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
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
          { x: 8, y: 7 },
          { x: 8, y: 8 },
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
  });

  drawBackgroundVerticalLines() {
    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    const squareWidth = canvasWidth / this.canvasSettings.width;
    for (let i = 1; i < this.canvasSettings.width; i++) {
      this.context.beginPath();
      this.context.strokeStyle = this.canvasSettings.lineColor;
      this.context.moveTo(i * squareWidth, 0);
      this.context.lineTo(i * squareWidth, canvasHeight);
      this.context.stroke();
      this.context.closePath();
    }
  }
  drawBackgroundHorizontalLines() {
    const canvasWidth = this.canvas.nativeElement.width;
    const canvasHeight = this.canvas.nativeElement.height;
    const squareHeight = canvasHeight / this.canvasSettings.height;
    for (let i = 1; i < this.canvasSettings.height; i++) {
      this.context.beginPath();
      this.context.strokeStyle = this.canvasSettings.lineColor;
      this.context.moveTo(0, i * squareHeight);
      this.context.lineTo(canvasWidth, i * squareHeight);
      this.context.stroke();
      this.context.closePath();
    }
  }

  drawBackground() {
    this.drawBackgroundVerticalLines();
    this.drawBackgroundHorizontalLines();
  }

  drawSnake(snake: SnakeBlock[]) {
    snake.forEach(({ x, y }) =>
      this.drawBlock(x, y, this.canvasSettings.snakeColor)
    );
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

  drawSnakes() {
    this.gameStatus().snakes.forEach((s) => this.drawSnake(s.blocks));
  }

  drawFruit() {
    this.gameStatus().fruits.forEach(({ x, y }) =>
      this.drawBlock(x, y, this.canvasSettings.fruitColor)
    );
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

  drawBlock(x: number, y: number, color: string) {
    this.context.beginPath();
    const blockWidth =
      this.canvas.nativeElement.width / this.canvasSettings.width;
    const blockHeight =
      this.canvas.nativeElement.height / this.canvasSettings.height;
    this.context.fillStyle = color;
    this.context.fillRect(
      x * blockWidth,
      y * blockHeight,
      blockWidth,
      blockHeight
    );
    this.context.closePath();
  }

  lastUpdate = 0;
  draw() {
    this.clearRect();
    this.drawBackground();
    this.drawSnakes();
    this.drawFruit();
  }

  animate(timestamp: number) {
    if (timestamp - this.lastUpdate > this.gameStatus().refreshTime) {
      this.lastUpdate = timestamp;
      this.draw();
      this.updateSnakesStatusPositions();
      this.updateFruitsGameStatus();
      this.value++;
    }

    this.zone.runOutsideAngular(() => {
      requestAnimationFrame((ts) => this.animate(ts));
    });
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

  clearRect() {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  log() {
    console.log('change detection');
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

  //if snake ate fruit then eati
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

  initializeGame() {
    //update the gameStatus with new keys
  }
}
