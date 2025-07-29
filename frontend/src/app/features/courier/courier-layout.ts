import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courier-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './courier-layout.html',
  styleUrls: ['./courier-layout.css']
})
export class CourierLayout {
  constructor(private router: Router) {}
  signOut() {
    this.router.navigate(['/auth'], { queryParams: { mode: 'signin' } });
  }
}
