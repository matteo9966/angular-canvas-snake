import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SnakeService } from 'src/app/services/snake.service';
import { DialogModule, Dialog } from '@angular/cdk/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { NesButtonComponent } from '../nes-button/nes-button.component';
import { GamePhase } from 'src/app/types/Types';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    DialogModule,
    ThemeSelectorComponent,
    NesButtonComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  snakeService = inject(SnakeService);
  phase = this.snakeService.gamePhase;
  dialog = inject(Dialog);
  buttonLabel = computed(() => {
    const phase = this.phase();
    switch (phase) {
      case 'lost':
        return 'REPLAY';
      case 'pause':
        return 'RESUME';
      case 'play':
        return 'PAUSE';
      case 'start':
        return 'PLAY';

      default:
        return 'PLAY';
    }
  });

  clickOnPlayPauseBtn(phase: GamePhase) {
    if (phase == 'lost') {
      this.resetGame();
      return;
    }
    if (phase == 'pause' || phase == 'start') {
      this.playGame();
      return
    }
    if (phase == 'play') {
      this.pauseGame();
      return
    }
   
  }

  private playGame() {
    this.snakeService.playGame();
  }
  private pauseGame() {
    this.snakeService.pauseGame();
  }
  private resetGame() {
    this.snakeService.resetGame();
  }
  openSettings() {
    this.dialog.open(SettingsDialogComponent, {
      width: '90vw',
      height: '90vh',
    });
  }
}
