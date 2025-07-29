import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StatusDistribution {
  total: number;
  delivered: number;
  inTransit: number;
  pending: number;
  cancelled: number;
}

export interface RecentActivity {
  id: string;
  trackingNumber: string;
  sender?: { firstName: string; lastName: string };
  receiver?: { firstName: string; lastName: string };
  status: string;
  actualDeliveryDate?: string;
  createdAt: string;
}

export interface MonthlyStat {
  month: string;
  parcels: number;
  revenue: number;
}

export interface UserMetrics {
  totalSentParcels: number;
  totalReceivedParcels: number;
  parcelsInTransit: number;
  parcelsPending: number;
  totalSpent: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  statusDistribution: StatusDistribution;
  recentActivity: RecentActivity[];
}

export interface AdminMetrics {
  totalUsers: number;
  totalParcels: number;
  totalRevenue: number;
  parcelsToday: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  monthlyStats: MonthlyStat[];
  recentActivity: RecentActivity[];
  statusDistribution: StatusDistribution;
}

export interface PickupRequestHistory {
  id: string;
  parcelDetails: string;
  pickupLocation: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserMetrics(): Observable<UserMetrics> {
    return this.http.get<UserMetrics>(`${this.apiUrl}/metrics/user`);
  }

  getAdminMetrics(): Observable<AdminMetrics> {
    return this.http.get<AdminMetrics>(`${this.apiUrl}/metrics/admin`);
  }

  getUserPickupHistory(): Observable<PickupRequestHistory[]> {
    return this.http.get<PickupRequestHistory[]>(`${this.apiUrl}/metrics/user/pickup-history`);
  }
} 