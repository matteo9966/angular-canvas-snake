import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'game',
    loadComponent: () =>
      import('./components/snake-game/snake-game.component').then(
        (c) => c.SnakeGameComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
