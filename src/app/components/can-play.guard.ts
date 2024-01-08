import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SnakeService } from '../services/snake.service';

export const canPlayGuard: CanActivateFn = (route, state) => {
  const snakeService = inject(SnakeService);
  const router = inject(Router);
  if (snakeService.playersSelected()) {
    return true;
  } else {
    return router.createUrlTree(['/']);
  }
};
