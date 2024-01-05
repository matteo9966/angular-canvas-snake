import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  signal,
  AfterViewInit,
  inject,
  EventEmitter,
  Output,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { takeUntil, Subject } from 'rxjs';
import { MatSliderModule } from '@angular/material/slider';
import { SnakeService } from 'src/app/services/snake.service';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { MatButtonModule } from '@angular/material/button';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { ThemifyService } from 'src/app/services/themify.service';
import { Theme } from '../types/themes';
type SettingsForm = {
  speed: number;
  snakeColors: Record<string, string>;
  size: number;
  maxFruits: number;
};

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [
    FormsModule,
    MatSliderModule,
    ColorPickerComponent,
    MatButtonModule,
    ThemeSelectorComponent,
  ],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss',
})
export class SettingsFormComponent implements OnInit, OnDestroy, AfterViewInit {
  snakeService = inject(SnakeService);
  themifyService = inject(ThemifyService);
  maxSpeed = this.snakeService.maxSpeed;
  snakes = this.snakeService.snakes;
  gameSizes = this.snakeService.gameMinMaxSize;
  gameSize = this.snakeService.gameSize;
  maxFruits = this.snakeService.maxFruits;
  speed = this.snakeService.speed;

  @Output() clickedAction = new EventEmitter<boolean>();

  ngAfterViewInit(): void {
    this.form!.valueChanges!.subscribe((value) => {
      console.log(value);
      this.formValue.set(value);
    });
  }
  destroy$$ = new Subject();
  formValue = signal<SettingsForm>({
    speed: 5,
    snakeColors: {},
    size: 0,
    maxFruits: 0,
  });
  ngOnDestroy(): void {
    this.destroy$$.next(null);
  }
  @ViewChild('form', { static: true, read: NgForm }) form!: NgForm;

  ngOnInit() {
    this.form.form.patchValue(
      {
        speed: 10,
        snakeColors: { blue: 'blue', violet: 'violet' },
      },
      { emitEvent: true }
    );
  }

  save() {
    this.updateGameSpeed();
    this.updateSnakeColors();
    this.updateMaxFruits();
    this.updateGameSize();
    this.clickedAction.emit(true);
  }

  cancel() {
    console.log('cancel');
    this.clickedAction.emit(true);
  }

  updateGameSpeed() {
    this.snakeService.updateGameSpeed(this.formValue().speed);
  }
  updateSnakeColors() {
    this.snakeService.updateSnakeColors(this.formValue().snakeColors);
  }

  updateFruitColor() {}

  updateMaxFruits() {
    this.snakeService.updateMaxfruits(this.formValue().maxFruits);
  }

  updateGameSize() {
    this.snakeService.updateGameSize(this.formValue().size);
  }

  get snakeIds() {
    return this.snakes.map((s) => s.id);
  }

  get snakeIdsAndColors() {
    return this.snakes.map((s) => ({ id: s.id, color: s.color }));
  }

  get themeList() {
    return this.themifyService.themes;
  }
  get selectedTheme() {
    return this.themifyService.selectedTheme;
  }
  selectTheme(theme: Theme) {
    this.themifyService.selectTheme(theme.label);
  }
}
