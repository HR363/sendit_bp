import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ParcelService, Parcel } from '../../core/services/parcel.service';
import { Observable, map } from 'rxjs';
import { PickupRequestService, PickupRequest } from '../../core/services/pickup-request.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, ToastComponent],
  templateUrl: './courier-dashboard.html',
  styleUrls: ['./courier-dashboard.css']
})
export class CourierDashboard implements OnInit {
  tab: 'pickups' | 'deliveries' = 'pickups';
  assignedParcels$!: Observable<Parcel[]>;
  pendingPickups$!: Observable<Parcel[]>;
  pendingDeliveries$!: Observable<Parcel[]>;
  pendingPickupRequests: PickupRequest[] = [];
  completedToday = 0;
  expandedPickupRequestId: string | null = null;

  constructor(private parcelService: ParcelService, private pickupRequestService: PickupRequestService, private toast: ToastService) {}

  ngOnInit() {
    this.loadParcels();
    this.loadPendingPickupRequests();
  }

  loadParcels() {
    this.assignedParcels$ = this.parcelService.getAssignedParcels();

    this.pendingPickups$ = this.assignedParcels$.pipe(
      map(parcels => parcels.filter(p => p.status === 'PENDING' || p.status === 'PICKED_UP'))
    );

    this.pendingDeliveries$ = this.assignedParcels$.pipe(
      map(parcels => parcels.filter(p => p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY'))
    );
  }

  loadPendingPickupRequests() {
    this.pickupRequestService.getPendingPickupRequests().subscribe(requests => {
      this.pendingPickupRequests = requests.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }

  markPickupCompleted(parcel: Parcel) {
    this.parcelService.updateParcelStatus(parcel.id, { status: 'PICKED_UP' }).subscribe(() => {
      this.loadParcels(); // Refresh data
    });
  }

  markDeliveryCompleted(parcel: Parcel) {
    this.parcelService.updateParcelStatus(parcel.id, { status: 'DELIVERED' }).subscribe(() => {
      this.loadParcels(); // Refresh data
      this.completedToday++;
    });
  }

  markPickupRequestCompleted(request: PickupRequest) {
    this.pickupRequestService.markPickupRequestCompleted(request.id).subscribe(() => {
      this.loadPendingPickupRequests();
      this.toast.show('Pickup request marked as completed!', 'success', 3000);
    });
  }

  togglePickupRequestDetails(id: string) {
    this.expandedPickupRequestId = this.expandedPickupRequestId === id ? null : id;
  }

  getParsedDetails(req: PickupRequest): any {
    try {
      return JSON.parse(req.parcelDetails);
    } catch {
      return {};
    }
  }

  get totalPendingPickups(): number {
    let assigned = 0;
    this.pendingPickups$?.subscribe(pickups => assigned = pickups.length);
    return assigned + this.pendingPickupRequests.length;
  }
}
