import { Injectable } from '@angular/core';
import { GameStatus, SnakeBlock, SnakeStatus } from '../types/Types';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  canvasSettings = {
    width: 20,
    height: 20,
    lineColor: '#e1e1e1',
    snakeColor: 'green',
    fruitColor: 'blue',
    lineWidth:0.3
  };

  constructor() {
    this.initAppleImage();
  }

  imageURL = 'assets/images/apple.svg';
  appleImage = new Image();

  initAppleImage() {
    this.appleImage.src = this.imageURL;
    this.appleImage.onload = () => {
      console.log('image loaded');
    };
  }

  initCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d')!;
  }

  private canvasInitialized() {
    if (!this.canvas || !this.context) {
      throw new Error('canvas not initialized');
    }
  }

  draw(status: GameStatus) {
    this.canvasInitialized();
    this.clearRect();
    this.drawBackground(status);
    this.drawFruit(status.fruits);
    this.drawSnakes(status.snakes);
  }

  drawSnakes(snakes: SnakeStatus[]) {
    snakes.forEach((s) => this.drawSnake(s));
  }

  drawFruit(fruits: SnakeBlock[]) {
    fruits.forEach(({ x, y }) => {
      const blockWidth = this.canvas.width / this.canvasSettings.width;
      const blockHeight = this.canvas.height / this.canvasSettings.height;
      this.context.drawImage(
        this.appleImage,
        x * blockWidth,
        y * blockHeight,
        blockWidth,
        blockHeight
      );
      // this.drawBlock(x, y, this.canvasSettings.fruitColor);
    });
  }

  private drawBackgroundVerticalLines(status: GameStatus) {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const squareWidth = canvasWidth / this.canvasSettings.width;
    for (let i = 1; i < this.canvasSettings.width; i++) {
      this.context.beginPath();
      this.context.lineWidth=this.canvasSettings.lineWidth;
      this.context.strokeStyle = this.canvasSettings.lineColor;
      this.context.moveTo(i * squareWidth, 0);
      this.context.lineTo(i * squareWidth, canvasHeight);
      this.context.stroke();
      this.context.closePath();
    }
  }

  private drawBackgroundHorizontalLines(status: GameStatus) {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const squareHeight = canvasHeight / this.canvasSettings.height;
    for (let i = 1; i < this.canvasSettings.height; i++) {
      this.context.beginPath();
      this.context.lineWidth=this.canvasSettings.lineWidth;
      this.context.strokeStyle = this.canvasSettings.lineColor;
      this.context.moveTo(0, i * squareHeight);
      this.context.lineTo(canvasWidth, i * squareHeight);
      this.context.stroke();
      this.context.closePath();
    }
  }

  drawBackground(status: GameStatus) {
    this.drawBackgroundVerticalLines(status);
    this.drawBackgroundHorizontalLines(status);
  }

  clearRect() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawSnake(snake: SnakeStatus) {
    snake.blocks.forEach(({ x, y }) =>
      this.drawBlock(x, y, snake.color || 'green')
    );
  }

  private drawBlock(x: number, y: number, color: string) {
    this.context.beginPath();
    const blockWidth = this.canvas.width / this.canvasSettings.width;
    const blockHeight = this.canvas.height / this.canvasSettings.height;
    this.context.fillStyle = color;
    this.context.fillRect(
      x * blockWidth,
      y * blockHeight,
      blockWidth,
      blockHeight
    );
    this.context.closePath();
  }

  updateSettings(size: number) {
    this.canvasSettings.height = size;
    this.canvasSettings.width = size;
  }
}
