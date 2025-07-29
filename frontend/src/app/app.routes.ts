import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then(m => m.Landing)
  },
  {
    path: 'track',
    loadComponent: () => import('./features/tracking/tracking.component').then(m => m.TrackingComponent)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/admin/admin-layout').then(m => m.AdminLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard').then(m => m.AdminDashboard) },
      { path: 'users', loadComponent: () => import('./features/admin/admin-manage-users').then(m => m.AdminManageUsers) },
      { path: 'parcels', loadComponent: () => import('./features/admin/admin-manage-parcels').then(m => m.AdminManageParcels) },
      { path: 'parcels/create', loadComponent: () => import('./features/admin/create-parcel').then(m => m.CreateParcelComponent) },
      { path: 'parcels/:id', loadComponent: () => import('./features/admin/admin-parcel-details-popup').then(m => m.AdminParcelDetailsPopup) }
    ]
  },
  {
    path: 'courier',
    canActivate: [roleGuard],
    data: { roles: ['COURIER_AGENT'] },
    loadComponent: () => import('./features/courier/courier-layout').then(m => m.CourierLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/courier/courier-dashboard').then(m => m.CourierDashboard) },
      { path: 'parcels', loadComponent: () => import('./features/courier/courier-parcels').then(m => m.CourierParcels) },
      { path: 'parcels/create', loadComponent: () => import('./features/courier/courier-create-parcel').then(m => m.CourierCreateParcel) },
      { path: 'parcels/:id', loadComponent: () => import('./features/courier/courier-parcel-details').then(m => m.CourierParcelDetails) }
    ]
  },
  {
    path: 'parcels',
    loadChildren: () => import('./features/parcels/parcels-module').then(m => m.ParcelsModule)
  },
  {
    path: 'auth',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth-form/auth-form').then(m => m.AuthFormComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
