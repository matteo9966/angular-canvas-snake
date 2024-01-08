import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  NgZone,
  inject,
  HostListener,
  signal,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnakeService } from 'src/app/services/snake.service';
import { ScoreBoardComponent } from '../score-board/score-board.component';

@Component({
  selector: 'app-snake-game',
  standalone: true,
  imports: [CommonModule, ScoreBoardComponent],
  templateUrl: './snake-game.component.html',
  styleUrls: ['./snake-game.component.scss'],
})
export class SnakeGameComponent implements OnInit {
  zone = inject(NgZone);
  snakeService = inject(SnakeService);
  value = 0;
  snakes = this.snakeService.snakes;
  cdr = inject(ChangeDetectorRef);
  snakeScores = computed(() =>
    this.snakes().map((S) => ({ name: S.id, points: S.points }))
  );
  ngOnInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.canvas.nativeElement.width = 800;
    this.canvas.nativeElement.height = 800;
    this.snakeService.initCanvas(this.canvas.nativeElement);
    this.snakeService.initBackground();
    this.snakeService.gameComponentDetectionRef = this.cdr;
  }

  

  @HostListener('window:keydown', ['$event.key'])
  keyDown(eventKey: string) {
    this.snakeService.handleDirectionInput(eventKey);
  }

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;
}
