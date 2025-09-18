import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { IBook } from '../../../../core/models/book.interface';
// import { IBookService } from '../../../../core/services/book.service.interface';
// import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { NotificationsService } from '../../../../core/utils/notifications.service';

@Component({
  standalone: true,
  selector: 'app-book-overview',
  templateUrl: './book-overview.html',
  styleUrls: ['./book-overview.scss'],
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
  ],
})
export class BookOverview implements OnInit {
  private route = inject(ActivatedRoute);
 // private bookService = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);
  private router = inject(Router); 
  
  book?: IBook;
  loading = false;
  fallback = '';

  // Inline SVG fallback (no file required)
  private svgFallback(title: string = 'No Cover'): string {
    const t = (title || 'No Cover').slice(0, 22);
    return (
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
          <rect width="300" height="400" rx="12" fill="#f3f4f6"/>
          <text x="50%" y="48%" font-size="16" text-anchor="middle" fill="#9ca3af"
                font-family="Inter, Arial, sans-serif">${t}</text>
          <text x="50%" y="58%" font-size="12" text-anchor="middle" fill="#c4c7cc"
                font-family="Inter, Arial, sans-serif">No Cover</text>
        </svg>
      `)
    );
  }

  // Initial src preference: API url → local jpg
  getCorrectCover(b: IBook): string {
    return b.imageUrl || `assets/covers/${b.id}.jpg`;
  }

  // Error cascade: (imageUrl ->) jpg -> png -> inline SVG
  onImageError(evt: Event) {
    const img = evt.target as HTMLImageElement | null;
    if (!img) return; // Exit if no element

    const id = this.book?.id;

    // 1) Try local JPG if not already tried
    if (!img.dataset?.['triedLocalJpg'] && id && !img.src.includes('/assets/covers/')) {
      img.dataset!['triedLocalJpg'] = '1';
      img.src = `assets/covers/${id}.jpg`;
      return;
    }

    // 2) Try local PNG if JPG failed
    if (!img.dataset?.['triedPng'] && id && img.src.endsWith('.jpg')) {
      img.dataset!['triedPng'] = '1';
      img.src = `assets/covers/${id}.png`;
      return;
    }

    // 3) Fallback to inline SVG only once
    if (!img.dataset?.['fellBack']) {
      img.dataset!['fellBack'] = '1';
      img.src = this.svgFallback(this.book?.title ?? 'No Cover');
    }
  }

  mockDescription = `A practical exploration of clean, maintainable software design.
This overview page is using placeholder text. Replace it with the book's real summary,
key takeaways, and why it matters to the reader.`;

  ngOnInit() {
   // ✅ NEW: Use resolver data instead of making HTTP call
    this.book = this.route.snapshot.data['book'];
    
    // ✅ Handle case where resolver returned null (book not found)
    if (!this.book) {
      // This should rarely happen since resolver handles errors,
      // but good to have as safety net
      this.notify.error('Book not found');
      this.router.navigate(['/library/books']);
      return;
    }
  }
}
