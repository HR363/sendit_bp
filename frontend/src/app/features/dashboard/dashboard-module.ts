import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/layout';
import { ProfileComponent } from './profile/profile.component';
import { FAQComponent } from './faq/faq.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home').then(m => m.Home)
      },
      {
        path: 'parcels',
        children: [
          { path: '', loadComponent: () => import('../parcels/list').then(m => m.List) },
          { path: ':id', loadComponent: () => import('../parcels/details').then(m => m.ParcelDetailsComponent) }
        ]
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'faq',
        component: FAQComponent
      },
      {
        path: 'metrics',
        loadComponent: () => import('../metrics/metrics').then(m => m.Metrics)
      }
    ]
  }
];
