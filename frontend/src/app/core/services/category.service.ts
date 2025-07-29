import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  description?: string;
  minWeight: number;
  maxWeight: number;
  pricePerKg: number;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategory {
  name: string;
  description?: string;
  minWeight: number;
  maxWeight: number;
  pricePerKg: number;
  basePrice: number;
}

export interface UpdateCategory {
  name?: string;
  description?: string;
  minWeight?: number;
  maxWeight?: number;
  pricePerKg?: number;
  basePrice?: number;
}

export interface CategoryPricing {
  categoryId: string;
  weight: number;
  totalPrice: number;
  basePrice: number;
  weightPrice: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  // Public endpoints
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getCategoryPricing(id: string, weight: number): Observable<CategoryPricing> {
    return this.http.get<CategoryPricing>(`${this.apiUrl}/${id}/pricing?weight=${weight}`);
  }

  // Admin endpoints
  createCategory(data: CreateCategory): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/admin/categories`, data);
  }

  updateCategory(id: string, data: UpdateCategory): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/admin/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/categories/${id}`);
  }
}
