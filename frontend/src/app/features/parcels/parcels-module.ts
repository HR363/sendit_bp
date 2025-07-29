import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PARCELS_ROUTES } from './parcels-routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PARCELS_ROUTES)
  ]
})
export class ParcelsModule { }
