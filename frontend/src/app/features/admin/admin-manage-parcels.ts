import { Component, OnInit } from '@angular/core';
import { NgForOf, NgClass, AsyncPipe, DatePipe } from '@angular/common';
import { AdminParcelDetailsPopup } from './admin-parcel-details-popup';
import { FormsModule } from '@angular/forms';
import { ParcelService, Parcel } from '../../core/services/parcel.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-admin-manage-parcels',
  standalone: true,
  imports: [NgForOf, NgClass, FormsModule, AdminParcelDetailsPopup, AsyncPipe, DatePipe],
  templateUrl: './admin-manage-parcels.html',
  styleUrls: ['./admin-manage-parcels.css']
})
export class AdminManageParcels implements OnInit {
  allParcels$!: Observable<Parcel[]>;
  filteredParcels$!: Observable<Parcel[]>;

  statuses = ['All Statuses', 'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  selectedStatus = 'All Statuses';
  search = '';

  parcelsInTransit = 0;
  deliveredToday = 0;
  pendingPickup = 0;

  updateStats(parcels: Parcel[]) {
    const today = new Date();
    this.parcelsInTransit = parcels.filter(p => p.status === 'IN_TRANSIT').length;
    this.deliveredToday = parcels.filter(p => p.status === 'DELIVERED' && this.isToday(p.actualDeliveryDate)).length;
    this.pendingPickup = parcels.filter(p => p.status === 'PENDING').length;
  }

  constructor(private parcelService: ParcelService) {}

  ngOnInit() {
    this.loadParcels();
  }

  loadParcels() {
    this.allParcels$ = this.parcelService.getAllParcels();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredParcels$ = this.allParcels$.pipe(
      map(parcels => {
        let filtered = parcels;

        if (this.selectedStatus !== 'All Statuses') {
          filtered = filtered.filter(p => p.status === this.selectedStatus);
        }

        if (this.search.trim()) {
          const searchTerm = this.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.id.toLowerCase().includes(searchTerm) ||
            p.senderName.toLowerCase().includes(searchTerm) ||
            p.receiverName.toLowerCase().includes(searchTerm)
          );
        }

        this.updateStats(filtered);
        return filtered;
      })
    );
  }
  showDetails = false;
  selectedParcel: Parcel | null = null;

  openDetails(parcel: Parcel) {
    this.selectedParcel = parcel;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedParcel = null;
  }

  onStatusChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  updateParcelStatus(parcel: Parcel, newStatus: string) {
    this.parcelService.updateParcelStatus(parcel.id, { status: newStatus }).subscribe(() => {
      this.loadParcels(); // Refresh data
    });
  }

  assignCourier(parcel: Parcel, courierId: string) {
    this.parcelService.assignCourier(parcel.id, { courierId }).subscribe(() => {
      this.loadParcels(); // Refresh data
    });
  }

  deleteParcel(parcel: Parcel) {
    this.parcelService.deleteParcel(parcel.id).subscribe(() => {
      this.loadParcels(); // Refresh data
    });
  }

  isToday(dateStr?: string): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  }
}