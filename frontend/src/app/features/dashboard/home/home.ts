import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { PickupRequestService } from '../../../core/services/pickup-request.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgIf, NgForOf, FormsModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  user: User | null = null;
  currentStep = signal(0);
  showPickupModal = signal(false);
  pickupFormGroup!: FormGroup;
  pickupSuccess = signal(false);
  steps = [
    {
      img: 'assets/drop_parcel.png',
      alt: 'Step 1',
      title: 'Unleash Your',
      highlight: 'Inner Warrior',
      highlightClass: 'blue',
      desc: 'Join the battle and conquer the arena with unmatched skill and strategy.'
    },
    {
      img: 'assets/request_pickup.png',
      alt: 'Step 2',
      title: 'Embark on Your',
      highlight: 'Legendary Journey',
      highlightClass: 'green',
      desc: 'Immerse Yourself in a World Where Legends Clash and Heroes Rise to Glory.'
    },
    {
      img: 'assets/track_parcel.png',
      alt: 'Step 3',
      title: 'Master the',
      highlight: 'Art of Magic',
      highlightClass: 'purple',
      desc: 'Harness powerful spells and enchantments to dominate your foes and change the course of battle.'
    },
    {
      img: 'assets/delivered.png',
      alt: 'Step 4',
      title: 'Rise as the',
      highlight: 'Champion',
      highlightClass: 'pink',
      desc: 'Lead your team to victory with unparalleled strength and unwavering determination.'
    }
  ];

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private pickupRequestService: PickupRequestService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    setTimeout(() => this.setupScrollSteps(), 300);
    this.pickupFormGroup = this.fb.group({
      senderName: ['', Validators.required],
      senderPhone: ['', Validators.required],
      pickupAddress: ['', Validators.required],
      parcelDescription: ['', Validators.required],
      pickupDate: ['', Validators.required],
      specialInstructions: ['']
    });
  }

  setupScrollSteps() {
    const section = document.querySelector('.scroll-steps-section');
    if (!section) return;
    const stepsCount = this.steps.length;
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      let progress = Math.min(Math.max((vh/2 - rect.top) / (rect.height - vh), 0), 1);
      let idx = Math.floor(progress * stepsCount);
      if (idx >= stepsCount) idx = stepsCount - 1;
      this.currentStep.set(idx);
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  openPickupModal() {
    this.showPickupModal.set(true);
    this.pickupSuccess.set(false);
  }
  closePickupModal() {
    this.showPickupModal.set(false);
    this.resetPickupForm();
  }
  submitPickupRequest() {
    if (this.pickupFormGroup.invalid) {
      this.pickupFormGroup.markAllAsTouched();
      return;
    }
    const form = this.pickupFormGroup.value;
    const dto = {
      parcelDetails: JSON.stringify({
        senderName: form.senderName,
        senderPhone: form.senderPhone,
        parcelDescription: form.parcelDescription,
        pickupDate: form.pickupDate,
        specialInstructions: form.specialInstructions
      }),
      pickupLocation: form.pickupAddress
    };
    this.pickupRequestService.createPickupRequest(dto).subscribe({
      next: () => {
        this.pickupSuccess.set(true);
        this.toast.show('Pickup request submitted!', 'success');
        this.pickupFormGroup.reset();
      },
      error: (err) => {
        this.toast.show('Failed to submit pickup request', 'error');
        console.error('Pickup request error:', err);
      }
    });
  }
  resetPickupForm() {
    this.pickupFormGroup.reset();
  }
}
