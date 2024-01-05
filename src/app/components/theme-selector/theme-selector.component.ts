import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Theme } from '../types/themes';
import { NgTemplateOutlet } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [NgTemplateOutlet, MatSelectModule, MatFormFieldModule, FormsModule],
  templateUrl: './theme-selector.component.html',
  styleUrl: './theme-selector.component.scss',
})
export class ThemeSelectorComponent {
  @Input() themeList: Theme[] = [
    {
      label: 'Default',
      classname: 'default',
      primary: 'black',
      accent: 'white',
    },
    {
      label: 'Alternative',
      classname: 'dark',
      primary: 'red',
      accent: 'blue',
    },
    {
      label: 'Chaos',
      classname: 'dark',
      primary: 'yellow',
      accent: 'green',
    },
  ];

  @Output() selected: EventEmitter<Theme> = new EventEmitter();
  @Input() selectedTheme!:Theme;
  selectionChange(args: MatSelectChange) {
    this.selected.emit(args.value);
  }
}
