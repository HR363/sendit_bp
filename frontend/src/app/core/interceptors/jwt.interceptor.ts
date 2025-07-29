import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    console.log('JWT Interceptor - URL:', req.url, 'Token:', token ? 'Present' : 'Missing');

    // Do not attach token to auth endpoints
    if (token && !req.url.includes('/auth/')) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      console.log('JWT Interceptor - Adding Authorization header');
      return next.handle(cloned);
    }
    console.log('JWT Interceptor - No token added');
    return next.handle(req);
  }
} 