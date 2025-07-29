import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackingService, ParcelTracking } from '../../core/services/tracking.service';
import { Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as L from 'leaflet';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.css']
})
export class TrackingComponent implements AfterViewInit, OnDestroy {
  trackingNumber = '';
  trackingData: ParcelTracking | null = null;
  isLoading = false;
  error = '';
  showMap = false;
  isFullscreen = false;
  private map: L.Map | null = null;
  private mapInitialized = false;

  constructor(private trackingService: TrackingService) {}

  ngAfterViewInit() {
    // Initialize map when component is ready
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  initializeMap() {
    if (this.mapInitialized) return;
    
    // Initialize map with Nairobi center
    this.map = this.trackingService.initializeMap('public-tracking-map', [-1.2921, 36.8219], 10);
    this.mapInitialized = true;
  }

  trackParcel() {
    if (!this.trackingNumber.trim()) {
      this.error = 'Please enter a tracking number';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.trackingData = null;

    // For demo purposes, we'll use mock data with Kenyan locations
    // In production, this would call: this.trackingService.getPublicTracking(this.trackingNumber)
    setTimeout(() => {
      this.trackingData = this.trackingService.getMockTrackingData(this.trackingNumber);
      this.isLoading = false;
      this.showMap = true;
      
      // Update map with tracking data
      if (this.map && this.trackingData) {
        setTimeout(() => {
          this.trackingService.updateMapWithTracking(this.trackingData!);
        }, 200);
      }
    }, 1000);
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    
    // Update map size after fullscreen toggle
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        if (this.trackingData) {
          this.trackingService.updateMapWithTracking(this.trackingData);
        }
      }
    }, 100);
  }

  getStatusClass(status: string): string {
    return status?.replace(/\s/g, '').toLowerCase() || '';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return 'Awaiting Pickup';
      case 'PICKED_UP': return 'Picked Up';
      case 'IN_TRANSIT': return 'In Transit';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      default: return status;
    }
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

  clearTracking() {
    this.trackingNumber = '';
    this.trackingData = null;
    this.error = '';
    this.showMap = false;
    this.isFullscreen = false;
    
    // Clear map markers
    if (this.map) {
      this.trackingService.destroyMap();
      this.initializeMap();
    }
  }
} 