import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Theme } from '../components/types/themes';

@Injectable({
  providedIn: 'root',
})
export class ThemifyService {
  document = inject(DOCUMENT);
  defaultTheme = {
    label: 'Default',
    classname: 'dark',
    primary: 'black',
    accent: 'black',
  };
  selectedTheme = this.defaultTheme;
  themes: Theme[] = [
    this.defaultTheme,
    { label: 'Dark', classname: 'dark', primary: 'black', accent: 'white' },
    { label: 'Fem', classname: 'femm', primary: '#e79e9e', accent: '#872348' },
    { label: 'Kawa', classname: 'kawa', primary: '#2ace3b', accent: 'blue' },
  ];

  constructor() {}

  selectTheme(themelabel: string) {
    if (themelabel === 'Default') {
      this.removeAllThemeClassesFromBody();
      this.selectedTheme = this.defaultTheme;
      return;
    }
    const themeIndex = this.themes.findIndex((t) => t.label === themelabel);
    if (themeIndex >= 0) {
      this.removeAllThemeClassesFromBody();
      this.addClassToBody(this.themes[themeIndex].classname);
      this.selectedTheme = this.themes[themeIndex];
    }
  }

  removeAllThemeClassesFromBody() {
    this.themes.forEach(({ label, classname }) => {
      this.document.body.classList.remove(classname);
    });
  }
  addClassToBody(classname: string) {
    this.document.body.classList.add(classname);
  }
}
