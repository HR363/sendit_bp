import { Component, OnInit, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MetricsService, UserMetrics, RecentActivity, StatusDistribution, PickupRequestHistory } from '../../core/services/metrics.service';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './metrics.html',
  styleUrls: ['./metrics.css']
})
export class Metrics implements OnInit {
  metrics = signal<UserMetrics | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  pickupHistory = signal<PickupRequestHistory[] | null>(null);

  constructor(private metricsService: MetricsService) {}

  ngOnInit() {
    this.loadMetrics();
    this.loadPickupHistory();
  }

  loadMetrics() {
    this.loading.set(true);
    this.error.set(null);

    this.metricsService.getUserMetrics().subscribe({
      next: (data: UserMetrics) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load metrics data');
        this.loading.set(false);
        console.error('Error loading metrics:', err);
      }
    });
  }

  loadPickupHistory() {
    this.metricsService.getUserPickupHistory().subscribe({
      next: (data: PickupRequestHistory[]) => {
        this.pickupHistory.set(data);
      },
      error: (err: any) => {
        console.error('Error loading pickup history:', err);
      }
    });
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'fa-circle-check';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 'fa-truck-fast';
      case 'PENDING':
      case 'PICKED_UP':
        return 'fa-clock';
      case 'CANCELLED':
        return 'fa-circle-xmark';
      default:
        return 'fa-circle';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'delivered';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 'in-transit';
      case 'PENDING':
      case 'PICKED_UP':
        return 'pending';
      case 'CANCELLED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  calculateChartData(distribution: StatusDistribution) {
    const total = distribution.total;
    if (total === 0) return { delivered: 0, inTransit: 0, pending: 0, cancelled: 0 };

    return {
      delivered: (distribution.delivered / total) * 100,
      inTransit: (distribution.inTransit / total) * 100,
      pending: (distribution.pending / total) * 100,
      cancelled: (distribution.cancelled / total) * 100
    };
  }
}