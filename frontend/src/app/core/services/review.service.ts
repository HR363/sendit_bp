import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  parcelId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateReview {
  rating: number;
  comment?: string;
  parcelId: string;
}

export interface UpdateReview {
  rating?: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  createReview(data: CreateReview): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, data);
  }

  getReviewsForParcel(parcelId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/parcel/${parcelId}`);
  }

  updateReview(id: string, data: UpdateReview): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${id}`, data);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Admin endpoints
  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/admin/reviews`);
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/admin/reviews/${id}`);
  }
}
