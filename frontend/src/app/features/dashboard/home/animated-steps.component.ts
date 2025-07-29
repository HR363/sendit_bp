import { Component, ViewEncapsulation } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

const STEPS = [
  {
    img: '/assets/drop_parcel.png',
    alt: 'Drop at agent',
    title: 'Drop your parcel at our nearest agent',
    desc: 'Bring your parcel to any of our agent locations for quick processing and dispatch.'
  },
  {
    img: '/assets/request_pickup.png',
    alt: 'Request for pickup',
    title: 'Or request for pickup',
    desc: 'Schedule a pickup and our courier will collect your parcel from your location.'
  },
  {
    img: '/assets/track_parcel.png',
    alt: 'Track your parcel',
    title: 'Track your parcel',
    desc: 'Monitor your parcel in real-time as it moves through our network.'
  },
  {
    img: '/assets/delivered.png',
    alt: 'Securely delivered',
    title: 'Securely delivered',
    desc: 'Your parcel is delivered safely and securely to its destination.'
  }
];

import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-animated-steps',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './animated-steps.component.html',
  styleUrls: ['./animated-steps.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('900ms 200ms ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AnimatedStepsComponent {
  steps = STEPS;
} 