import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SnakeService } from 'src/app/services/snake.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  snakeService = inject(SnakeService);
  phase = this.snakeService.gamePhase;
  playGame() {
    this.snakeService.playGame();
  }
  pauseGame() {
    this.snakeService.pauseGame();
  }
  resetGame() {
    this.snakeService.resetGame();
  }
}
