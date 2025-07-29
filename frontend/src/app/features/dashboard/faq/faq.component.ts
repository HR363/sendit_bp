import { Component, signal } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'shipping' | 'payment' | 'account' | 'tracking';
}

type CategoryType = 'all' | 'general' | 'shipping' | 'payment' | 'account' | 'tracking';

interface Category {
  id: CategoryType;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FAQComponent {
  searchQuery = signal('');
  selectedCategory = signal<CategoryType>('all');
  expandedItems = signal<Set<string>>(new Set());

  faqData = signal<FAQItem[]>([
    {
      id: '1',
      question: 'How do I create a new shipment?',
      answer: 'To create a new shipment, go to the Parcels page and click "Create New Shipment". Fill in the sender and recipient details, package information, and select your preferred shipping option. You can then review and confirm your shipment.',
      category: 'shipping'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and bank transfers. You can also save your payment methods for faster checkout in the future.',
      category: 'payment'
    },
    {
      id: '3',
      question: 'How can I track my shipment?',
      answer: 'You can track your shipment by entering the tracking number on our tracking page, or by going to your Parcels dashboard where all your shipments are listed with their current status.',
      category: 'tracking'
    },
    {
      id: '4',
      question: 'What are your delivery timeframes?',
      answer: 'Standard delivery takes 3-5 business days, Express delivery takes 1-2 business days, and Same-day delivery is available in select areas. Delivery times may vary based on your location and the shipping option chosen.',
      category: 'shipping'
    },
    {
      id: '5',
      question: 'How do I update my account information?',
      answer: 'You can update your account information by going to your Profile page. Click "Update Details" to edit your name, email, phone number, and profile photo. Changes are saved immediately.',
      category: 'account'
    },
    {
      id: '6',
      question: 'What if my package is damaged or lost?',
      answer: 'If your package is damaged or lost, please contact our customer support within 48 hours of delivery (or expected delivery date). We offer full insurance coverage and will work to resolve the issue quickly.',
      category: 'general'
    },
    {
      id: '7',
      question: 'Can I cancel or modify my shipment?',
      answer: 'You can cancel or modify your shipment within 2 hours of creation, as long as it hasn\'t been picked up yet. Go to your Parcels dashboard and click on the shipment to make changes.',
      category: 'shipping'
    },
    {
      id: '8',
      question: 'How do I add or remove payment methods?',
      answer: 'Go to your Profile page and scroll to the Payment Methods section. Click "Add New" to add a payment method, or click the trash icon next to any existing method to remove it.',
      category: 'payment'
    },
    {
      id: '9',
      question: 'What are the size and weight limits?',
      answer: 'We accept packages up to 150 lbs and dimensions up to 108 inches in length + girth. For larger items, please contact our customer support for special arrangements.',
      category: 'shipping'
    },
    {
      id: '10',
      question: 'How do I change my notification preferences?',
      answer: 'Go to your Profile page and scroll to the Notification Preferences section. Toggle the switches for SMS and Email notifications to your preferred settings.',
      category: 'account'
    },
    {
      id: '11',
      question: 'Do you ship internationally?',
      answer: 'Yes, we offer international shipping to over 200 countries. International delivery times vary by destination and typically take 5-15 business days.',
      category: 'shipping'
    },
    {
      id: '12',
      question: 'How do I get a refund?',
      answer: 'To request a refund, contact our customer support with your tracking number and reason for the refund. Refunds are typically processed within 5-7 business days.',
      category: 'payment'
    }
  ]);

  categories: Category[] = [
    { id: 'all', name: 'All Questions', icon: 'fa-solid fa-question-circle' },
    { id: 'general', name: 'General', icon: 'fa-solid fa-info-circle' },
    { id: 'shipping', name: 'Shipping', icon: 'fa-solid fa-shipping-fast' },
    { id: 'payment', name: 'Payment', icon: 'fa-solid fa-credit-card' },
    { id: 'account', name: 'Account', icon: 'fa-solid fa-user' },
    { id: 'tracking', name: 'Tracking', icon: 'fa-solid fa-search' }
  ];

  get filteredFAQs() {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    
    return this.faqData().filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(query) || 
                           faq.answer.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || faq.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }

  toggleItem(id: string) {
    const expanded = this.expandedItems();
    if (expanded.has(id)) {
      expanded.delete(id);
    } else {
      expanded.add(id);
    }
    this.expandedItems.set(new Set(expanded));
  }

  isExpanded(id: string): boolean {
    return this.expandedItems().has(id);
  }

  selectCategory(category: CategoryType) {
    this.selectedCategory.set(category);
  }

  clearSearch() {
    this.searchQuery.set('');
  }
} 