
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf, NgClass, AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParcelService, Parcel } from '../../core/services/parcel.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-courier-parcels',
  standalone: true,
  imports: [NgForOf, NgClass, FormsModule, AsyncPipe, DatePipe],
  templateUrl: './courier-parcels.html',
  styleUrls: ['./courier-parcels.css']
})
export class CourierParcels implements OnInit {
  assignedParcels$!: Observable<Parcel[]>;
  filteredParcels$!: Observable<Parcel[]>;

  constructor(
    private router: Router,
    private parcelService: ParcelService
  ) {}

  ngOnInit() {
    this.loadParcels();
  }

  viewParcel(parcel: Parcel) {
    this.router.navigate(['/courier/parcels', parcel.id]);
  }
  statuses = ['All Statuses', 'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  selectedStatus = 'All Statuses';
  search = '';
  loadParcels() {
    this.assignedParcels$ = this.parcelService.getAssignedParcels();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredParcels$ = this.assignedParcels$.pipe(
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

        return filtered;
      })
    );
  }

  onStatusChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  updateStatus(parcel: Parcel, newStatus: string) {
    this.parcelService.updateParcelStatus(parcel.id, { status: newStatus }).subscribe(() => {
      this.loadParcels(); // Refresh data
    });
  }

  deleteParcel(parcel: Parcel) {
    this.parcelService.deleteParcel(parcel.id).subscribe(() => {
      this.loadParcels(); // Refresh data
    });
  }
}
