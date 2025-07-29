import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import * as L from 'leaflet';

export interface TrackingLocation {
  lat: number;
  lng: number;
  timestamp: string;
  status: string;
  address?: string;
}

export interface ParcelTracking {
  parcelId: string;
  trackingNumber: string;
  currentLocation: TrackingLocation;
  pickupLocation: TrackingLocation;
  destinationLocation: TrackingLocation;
  status: string;
  estimatedDelivery: string;
  courierLocation?: TrackingLocation;
  statusHistory?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private apiUrl = '/api/tracking';
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private routeLine: L.Polyline | null = null;
  private trackingSubject = new BehaviorSubject<ParcelTracking | null>(null);

  constructor(private http: HttpClient) {}

  // Initialize map with better configuration
  initializeMap(containerId: string, center: [number, number] = [-1.2921, 36.8219], zoom: number = 12): L.Map {
    // Clear existing map
    if (this.map) {
      this.map.remove();
    }

    // Create new map with better tile provider
    this.map = L.map(containerId, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      worldCopyJump: true,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0
    });

    // Add multiple tile layers for better coverage
    const osmTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 8,
      subdomains: 'abc',
      updateWhenIdle: true,
      updateWhenZooming: false
    });

    const cartoTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB',
      maxZoom: 18,
      minZoom: 8,
      subdomains: 'abcd'
    });

    // Add the primary tile layer
    osmTiles.addTo(this.map);

    // Add scale control
    L.control.scale({
      imperial: false,
      metric: true,
      position: 'bottomleft',
      maxWidth: 200
    }).addTo(this.map);

    // Force a map refresh after a short delay
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.map.setView(center, zoom);
      }
    }, 100);

    return this.map;
  }

  // Get parcel tracking data
  getParcelTracking(parcelId: string): Observable<ParcelTracking> {
    return this.http.get<ParcelTracking>(`${this.apiUrl}/${parcelId}`);
  }

  // Start live tracking with polling
  startLiveTracking(parcelId: string, intervalMs: number = 30000): Observable<ParcelTracking> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getParcelTracking(parcelId))
    );
  }

  // Update map with tracking data
  updateMapWithTracking(tracking: ParcelTracking): void {
    if (!this.map) return;

    // Clear existing markers and route
    this.clearMap();

    // Add pickup location marker
    const pickupMarker = L.marker([tracking.pickupLocation.lat, tracking.pickupLocation.lng], {
      icon: this.createCustomIcon('pickup', 'Pickup Location')
    }).addTo(this.map!);
    
    // Add popup for pickup location
    pickupMarker.bindPopup(`
      <div class="marker-popup">
        <h4><i class="fa-solid fa-box"></i> Pickup Location</h4>
        <p><strong>${tracking.pickupLocation.address}</strong></p>
        <p><small>Status: ${tracking.pickupLocation.status}</small></p>
        <p><small>Time: ${new Date(tracking.pickupLocation.timestamp).toLocaleString()}</small></p>
      </div>
    `);
    this.markers.push(pickupMarker);

    // Add destination marker
    const destinationMarker = L.marker([tracking.destinationLocation.lat, tracking.destinationLocation.lng], {
      icon: this.createCustomIcon('destination', 'Destination')
    }).addTo(this.map!);
    
    // Add popup for destination
    destinationMarker.bindPopup(`
      <div class="marker-popup">
        <h4><i class="fa-solid fa-flag-checkered"></i> Destination</h4>
        <p><strong>${tracking.destinationLocation.address}</strong></p>
        <p><small>Estimated Delivery: ${new Date(tracking.estimatedDelivery).toLocaleDateString()}</small></p>
      </div>
    `);
    this.markers.push(destinationMarker);

    // Add current location marker if available
    if (tracking.currentLocation) {
      const currentMarker = L.marker([tracking.currentLocation.lat, tracking.currentLocation.lng], {
        icon: this.createCustomIcon('current', 'Current Location')
      }).addTo(this.map!);
      
      // Add popup for current location
      currentMarker.bindPopup(`
        <div class="marker-popup">
          <h4><i class="fa-solid fa-location-dot"></i> Current Location</h4>
          <p><strong>${tracking.currentLocation.address}</strong></p>
          <p><small>Status: ${tracking.currentLocation.status}</small></p>
          <p><small>Last Update: ${new Date(tracking.currentLocation.timestamp).toLocaleString()}</small></p>
        </div>
      `);
      this.markers.push(currentMarker);
    }

    // Add courier location if available
    if (tracking.courierLocation) {
      const courierMarker = L.marker([tracking.courierLocation.lat, tracking.courierLocation.lng], {
        icon: this.createCustomIcon('courier', 'Courier Location')
      }).addTo(this.map!);
      
      // Add popup for courier location
      courierMarker.bindPopup(`
        <div class="marker-popup">
          <h4><i class="fa-solid fa-truck"></i> Courier Location</h4>
          <p><strong>${tracking.courierLocation.address}</strong></p>
          <p><small>Status: ${tracking.courierLocation.status}</small></p>
          <p><small>Last Update: ${new Date(tracking.courierLocation.timestamp).toLocaleString()}</small></p>
        </div>
      `);
      this.markers.push(courierMarker);
    }

    // Draw route line with better styling
    this.drawRoute(tracking);

    // Fit map to show all markers with padding
    this.fitMapToMarkers();
  }

  // Create custom markers with better styling
  private createCustomIcon(type: string, title: string): L.DivIcon {
    const iconHtml = this.getIconHtml(type, title);
    return L.divIcon({
      html: iconHtml,
      className: `custom-marker ${type}-marker`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  }

  private getIconHtml(type: string, title: string): string {
    const icons: { [key: string]: string } = {
      pickup: 'fa-box',
      destination: 'fa-flag-checkered',
      current: 'fa-location-dot',
      courier: 'fa-truck'
    };

    const colors: { [key: string]: string } = {
      pickup: '#28a745',
      destination: '#dc3545',
      current: '#007bff',
      courier: '#ffc107'
    };

    const bgColors: { [key: string]: string } = {
      pickup: '#d4edda',
      destination: '#f8d7da',
      current: '#cce5ff',
      courier: '#fff3cd'
    };

    return `
      <div class="marker-container ${type}-marker" title="${title}">
        <div class="marker-icon">
          <i class="fa-solid ${icons[type] || 'fa-map-marker'}" style="color: ${colors[type] || '#666'};"></i>
        </div>
        <div class="marker-pulse"></div>
      </div>
    `;
  }

  // Draw route between points with better styling
  private drawRoute(tracking: ParcelTracking): void {
    const routePoints: [number, number][] = [
      [tracking.pickupLocation.lat, tracking.pickupLocation.lng],
      [tracking.destinationLocation.lat, tracking.destinationLocation.lng]
    ];

    // Add current location to route if available
    if (tracking.currentLocation) {
      routePoints.splice(1, 0, [tracking.currentLocation.lat, tracking.currentLocation.lng]);
    }

    // Create route line with better styling
    this.routeLine = L.polyline(routePoints, {
      color: '#007bff',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map!);

    // Add arrow markers to show direction
    const arrowIcon = L.divIcon({
      html: '<i class="fa-solid fa-arrow-right" style="color: #007bff; font-size: 16px;"></i>',
      className: 'route-arrow',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Add arrows at intervals along the route
    for (let i = 1; i < routePoints.length; i++) {
      const midPoint = [
        (routePoints[i-1][0] + routePoints[i][0]) / 2,
        (routePoints[i-1][1] + routePoints[i][1]) / 2
      ];
      L.marker(midPoint as [number, number], { icon: arrowIcon }).addTo(this.map!);
    }
  }

  // Fit map to show all markers with better padding
  private fitMapToMarkers(): void {
    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      const bounds = group.getBounds();
      this.map!.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  }

  // Clear map markers and route
  private clearMap(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    if (this.routeLine) {
      this.routeLine.remove();
      this.routeLine = null;
    }
  }

  // Destroy map
  destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.clearMap();
  }

  // Get tracking updates
  getTrackingUpdates(): Observable<ParcelTracking | null> {
    return this.trackingSubject.asObservable();
  }

  // Update tracking data
  updateTracking(tracking: ParcelTracking): void {
    this.trackingSubject.next(tracking);
  }

  // Simulate tracking data for demo with Kenyan locations
  getMockTrackingData(parcelId: string): ParcelTracking {
    // Kenyan locations for realistic tracking
    const kenyanLocations = {
      nairobi: { lat: -1.2921, lng: 36.8219, address: 'Nairobi, Kenya' },
      westlands: { lat: -1.2649, lng: 36.8065, address: 'Westlands, Nairobi' },
      kilimani: { lat: -1.3008, lng: 36.8070, address: 'Kilimani, Nairobi' },
      lavington: { lat: -1.2833, lng: 36.8167, address: 'Lavington, Nairobi' },
      karen: { lat: -1.3167, lng: 36.7167, address: 'Karen, Nairobi' },
      eastleigh: { lat: -1.2833, lng: 36.8500, address: 'Eastleigh, Nairobi' },
      buruburu: { lat: -1.2833, lng: 36.8667, address: 'Buruburu, Nairobi' },
      donholm: { lat: -1.2833, lng: 36.8833, address: 'Donholm, Nairobi' }
    };

    const pickup = kenyanLocations.westlands;
    const destination = kenyanLocations.karen;
    const current = kenyanLocations.kilimani;
    const courier = kenyanLocations.lavington;

    return {
      parcelId,
      trackingNumber: 'TRK' + parcelId.substring(0, 8),
      currentLocation: {
        lat: current.lat,
        lng: current.lng,
        timestamp: new Date().toISOString(),
        status: 'IN_TRANSIT',
        address: current.address
      },
      pickupLocation: {
        lat: pickup.lat,
        lng: pickup.lng,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'PICKED_UP',
        address: pickup.address
      },
      destinationLocation: {
        lat: destination.lat,
        lng: destination.lng,
        timestamp: new Date().toISOString(),
        status: 'PENDING',
        address: destination.address
      },
      status: 'IN_TRANSIT',
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      courierLocation: {
        lat: courier.lat,
        lng: courier.lng,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE',
        address: courier.address
      },
      statusHistory: [
        {
          id: '1',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          location: 'Westlands, Nairobi'
        },
        {
          id: '2',
          status: 'PICKED_UP',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          location: 'Westlands, Nairobi'
        },
        {
          id: '3',
          status: 'IN_TRANSIT',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          location: 'Kilimani, Nairobi'
        }
      ]
    };
  }
} 