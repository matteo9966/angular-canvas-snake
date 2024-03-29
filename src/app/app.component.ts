import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SnakeGameComponent } from './components/snake-game/snake-game.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SettingsFormComponent } from './components/settings-form/settings-form.component';
import { ThemeSelectorComponent } from './components/theme-selector/theme-selector.component';
import { ScoreBoardComponent } from './components/score-board/score-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SnakeGameComponent,
    NavbarComponent,
    SettingsFormComponent,
    ThemeSelectorComponent,
    ScoreBoardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'canvas-snake';
}
