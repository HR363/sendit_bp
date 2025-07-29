import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PickupRequest {
  id: string;
  parcelDetails: string;
  pickupLocation: string;
  status: string;
  createdAt: string;
  requesterId: string;
  assignedCourierId?: string;
  completedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PickupRequestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPendingPickupRequests(): Observable<PickupRequest[]> {
    return this.http.get<PickupRequest[]>(`${this.apiUrl}/pickup-requests/pending`);
  }

  markPickupRequestCompleted(id: string) {
    return this.http.patch(`${this.apiUrl}/pickup-requests/${id}/complete`, {});
  }

  createPickupRequest(dto: { parcelDetails: string; pickupLocation: string }) {
    return this.http.post(`${this.apiUrl}/pickup-requests`, dto);
  }
} 