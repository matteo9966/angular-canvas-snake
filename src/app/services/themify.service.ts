import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
type Theme = { label: string; classname: string };
@Injectable({
  providedIn: 'root',
})
export class ThemifyService {
  document = inject(DOCUMENT);
  themes = [{ label: 'Dark Theme', classname: 'dark' }];
  constructor() {}

  selectTheme(themelabel: string) {
    const themeIndex = this.themes.findIndex((t) => t.label === themelabel);
    if (themeIndex >= 0) {
      this.removeAllThemeClassesFromBody();
      this.addClassToBody(this.themes[themeIndex].classname);
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
