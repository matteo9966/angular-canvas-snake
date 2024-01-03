import { Component, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: ColorPickerComponent,
    },
  ],
})
export class ColorPickerComponent implements ControlValueAccessor {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;
  change(val: any) {}
  onTouched(val: any) {}
  disabled = false;
  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.initColorPicker();
  }

  writeValue(obj: any): void {
    throw new Error('Method not implemented.');
  }
  registerOnChange(fn: any): void {
    this.change = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  initColorPicker() {
    let gradient = this.context.createLinearGradient(
      0,
      0,
      this.canvas.nativeElement.width,
      0
    );
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(1 / 6, '#ffff00');
    gradient.addColorStop((1 / 6) * 2, '#00ff00');
    gradient.addColorStop((1 / 6) * 3, '#00ffff');
    gradient.addColorStop((1 / 6) * 4, '#0000ff');
    gradient.addColorStop((1 / 6) * 5, '#ff00ff');
    gradient.addColorStop(1, '#ff0000');
    this.context.fillStyle = gradient;
    this.context.fillRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    gradient = this.context.createLinearGradient(
      0,
      0,
      0,
      this.canvas.nativeElement.height
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.context.fillStyle = gradient;
    this.context.fillRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );

    gradient = this.context.createLinearGradient(
      0,
      0,
      0,
      this.canvas.nativeElement.height
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
    this.context.fillStyle = gradient;
    this.context.fillRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }

  onCanvasClick(e: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log({
      width: this.canvas.nativeElement.width,
      clientWidth: this.canvas.nativeElement.clientWidth,
      x,
      y,
      offsetX: e.offsetX,
      offsetY: e.offsetY,
    });

    const normalizedX =
      (x / this.canvas.nativeElement.clientWidth) *
      this.canvas.nativeElement.width;
    const normalizedY =
      (y / this.canvas.nativeElement.clientHeight) *
      this.canvas.nativeElement.height;
    const imgData = this.context.getImageData(normalizedX, normalizedY, 1, 1);
    this.drawCircle(normalizedX, normalizedY);
    console.log(
      `rgba(${imgData.data[0]}, ${imgData.data[1]}, ${imgData.data[2]}, ${imgData.data[3]})`
    );
  }

 

  drawCircle(x: number, y: number) {
    this.clearRect();
    this.context.beginPath();
    this.context.fillStyle = 'black';
    this.context.arc(x, y, 5, 0, 2 * Math.PI);
    this.context.fill();
    this.context.closePath();
  }
  clearRect() {
    this.context.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
  }
}
