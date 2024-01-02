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
type SettingsForm = { speed: number };

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [FormsModule, MatSliderModule],
  templateUrl: './settings-form.component.html',
  styleUrl: './settings-form.component.scss',
})
export class SettingsFormComponent implements OnInit, OnDestroy, AfterViewInit {
  snakeService = inject(SnakeService);
  maxSpeed = this.snakeService.maxSpeed;
  ngAfterViewInit(): void {
    this.form!.valueChanges!.subscribe((value) => {
      console.log(value);
      this.formValue.set(value);
    });
  }
  destroy$$ = new Subject();
  formValue = signal<SettingsForm>({ speed: 0 });
  ngOnDestroy(): void {
    this.destroy$$.next(null);
  }
  @ViewChild('form', { static: true, read: NgForm }) form!: NgForm;

  ngOnInit() {}

  save() {
    this.updateGameSpeed();
  }

  updateGameSpeed() {
    this.snakeService.updateGameSpeed(this.formValue().speed);
  }

}
