import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SnakeService } from 'src/app/services/snake.service';
import { DialogModule, Dialog } from '@angular/cdk/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    DialogModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  snakeService = inject(SnakeService);
  phase = this.snakeService.gamePhase;
  dialog = inject(Dialog);

  playGame() {
    this.snakeService.playGame();
  }
  pauseGame() {
    this.snakeService.pauseGame();
  }
  resetGame() {
    this.snakeService.resetGame();
  }
  openSettings() {
    this.dialog.open(SettingsDialogComponent, {
      width: '90vw',
      height: '90vh',
    });
  }
}
