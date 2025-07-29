import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ParcelService, Parcel } from '../../core/services/parcel.service';

@Component({
  selector: 'app-courier-parcel-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courier-parcel-details.html',
  styleUrls: ['./courier-parcel-details.css']
})
export class CourierParcelDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private parcelService = inject(ParcelService);
  
  parcelId = this.route.snapshot.paramMap.get('id')!;
  parcel: Parcel | null = null;

  ngOnInit() {
    this.loadParcel();
  }

  loadParcel() {
    this.parcelService.getParcel(this.parcelId).subscribe({
      next: (data) => this.parcel = data,
      error: (err) => {
        console.error('Error loading parcel:', err);
        this.router.navigate(['/courier/parcels']);
      }
    });
  }

  getStatusClass(status: string): string {
    return status?.replace(/\s/g, '').toLowerCase() || '';
  }

  goBack() {
    this.router.navigate(['/courier/parcels']);
  }
}
