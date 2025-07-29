import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'fab-menu',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="fab-menu-container" [class.open]="open">
      <button class="fab-btn" (click)="toggleMenu()" aria-label="Open quick actions">
        <i class="fa-solid fa-plus"></i>
      </button>
      <div class="fab-dropdown" *ngIf="open">
        <a href="https://livechat.example.com" target="_blank" class="fab-action" title="Live Chat">
          <i class="fa-solid fa-comments"></i>
        </a>
        <a href="https://chatbot.example.com" target="_blank" class="fab-action" title="Chatbot">
          <i class="fa-solid fa-robot"></i>
        </a>
        <a href="https://wa.me/254700000000" target="_blank" class="fab-action" title="WhatsApp">
          <i class="fa-brands fa-whatsapp"></i>
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./fab-menu.component.css']
})
export class FabMenuComponent {
  open = false;
  
  toggleMenu() {
    this.open = !this.open;
  }
}