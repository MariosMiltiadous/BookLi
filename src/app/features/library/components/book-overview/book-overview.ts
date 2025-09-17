import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { IBook } from '../../../../core/models/book.interface';
import { IBookService } from '../../../../core/services/book.service.interface';
import { BOOK_SERVICE } from '../../../../core/services/book.token';

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
  private bookService = inject<IBookService>(BOOK_SERVICE as any);

  book?: IBook;
  loading = true;

  // Default fallback if no cover or error loading
  fallback =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
    <rect width="300" height="400" fill="#f3f4f6"/>
    <text x="50%" y="50%" font-size="20" text-anchor="middle" fill="#9ca3af">
      No Cover
    </text>
  </svg>
`);
  mockDescription = `A practical exploration of clean, maintainable software design.
This overview page is using placeholder text. Replace it with the book's real summary,
key takeaways, and why it matters to the reader.`;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.bookService.getById(id).subscribe({
      next: (b) => {
        this.book = b;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onImageError(e: Event) {
    (e.target as HTMLImageElement).src = this.fallback;
  }
}
