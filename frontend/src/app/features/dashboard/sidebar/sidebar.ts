
import { Component } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../profile/user.service';

@Component({
  selector: 'app-sidebar',
  imports: [NgIf, AsyncPipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  userRole$;

  constructor(private router: Router, private userService: UserService) {
    this.userRole$ = this.userService.userRole$;
  }

  logout() {
    // Optionally clear auth state here
    this.router.navigateByUrl('/');
  }
}
