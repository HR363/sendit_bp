import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, AfterViewInit, ElementRef, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgForOf, NgClass } from '@angular/common';
import { RouterLink, RouterLinkWithHref } from '@angular/router';

interface Testimonial {
  name: string;
  avatar: string;
  text: string;
}

@Component({
  selector: 'app-landing',
  imports: [NgForOf, NgClass, RouterLink, RouterLinkWithHref],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing implements OnInit, OnDestroy, AfterViewInit {
  public Math = Math;
  testimonials: Testimonial[] = [
    {
      name: 'Wanjiku M.',
      avatar: 'https://ui-avatars.com/api/?name=Wanjiku+M&background=ff9800&color=fff',
      text: 'SendIt made my parcel delivery so easy and stress-free. I could track my package from Nairobi to Kisumu in real time!'
    },
    {
      name: 'Otieno O.',
      avatar: 'https://ui-avatars.com/api/?name=Otieno+O&background=2196f3&color=fff',
      text: 'The notifications are instant and the support team is very responsive. I recommend SendIt to all my friends in Kenya.'
    },
    {
      name: 'Mwangi K.',
      avatar: 'https://ui-avatars.com/api/?name=Mwangi+K&background=4caf50&color=fff',
      text: 'I use SendIt for my business deliveries in Nairobi and it has never disappointed. Fast, secure, and reliable!'
    },
    {
      name: 'Achieng A.',
      avatar: 'https://ui-avatars.com/api/?name=Achieng+A&background=e91e63&color=fff',
      text: 'I sent a birthday gift to my sister in Mombasa and it arrived on time. The live tracking is amazing!'
    },
    {
      name: 'Mutiso P.',
      avatar: 'https://ui-avatars.com/api/?name=Mutiso+P&background=9c27b0&color=fff',
      text: 'SendIt is my go-to for all deliveries. The dashboard is easy to use and the service is top-notch.'
    },
    {
      name: 'Chebet L.',
      avatar: 'https://ui-avatars.com/api/?name=Chebet+L&background=ff5722&color=fff',
      text: 'I love how I can manage all my parcels in one place. The delivery updates are always accurate.'
    },
    {
      name: 'Kamau N.',
      avatar: 'https://ui-avatars.com/api/?name=Kamau+N&background=607d8b&color=fff',
      text: 'The best delivery service in Kenya! I trust SendIt for both personal and business needs.'
    },
    {
      name: 'Wairimu G.',
      avatar: 'https://ui-avatars.com/api/?name=Wairimu+G&background=3f51b5&color=fff',
      text: 'SendIt customer support is always ready to help. My parcels always arrive safely and on time.'
    }
  ];
  position = 0; // px
  private animationId: number | null = null;
  cardWidth = 336; // w-80 + mx-2
  speed = 0.5; // px per frame (adjust for faster/slower river)
  private sectionObserver?: IntersectionObserver;
  private scrollListener?: () => void;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private elRef: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public ngOnInit(): void {
    this.startRiverFlow();
  }

  public ngAfterViewInit(): void {
    this.initSectionReveal();
    this.initParallax();
  }

  public ngOnDestroy(): void {
    this.stopRiverFlow();
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    if (this.scrollListener) {
      this.scrollListener();
    }
  }

  private initSectionReveal(): void {
    const sections: NodeListOf<HTMLElement> = this.document.querySelectorAll('.section-reveal');
    const options: IntersectionObserverInit = { threshold: 0.15 };
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          target.classList.add('revealed');
        } else {
          target.classList.remove('revealed');
        }
      });
    }, options);
    sections.forEach(section => {
      section.classList.remove('revealed');
      this.sectionObserver!.observe(section);
    });
  }

  private initParallax(): void {
    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = this.renderer.listen('window', 'scroll', () => {
        const scrollY: number = window.scrollY;
        // Parallax for hero parcel illustration
        const parcel = this.document.getElementById('hero-parcel');
        if (parcel) {
          this.renderer.setStyle(parcel, 'transform', `translateY(${scrollY * 0.12}px)`);
        }
        // Parallax for hero background shape
        const bg = this.document.getElementById('hero-bg-parallax');
        if (bg) {
          this.renderer.setStyle(bg, 'transform', `translateY(${scrollY * 0.18}px)`);
        }
      });
    });
  }

  private startRiverFlow(): void {
    this.stopRiverFlow();
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        this.position += this.speed;
        const totalWidth = this.testimonials.length * this.cardWidth;
        if (this.position >= totalWidth) {
          this.position = 0;
        }
        this.cdr.detectChanges(); // Trigger change detection
        this.animationId = requestAnimationFrame(animate);
      };
      this.animationId = requestAnimationFrame(animate);
    });
  }

  private stopRiverFlow(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  get riverTransform(): string {
    return `translateX(-${this.position}px)`;
  }

  /**
   * Returns a class string for a card based on its distance from the center of the belt.
   * @param cardIndex The index of the card in the doubled array
   * @param totalCards The total number of unique cards
   * @returns string
   */
  getSpotlightClass(cardIndex: number, totalCards: number): string {
    // Center of the visible area (in px)
    const containerWidth = 1008; // 3 cards
    const centerPx = this.position + containerWidth / 2;
    // Center of this card (in px)
    const cardCenter = cardIndex * this.cardWidth + this.cardWidth / 2;
    // Distance from center (in card widths)
    const dist = Math.abs(cardCenter - centerPx) / this.cardWidth;
    // Spotlight: center card is fully visible, sides fade/scale
    const opacity = 1 - Math.min(dist, 1) * 0.5; // 1 at center, 0.5 at 1 card away
    const scale = 1 - Math.min(dist, 1) * 0.1;   // 1 at center, 0.9 at 1 card away
    // Use explicit classes for Tailwind JIT
    const scaleClass = scale === 1 ? 'scale-[1]' : 'scale-[0.9]';
    const opacityClass = opacity === 1 ? 'opacity-[1]' : 'opacity-[0.5]';
    return `${scaleClass} ${opacityClass} z-10 transition-all duration-700`;
  }
}
