import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from './user.service';
import { UploadService } from '../../../core/services/upload.service';
import { ParcelService, Parcel } from '../../../core/services/parcel.service';
import { Observable, combineLatest, map } from 'rxjs';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';

interface PaymentMethod {
  id: string;
  type: 'Visa' | 'Mastercard' | 'Bank';
  last4: string;
  expires: string;
}

interface Shipment {
  id: string;
  title: string;
  trackingId: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent {
  user$!: Observable<UserProfile | null>;
  editMode = false;
  changePasswordMode = false;
  private _editForm: Partial<UserProfile> = {};
  private _photoPreview: string | null = null;
  private _changePasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Payment, shipments, and notifications will be loaded from backend in future
  _paymentEditMode = false;
  _newPaymentForm = { type: 'Visa', number: '', expires: '', cvv: '' };
  _paymentMethods: any[] = [];
  _shipments: Shipment[] = [];
  _notifications = { sms: false, email: false };
  showAllShipmentsFlag = false;

  constructor(
    private userService: UserService,
    private uploadService: UploadService,
    private parcelService: ParcelService
  ) {
    this.user$ = this.userService.getProfile();
    this.loadRecentShipments();
  }

  loadRecentShipments() {
    // Load both sent and received parcels
    combineLatest([
      this.parcelService.getSentParcels(),
      this.parcelService.getReceivedParcels()
    ]).subscribe({
      next: ([sentParcels, receivedParcels]) => {
        const allParcels = [...sentParcels, ...receivedParcels];
        this._shipments = allParcels
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(parcel => ({
            id: parcel.id,
            title: `${parcel.senderName} → ${parcel.receiverName}`,
            trackingId: parcel.trackingNumber,
            status: parcel.status.replace('_', ' '),
            date: new Date(parcel.createdAt).toLocaleDateString()
          }));
      },
      error: (error) => {
        console.error('Error loading shipments:', error);
        this._shipments = [];
      }
    });
  }

  // Getters for template
  editForm() { return this._editForm; }
  photoPreview() { return this._photoPreview; }
  paymentEditMode() { return this._paymentEditMode; }
  newPaymentForm() { return this._newPaymentForm; }
  paymentMethods() { return this._paymentMethods; }
  shipments() { return this._shipments; }
  notifications() { return this._notifications; }
  showAllShipments() { return this.showAllShipmentsFlag; }

  openEditProfile(user?: UserProfile) {
    console.log('openEditProfile called with user:', user);
    if (user) {
      this._editForm = { name: user.name, email: user.email, phone: user.phone };
      this._photoPreview = user.photo || null;
    }
    this.editMode = true;
    console.log('editMode set to:', this.editMode);
  }

  closeEditProfile() {
    console.log('closeEditProfile called');
    this.editMode = false;
    this._photoPreview = null;
  }

  saveProfile() {
    console.log('saveProfile called with form data:', this._editForm);
    // Extract only the fields that the backend supports
    const { name, email, phone } = this._editForm;

    // Split name into firstName and lastName if provided
    let updateData: any = { email, phone };
    if (name) {
      const nameParts = name.trim().split(' ');
      updateData.firstName = nameParts[0] || '';
      updateData.lastName = nameParts.slice(1).join(' ') || '';
    }

    console.log('Sending update data to backend:', updateData);

    this.userService.updateProfile(updateData).subscribe({
      next: () => {
        console.log('Profile updated successfully');
        this.editMode = false;
        this._photoPreview = null;
        // No need to manually reload user; Observable will update if service emits new value
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  onEditInputChange(field: string, value: string) {
    this._editForm = { ...this._editForm, [field]: value };
  }

  onPhotoSelected(event: Event) {
    console.log('onPhotoSelected called');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('File selected:', file.name, file.size, file.type);

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        this._photoPreview = reader.result as string;
        console.log('Photo preview set');
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      console.log('Uploading to Cloudinary...');
      this.uploadService.uploadProfilePhoto(file).subscribe({
        next: (response) => {
          console.log('Upload successful:', response);
          // Update the user's profile with the new photo URL
          this.userService.updateProfile({ profilePhoto: response.url }).subscribe({
            next: () => {
              console.log('Profile photo updated successfully');
            },
            error: (error) => {
              console.error('Error updating profile photo:', error);
            }
          });
        },
        error: (error) => {
          console.error('Error uploading photo:', error);
          // Reset preview on error
          this._photoPreview = null;
        }
      });
    } else {
      console.log('No file selected');
    }
  }

  openChangePassword() {
    this.changePasswordMode = true;
    this._changePasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  closeChangePassword() {
    this.changePasswordMode = false;
    this._changePasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  onPasswordInputChange(field: string, value: string) {
    this._changePasswordForm = { ...this._changePasswordForm, [field]: value };
  }

  togglePasswordVisibility(field: 'currentPassword' | 'newPassword' | 'confirmPassword') {
    switch (field) {
      case 'currentPassword':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'newPassword':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirmPassword':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  changePassword() {
    const { currentPassword, newPassword, confirmPassword } = this._changePasswordForm;

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response: { message: string }) => {
        alert('Password changed successfully');
        this.closeChangePassword();
      },
      error: (error: any) => {
        console.error('Error changing password:', error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Failed to change password. Please try again.');
        }
      }
    });
  }

  // Payment methods (placeholder functionality)
  openAddPayment() {
    this._paymentEditMode = true;
  }

  closeAddPayment() {
    this._paymentEditMode = false;
    this._newPaymentForm = { type: 'Visa', number: '', expires: '', cvv: '' };
  }

  addPaymentMethod() {
    // Placeholder - would integrate with payment processor
    console.log('Adding payment method:', this._newPaymentForm);
    this.closeAddPayment();
  }

  removePaymentMethod(id: string) {
    // Placeholder - would integrate with payment processor
    console.log('Removing payment method:', id);
  }

  toggleShipmentsView() {
    this.showAllShipmentsFlag = !this.showAllShipmentsFlag;
  }

  getDisplayedShipments() {
    return this.showAllShipmentsFlag ? this._shipments : this._shipments.slice(0, 3);
  }

  toggleNotification(type: 'sms' | 'email') {
    this._notifications[type] = !this._notifications[type];
    // Placeholder - would save to backend
    console.log('Notification preference changed:', type, this._notifications[type]);
  }

  onPaymentInputChange(field: string, value: string) {
    this._newPaymentForm = { ...this._newPaymentForm, [field]: value };
  }
}