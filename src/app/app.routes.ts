import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { canPlayGuard } from './components/can-play.guard';

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
    canActivate: [canPlayGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
