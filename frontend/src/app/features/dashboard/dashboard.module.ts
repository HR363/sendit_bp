import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
// Import other dashboard components as needed

const routes: Routes = [
  { path: 'profile', component: ProfileComponent },
  // Add other dashboard child routes here
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardModule {}
