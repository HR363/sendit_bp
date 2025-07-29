import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ParcelService } from '../../core/services/parcel.service';
import { TrackingService } from '../../core/services/tracking.service';
import { Parcel } from '../../core/services/parcel.service';
import { NgIf, AsyncPipe, DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-parcel-details',
  templateUrl: './details.html',
  styleUrls: ['./details.css'],
  standalone: true,
  imports: [NgIf, AsyncPipe, DatePipe, NgClass, RouterLink]
})
export class ParcelDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  parcelId: string = '';
  parcel$: Observable<Parcel | null> | null = null;
  trackingData: any = null;
  isLiveTracking = false;
  showLiveModal = false;
  map: any = null;
  trackingSubscription: Subscription | null = null;
  liveTrackingSubscription: Subscription | null = null;
  isFullscreen = false;

  constructor(
    private route: ActivatedRoute,
    private parcelService: ParcelService,
    private trackingService: TrackingService
  ) {}

  ngOnInit() {
    this.parcelId = this.route.snapshot.params['id'];
    console.log('Loading parcel with ID:', this.parcelId);
    
    this.parcel$ = this.parcelService.getParcel(this.parcelId);
    
    // Subscribe to parcel data to debug
    this.parcel$.subscribe({
      next: (parcel) => {
        console.log('Parcel data loaded:', parcel);
      },
      error: (error) => {
        console.error('Error loading parcel:', error);
      }
    });
    
    this.loadTrackingData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy() {
    this.stopLiveTracking();
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
    }
    if (this.liveTrackingSubscription) {
      this.liveTrackingSubscription.unsubscribe();
    }
  }

  loadTrackingData() {
    this.trackingData = this.trackingService.getMockTrackingData(this.parcelId);
    this.updateMap();
  }

  initializeMap() {
    this.map = this.trackingService.initializeMap('tracking-map');
    this.updateMap();
  }

  updateMap() {
    if (this.map && this.trackingData) {
      this.trackingService.updateMapWithTracking(this.trackingData);
    }
  }

  openLiveModal() {
    this.showLiveModal = true;
    setTimeout(() => {
      this.trackingService.initializeMap('live-tracking-map');
    }, 100);
  }

  closeLiveModal() {
    this.showLiveModal = false;
  }

  startLiveTracking() {
    this.isLiveTracking = true;
    this.liveTrackingSubscription = this.trackingService.startLiveTracking(this.parcelId).subscribe(data => {
      this.trackingData = data;
      this.updateMap();
    });
  }

  stopLiveTracking() {
    this.isLiveTracking = false;
    if (this.liveTrackingSubscription) {
      this.liveTrackingSubscription.unsubscribe();
    }
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'pending';
    switch (status.toUpperCase()) {
      case 'PENDING': return 'pending';
      case 'PICKED_UP': return 'picked-up';
      case 'IN_TRANSIT': return 'in-transit';
      case 'OUT_FOR_DELIVERY': return 'out-for-delivery';
      case 'DELIVERED': return 'delivered';
      default: return 'pending';
    }
  }

  getStatusText(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'Order Placed';
      case 'PICKED_UP': return 'Picked Up';
      case 'IN_TRANSIT': return 'In Transit';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      default: return status;
    }
  }

  getTrackingStatusText(): string {
    if (!this.trackingData) return 'Loading...';
    return this.getStatusText(this.trackingData.status || 'PENDING');
  }

  getEstimatedTime(): string {
    if (!this.trackingData) return '';
    const estimated = new Date(this.trackingData.estimatedDelivery);
    const now = new Date();
    const diffMs = estimated.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 0) return 'Overdue';
    if (diffHours < 1) return 'Less than 1 hour';
    if (diffHours < 24) return `${diffHours} hours`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days`;
  }

  getTimelineIcon(status: string): string {
    switch (status) {
      case 'PENDING': return 'fa-clipboard-list';
      case 'PICKED_UP': return 'fa-box';
      case 'IN_TRANSIT': return 'fa-truck';
      case 'OUT_FOR_DELIVERY': return 'fa-route';
      case 'DELIVERED': return 'fa-check-circle';
      default: return 'fa-circle';
    }
  }

  downloadTrackingReport() {
    // Implementation for downloading tracking report
    console.log('Downloading tracking report...');
    // In a real implementation, this would generate and download a PDF report
    alert('Tracking report download feature coming soon!');
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }
} 