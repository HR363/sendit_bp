import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PricingRequest {
  categoryId: string;
  weight: number;
  pickupLocation: string;
  destinationLocation: string;
  serviceType: 'Standard' | 'Express' | 'Overnight';
}

export interface PricingResponse {
  basePrice: number;
  weightPrice: number;
  distancePrice: number;
  serviceMultiplier: number;
  totalPrice: number;
  breakdown: {
    category: string;
    weight: number;
    distance: number;
    serviceType: string;
    estimatedDays: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private apiUrl = '/api/pricing';

  constructor(private http: HttpClient) {}

  calculatePricing(request: PricingRequest): Observable<PricingResponse> {
    return this.http.post<PricingResponse>(`${this.apiUrl}/calculate`, request);
  }

  // Helper method to create location JSON from address
  createLocationFromAddress(address: string): string {
    return JSON.stringify({ address });
  }

  // Helper method to create location JSON from coordinates
  createLocationFromCoordinates(latitude: number, longitude: number, address?: string): string {
    return JSON.stringify({ 
      latitude, 
      longitude, 
      address: address || `${latitude}, ${longitude}` 
    });
  }
} 