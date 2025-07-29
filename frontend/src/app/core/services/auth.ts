import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthTokenResponse, RegisterResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000'; // Updated to direct backend URL
  private readonly TOKEN_KEY = 'sendit_token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>(`${this.API_URL}/auth/login`, { email, password }).pipe(
      tap(res => this.setToken(res.access_token))
    );
  }

  register(data: { email: string; password: string; firstName: string; lastName: string; phone: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/profile`);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
}
