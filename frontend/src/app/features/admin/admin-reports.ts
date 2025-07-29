import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../core/services/review.service';

interface Report {
  id: string;
  type: 'Complaint' | 'Feedback';
  user: string;
  message: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.html',
  styleUrls: ['./admin-reports.css']
})
export class AdminReportsComponent implements OnInit {
  reports: Report[] = [];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.reviewService.getAllReviews().subscribe((reviews: Review[]) => {
      this.reports = reviews.map((review) => ({
        id: review.id,
        type: review.rating >= 4 ? 'Feedback' : 'Complaint',
        user: review.user ? `${review.user.firstName} ${review.user.lastName}` : review.userId,
        message: review.comment || '',
        date: review.createdAt.split('T')[0],
        status: 'Open', // You can update this if you add a status field to Review
      }));
    });
  }

  setStatus(report: Report, status: Report['status']) {
    report.status = status;
  }
}
