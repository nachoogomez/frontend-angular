import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirect to login page
    router.navigate(['/auth/login']);
    return false;
  }
};
