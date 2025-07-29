import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgForOf, NgIf, NgClass, AsyncPipe, DatePipe } from '@angular/common';
import { ParcelService, Parcel } from '../../core/services/parcel.service';
import { Observable, map, combineLatest } from 'rxjs';

interface ParcelStats {
  totalParcels: number;
  inTransit: number;
  delivered: number;
  pendingPickup: number;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [RouterLink, NgForOf, NgIf, NgClass, DatePipe, AsyncPipe],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {
  sentParcels$!: Observable<Parcel[]>;
  toMeParcels$!: Observable<Parcel[]>;
  filteredSentParcels$!: Observable<Parcel[]>;
  filteredToMeParcels$!: Observable<Parcel[]>;
  stats$!: Observable<ParcelStats>;

  activeTab: 'sent' | 'toMe' = 'sent';
  statusFilter: string = 'All';
  currentPage: number = 1;
  pageSize: number = 7;

  constructor(private parcelService: ParcelService) {}

  ngOnInit() {
    this.loadParcels();
  }

  loadParcels() {
    this.sentParcels$ = this.parcelService.getSentParcels();
    this.toMeParcels$ = this.parcelService.getReceivedParcels();

    this.filteredSentParcels$ = this.sentParcels$.pipe(
      map(parcels => this.filterParcels(parcels))
    );

    this.filteredToMeParcels$ = this.toMeParcels$.pipe(
      map(parcels => this.filterParcels(parcels))
    );

    // Calculate stats from both sent and received parcels
    this.stats$ = combineLatest([this.sentParcels$, this.toMeParcels$]).pipe(
      map(([sentParcels, receivedParcels]) => {
        const allParcels = [...sentParcels, ...receivedParcels];
        return this.calculateStats(allParcels);
      })
    );
  }

  calculateStats(parcels: Parcel[]): ParcelStats {
    const totalParcels = parcels.length;
    const inTransit = parcels.filter(p => p.status === 'IN_TRANSIT').length;
    const delivered = parcels.filter(p => p.status === 'DELIVERED').length;
    const pendingPickup = parcels.filter(p => p.status === 'PENDING').length;

    return {
      totalParcels,
      inTransit,
      delivered,
      pendingPickup
    };
  }

  filterParcels(parcels: Parcel[]): Parcel[] {
    if (this.statusFilter === 'All') return parcels;
    return parcels.filter(p => p.status === this.statusFilter);
  }

  switchTab(tab: 'sent' | 'toMe') {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  setStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement)?.value || 'All';
    this.statusFilter = value;
    this.loadParcels(); // Reload with new filter
    this.currentPage = 1;
  }

  goToPage(page: number) {
    // Note: Pagination logic would need to be implemented on the backend
    // For now, this is a placeholder
    this.currentPage = page;
  }
}
