import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs/operators';
import { User } from 'firebase/auth';

// Protects routes that require authentication.
// Redirects unauthenticated users to the Login page.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    // Wait until Firebase has resolved the initial auth state
    filter((user): user is User | null => user !== undefined),
    take(1),
    map((user) => {
      if (user) return true;
      return router.createUrlTree(['/']);
    })
  );
};
