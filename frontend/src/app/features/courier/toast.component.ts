import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts()" class="toast" [ngClass]="toast.type">
        <span class="toast-icon">
          <i *ngIf="toast.type === 'success'" class="fa-solid fa-circle-check"></i>
          <i *ngIf="toast.type === 'error'" class="fa-solid fa-circle-xmark"></i>
          <i *ngIf="toast.type === 'info'" class="fa-solid fa-circle-info"></i>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <span class="toast-timer"></span>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  toasts = signal<Toast[]>([]);

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(toast => {
      this.toasts.set([...this.toasts(), toast]);
      setTimeout(() => {
        this.toasts.set(this.toasts().slice(1));
      }, toast.duration || 3000);
    });
  }
} 