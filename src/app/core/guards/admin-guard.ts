import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { AlertService } from '../services/alert.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  const alertService = inject(AlertService);

  if (authService.isLoggedIn()) {
    const userData = authService.getUserData();

    // Check if user has admin role (must be 'ADMIN' in uppercase)
    if (userData && userData.role === 'ADMIN') {
      return true;
    } else {
      // Show alert and redirect to home if not admin
      alertService.warning('Acceso denegado', 'Se requieren privilegios de administrador.');
      router.navigate(['/home']);
      return false;
    }
  } else {
    // Redirect to login if not authenticated
    router.navigate(['/auth/login']);
    return false;
  }
};