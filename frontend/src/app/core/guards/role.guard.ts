import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../../features/dashboard/profile/user.service';
import { map } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[];
  return userService.getProfile().pipe(
    map(user => {
      if (user && allowedRoles.includes(user.role)) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
