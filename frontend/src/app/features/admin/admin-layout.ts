import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminLayout {
  constructor(private router: Router) {}

  signOut() {
    // Add any sign-out logic here (e.g., clearing tokens)
    this.router.navigate(['/auth'], { queryParams: { mode: 'signin' } });
  }
}