import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class Overview implements OnInit {
  user: User | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: user => this.user = user,
      error: () => this.user = null
    });
  }
}
