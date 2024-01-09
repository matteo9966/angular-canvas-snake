import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nes-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './nes-button.component.html',
  styleUrl: './nes-button.component.scss',
})
export class NesButtonComponent {
  @Input() color!: 'primary' | 'accent' | 'warn' | 'disabled';
  @Input() type:'button'|'submit'='button';
}
