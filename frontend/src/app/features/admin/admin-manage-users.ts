import { Component, OnInit } from '@angular/core';
import { NgForOf, NgClass, AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfile } from '../../core/services/user.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-admin-manage-users',
  standalone: true,
  imports: [NgForOf, NgClass, FormsModule, AsyncPipe, NgIf],
  templateUrl: './admin-manage-users.html',
  styleUrls: ['./admin-manage-users.css']
})
export class AdminManageUsers implements OnInit {
  allUsers$!: Observable<UserProfile[]>;
  filteredUsers$!: Observable<UserProfile[]>;

  roles = ['All', 'USER', 'COURIER_AGENT', 'ADMIN'];
  selectedRole = 'All';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.allUsers$ = this.userService.listUsers();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers$ = this.allUsers$.pipe(
      map(users => {
        if (this.selectedRole === 'All') return users;
        return users.filter(u => u.role === this.selectedRole);
      })
    );
  }

  onRoleFilterChange() {
    this.applyFilters();
  }

  updateUserStatus(user: UserProfile, isActive: boolean) {
    this.userService.updateUserStatus(user.id, { isActive }).subscribe({
      next: () => {
        this.loadUsers(); // Refresh data
      },
      error: (error) => {
        console.error('Failed to update user status:', error);
        // You could add a toast notification here
      }
    });
  }

  updateUserRole(user: UserProfile, newRole: 'USER' | 'ADMIN' | 'COURIER_AGENT') {
    // Prevent self-demotion
    const currentUser = this.getCurrentUser();
    if (currentUser && user.id === currentUser.id && newRole !== 'ADMIN') {
      alert('You cannot demote yourself from admin role.');
      return;
    }

    // Show confirmation dialog
    const roleDisplayNames = {
      'USER': 'User',
      'COURIER_AGENT': 'Courier',
      'ADMIN': 'Admin'
    };

    const currentRoleName = roleDisplayNames[user.role as keyof typeof roleDisplayNames] || user.role;
    const newRoleName = roleDisplayNames[newRole] || newRole;

    const confirmed = confirm(
      `Are you sure you want to change ${user.firstName} ${user.lastName}'s role from ${currentRoleName} to ${newRoleName}?`
    );

    if (!confirmed) {
      // Reset the dropdown to the original value
      this.loadUsers();
      return;
    }

    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        this.loadUsers(); // Refresh data
        console.log(`User ${user.firstName} ${user.lastName} role updated to ${newRole}`);
        // You could add a success toast notification here
      },
      error: (error) => {
        console.error('Failed to update user role:', error);
        // Reset the dropdown to the original value
        this.loadUsers();
        // You could add a toast notification here
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Failed to update user role. Please try again.');
        }
      }
    });
  }

  private getCurrentUser(): UserProfile | null {
    // This is a simplified version - in a real app, you'd get this from a service
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}