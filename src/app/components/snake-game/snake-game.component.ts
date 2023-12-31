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
} from '@angular/core';
import { CommonModule } from '@angular/common';

type Direction = 'up' | 'down' | 'left' | 'right';
type SnakeBlock = { x: number; y: number };
type SnakeStatus = {
  status: 'play' | 'pause' | 'lost';
  directionQueue: Direction[];
  currentDirection: Direction;
  id: 'blue' | 'red';
  blocks: SnakeBlock[];
};
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
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;

  canvasSettings = {
    width: 10,
    height: 10,
    lineColor: 'red',
    snakeColor: 'green',
  };

  gameStatus = signal<{ refreshTime: number; snakes: SnakeStatus[] }>({
    refreshTime: 100,
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
      },
      {
        blocks: [
          { x: 5, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 0 },
          { x: 5, y: 0 },
        ],
        currentDirection: 'up',
        directionQueue: [],
        id: 'blue',
        status: 'play',
      },
    ],
  });

  snake: SnakeBlock[] = [{ x: 0, y: 0 }];

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

  updateSnakesStatusPositions() {
    this.gameStatus.update((currentStatus) => {
      const newStatus = { ...currentStatus };
      newStatus.snakes = newStatus.snakes.map((snake) => {
        const updatedSnake = this.updateSnakeCurrentDirection(snake);

        return {
          ...updatedSnake,
          blocks: this.moveSnake(
            updatedSnake.blocks,
            updatedSnake.currentDirection
          ),
        };
      });
      return newStatus;
    });
  }

  drawSnakes() {
    this.gameStatus().snakes.forEach((s) => this.drawSnake(s.blocks));
  }

  enqueueSnakeDirection(direction: Direction, snakeID: 'blue' | 'red') {
    this.gameStatus.update((status) => {
      const newStatus = { ...status };
      const index = newStatus.snakes.findIndex((s) => s.id === snakeID);
      if (!index) {
        return status;
      }
      newStatus.snakes = [...newStatus.snakes];
      newStatus.snakes[index].directionQueue.unshift(direction);
      return newStatus;
    });
  }

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
    this.context.fillStyle = this.canvasSettings.snakeColor;
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
    // this.drawSnake(this.snake);
  }

  animate(timestamp: number) {
    // console.log(timestamp, this.lastUpdate, this.gameStatus().refreshTime);
    if (timestamp - this.lastUpdate > this.gameStatus().refreshTime) {
      this.lastUpdate = timestamp;
      this.draw();
      this.updateSnakesStatusPositions();
      this.value++;
      this.cdr.detectChanges();
    }

    this.zone.runOutsideAngular(() => {
      requestAnimationFrame((ts) => this.animate(ts));
    });
  }

  moveSnake(snake: SnakeBlock[], direction: Direction): SnakeBlock[] {
    switch (direction) {
      case 'up':
        const [_first, ...updatedSnake] = snake;
        const nextY =
          snake[snake.length - 1].y === 0
            ? this.canvasSettings.height - 1
            : snake[snake.length - 1].y - 1;
        updatedSnake.push({ x: snake[snake.length - 1].x, y: nextY });
        return updatedSnake;

      case 'down':
        return snake;

      case 'left':
        return snake;

      case 'right':
        return snake;

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
}
