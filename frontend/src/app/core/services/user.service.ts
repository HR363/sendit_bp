import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface UpdateUserStatus {
  isActive?: boolean;
  role?: 'USER' | 'ADMIN' | 'COURIER_AGENT';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: UpdateUserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/change-password`, data);
  }

  // Admin endpoints
  listUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/admin/users`);
  }

  updateUserStatus(userId: string, data: UpdateUserStatus): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/admin/users/${userId}/status`, data);
  }

  updateUserRole(userId: string, role: 'USER' | 'ADMIN' | 'COURIER_AGENT'): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/admin/users/${userId}/status`, { role });
  }
}
