import {
  Component,
  ViewChild,
  OnInit,
  OnDestroy,
  signal,
  Signal,
  AfterViewInit,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { takeUntil, Subject } from 'rxjs';
import { MatSliderModule } from '@angular/material/slider';
import { SnakeService } from 'src/app/services/snake.service';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
type SettingsForm = {
  speed: number;
  snakeColors: Record<string, string>;
  size: number;
};

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [FormsModule, MatSliderModule, ColorPickerComponent],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss',
})
export class SettingsFormComponent implements OnInit, OnDestroy, AfterViewInit {
  snakeService = inject(SnakeService);
  maxSpeed = this.snakeService.maxSpeed;
  snakes = this.snakeService.snakes;
  gameSizes = this.snakeService.gameMinMaxSize;
  gameSize = this.snakeService.gameSize;
  

  ngAfterViewInit(): void {
    this.form!.valueChanges!.subscribe((value) => {
      console.log(value);
      this.formValue.set(value);
    });
  }
  destroy$$ = new Subject();
  formValue = signal<SettingsForm>({ speed: 5, snakeColors: {}, size: 0 });
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
    // this.updateGameSize();
  }

  updateGameSpeed() {
    this.snakeService.updateGameSpeed(this.formValue().speed);
  }
  updateSnakeColors() {
    this.snakeService.updateSnakeColors(this.formValue().snakeColors);
  }

  updateFruitColor() {}

  updateGameSize() {
    this.snakeService.updateGameSize(this.formValue().size);
  }

  get snakeIds() {
    return this.snakes.map((s) => s.id);
  }

  get snakeIdsAndColors() {
    return this.snakes.map((s) => ({ id: s.id, color: s.color }));
  }
}
