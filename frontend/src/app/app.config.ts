import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

// Functional interceptor for JWT
const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Access token directly from localStorage to avoid circular dependency
  const token = localStorage.getItem('accessToken');

  console.log('Functional JWT Interceptor - URL:', req.url, 'Token:', token ? 'Present' : 'Missing');

  // Do not attach token to auth endpoints
  if (token && !req.url.includes('/auth/')) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    console.log('Functional JWT Interceptor - Adding Authorization header');
    return next(cloned);
  }

  console.log('Functional JWT Interceptor - No token added');
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor])
    ),
    provideAnimations()
  ]
};
