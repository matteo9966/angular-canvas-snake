import { Component, inject } from '@angular/core';
import { NesButtonComponent } from '../nes-button/nes-button.component';
import { SnakeService } from 'src/app/services/snake.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NesButtonComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  snakeService = inject(SnakeService);
  router = inject(Router);
  onClickChoosePlayers(p: 1 | 2) {
    this.snakeService.selectPlayers(p);
    this.router.navigateByUrl('/game');
  }
}
