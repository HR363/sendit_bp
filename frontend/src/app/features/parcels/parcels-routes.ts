import { Routes } from '@angular/router';
import { List } from './list';
import { ParcelDetailsComponent } from './details';

export const PARCELS_ROUTES: Routes = [
  { path: '', component: List },
  { path: ':id', component: ParcelDetailsComponent }
]; 