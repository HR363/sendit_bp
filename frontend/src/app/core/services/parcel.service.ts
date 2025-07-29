import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  address: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Parcel {
  id: string;
  trackingNumber: string;
  senderId: string;
  receiverId: string;
  categoryId: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  pickupLocation: Location;
  destinationLocation: Location;
  weight: number;
  description?: string;
  status: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  price: number;
  courierId?: string;
  deliveryImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  courier?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateParcel {
  senderId?: string;
  receiverId?: string;
  categoryId?: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  pickupLocation: string; // JSON string
  destinationLocation: string; // JSON string
  weight: number;
  description?: string;
  status: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  price?: number; // Made optional since it's calculated dynamically
  serviceType?: 'Standard' | 'Express' | 'Overnight';
}

export interface UpdateParcel {
  senderName?: string;
  senderPhone?: string;
  senderEmail?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  pickupLocation?: string;
  destinationLocation?: string;
  weight?: number;
  description?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  price?: number;
}

export interface AssignCourier {
  courierId: string;
}

export interface UpdateParcelStatus {
  status: string;
  deliveryImageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ParcelService {
  private apiUrl = '/api/parcels';

  constructor(private http: HttpClient) {}

  // Get sent parcels for current user
  getSentParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/sent`);
  }

  // Get received parcels for current user
  getReceivedParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/received`);
  }

  // Get parcels assigned to current courier
  getAssignedParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/assigned`);
  }

  // Get all parcels (Admin only)
  getAllParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/admin/all`);
  }

  // Get parcel by ID
  getParcel(id: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.apiUrl}/${id}`);
  }

  // Get parcel status history
  getParcelStatusHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`);
  }

  // Create new parcel (Admin/Courier only)
  createParcel(data: CreateParcel): Observable<Parcel> {
    return this.http.post<Parcel>(this.apiUrl, data);
  }

  // Update parcel (Admin/Courier only)
  updateParcel(id: string, data: UpdateParcel): Observable<Parcel> {
    return this.http.put<Parcel>(`${this.apiUrl}/${id}`, data);
  }

  // Assign courier to parcel (Admin only)
  assignCourier(id: string, data: AssignCourier): Observable<Parcel> {
    return this.http.put<Parcel>(`${this.apiUrl}/${id}/assign`, data);
  }

  // Update parcel status (Admin/Courier only)
  updateParcelStatus(id: string, data: UpdateParcelStatus): Observable<Parcel> {
    return this.http.put<Parcel>(`${this.apiUrl}/${id}/status`, data);
  }

  // Soft delete parcel (Admin/Courier only)
  deleteParcel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
