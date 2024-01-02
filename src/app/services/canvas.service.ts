import { Injectable } from '@angular/core';
import { GameStatus, SnakeBlock, SnakeStatus } from '../types/Types';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  canvas!:HTMLCanvasElement
  context!:CanvasRenderingContext2D;
  canvasSettings = {
    width: 20,
    height: 20,
    lineColor: 'red',
    snakeColor: 'green',
    fruitColor: 'blue',
  };

  constructor() { }
  initCanvas(canvas:HTMLCanvasElement){
    this.canvas=canvas;
    this.context=this.canvas.getContext('2d')!;
  }

  private canvasInitialized(){
    if(!this.canvas || !this.context){
      throw new Error('canvas not initialized')
    }
  }

  draw(status:GameStatus) {
    this.canvasInitialized();
    this.clearRect();
    this.drawBackground();
    this.drawSnakes(status.snakes);
    this.drawFruit(status.fruits);
  }

  drawSnakes(snakes:SnakeStatus[]) {
    snakes.forEach((s) => this.drawSnake(s.blocks));
  }

  drawFruit(fruits:SnakeBlock[]) {
    fruits.forEach(({ x, y }) =>
      this.drawBlock(x, y, this.canvasSettings.fruitColor)
    );
  }

  private drawBackgroundVerticalLines() {
    
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
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

  private drawBackgroundHorizontalLines() {
    
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
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

  clearRect() {
    this.context.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  private  drawSnake(snake: SnakeBlock[]) {
    snake.forEach(({ x, y }) =>
      this.drawBlock(x, y, this.canvasSettings.snakeColor)
    );
  }

  private   drawBlock(x: number, y: number, color: string) {
    this.context.beginPath();
    const blockWidth =
      this.canvas.width / this.canvasSettings.width;
    const blockHeight =
      this.canvas.height / this.canvasSettings.height;
    this.context.fillStyle = color;
    this.context.fillRect(
      x * blockWidth,
      y * blockHeight,
      blockWidth,
      blockHeight
    );
    this.context.closePath();
  }

}
