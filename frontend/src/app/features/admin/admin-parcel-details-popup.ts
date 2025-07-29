import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-parcel-details-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-parcel-details-popup.html',
  styleUrls: ['./admin-parcel-details-popup.css']
})
export class AdminParcelDetailsPopup {
  @Input() parcel: any;
  @Input() open = false;
  close() { this.open = false; }

  getStatusClass(status: string): string {
    return status ? status.replace(/\s/g, '').toLowerCase() : '';
  }
}
