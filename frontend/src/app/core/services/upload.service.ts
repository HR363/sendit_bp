import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResponse {
  url: string;
  publicId?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private apiUrl = '/api/upload';

  constructor(private http: HttpClient) {}

  uploadProfilePhoto(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(`${this.apiUrl}/profile-photo`, formData);
  }

  uploadDeliveryImage(parcelId: string, file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResponse>(`${this.apiUrl}/parcels/${parcelId}/delivery-image`, formData);
  }
}
