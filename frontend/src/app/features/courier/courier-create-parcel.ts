
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { ParcelService } from '../../core/services/parcel.service';
import { PricingService, PricingResponse } from '../../core/services/pricing.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-courier-create-parcel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './courier-create-parcel.html',
  styleUrls: ['./courier-create-parcel.css']
})
export class CourierCreateParcel implements OnInit {
  parcelForm!: FormGroup;
  statuses = ['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'On Hold'];
  categories: Category[] = [];
  isSubmitting = false;
  pricingData: PricingResponse | null = null;
  isLoadingPricing = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastService: ToastService,
    private parcelService: ParcelService,
    private pricingService: PricingService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
    this.setupPricingCalculation();
  }

  private loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (categories.length > 0) {
          this.parcelForm.patchValue({ categoryId: categories[0].id });
        }
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        this.toastService.show('Failed to load categories', 'error');
      }
    });
  }

  private initForm() {
    this.parcelForm = this.fb.group({
      senderName: ['', Validators.required],
      senderPhone: ['', Validators.required],
      senderEmail: ['', [Validators.required, Validators.email]],
      receiverName: ['', Validators.required],
      receiverPhone: ['', Validators.required],
      receiverEmail: ['', [Validators.required, Validators.email]],
      pickupAddress: [''],
      destinationAddress: ['', Validators.required],
      pickupDate: [''],
      weight: [null, [Validators.required, Validators.min(0.1)]],
      status: ['Pending', Validators.required],
      description: [''],
      serviceType: ['Standard', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  private setupPricingCalculation() {
    // Calculate pricing when relevant fields change
    const pricingFields = ['weight', 'serviceType', 'categoryId', 'pickupAddress', 'destinationAddress'];
    
    pricingFields.forEach(field => {
      this.parcelForm.get(field)?.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.calculatePricing();
        });
    });
  }

  private calculatePricing() {
    const formValue = this.parcelForm.value;
    
    if (!formValue.weight || !formValue.categoryId || !formValue.destinationAddress) {
      this.pricingData = null;
      return;
    }

    this.isLoadingPricing = true;
    
    const request = {
      categoryId: formValue.categoryId,
      weight: formValue.weight,
      pickupLocation: this.pricingService.createLocationFromAddress(formValue.pickupAddress || ''),
      destinationLocation: this.pricingService.createLocationFromAddress(formValue.destinationAddress),
      serviceType: formValue.serviceType
    };

    this.pricingService.calculatePricing(request).subscribe({
      next: (pricing) => {
        this.pricingData = pricing;
        this.isLoadingPricing = false;
      },
      error: (error) => {
        console.error('Pricing calculation failed:', error);
        this.pricingData = null;
        this.isLoadingPricing = false;
      }
    });
  }

  createParcel() {
    if (this.parcelForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const form = this.parcelForm.value;
    
    // Build payload for backend
    const payload = {
      senderName: form.senderName,
      senderPhone: form.senderPhone,
      senderEmail: form.senderEmail,
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      receiverEmail: form.receiverEmail,
      pickupLocation: this.pricingService.createLocationFromAddress(form.pickupAddress || ''),
      destinationLocation: this.pricingService.createLocationFromAddress(form.destinationAddress),
      weight: form.weight,
      description: form.description,
      status: form.status,
      estimatedDeliveryDate: form.pickupDate ? new Date(form.pickupDate).toISOString() : new Date().toISOString(),
      categoryId: form.categoryId,
      serviceType: form.serviceType
    };

    this.parcelService.createParcel(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.show('Parcel created successfully!', 'success');
        this.router.navigate(['/courier/parcels']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.show('Failed to create parcel', 'error');
        console.error('Parcel creation error:', err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/courier/dashboard']);
  }
}
