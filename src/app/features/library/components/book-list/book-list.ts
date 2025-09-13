import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { IBookService } from '../../../../core/services/book.service.contract';
import { inject } from '@angular/core';
import { NotificationsService } from '../../../../core/utils/notifications.service';

// Material
import { MAT_LIST_VIEW_IMPORTS } from '../../../../shared/material/material.imports';

import { startWith } from 'rxjs/operators';
import { IBook } from '../../../../core/models/book.interface';

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [
    CommonModule,
    RouterLink,
    ...MAT_LIST_VIEW_IMPORTS
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookList {
  private service = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);

  // ensures first value is [], so async never yields null - 
  books$ = this.service.list().pipe(startWith([] as IBook[]));
  displayedColumns = ['title', 'author', 'year', 'genre', 'actions'];

  constructor(private router: Router) {}

  addNew() {
    this.router.navigate(['/library/books/new']);
  }

  delete(id: string) {
    this.service.delete(id).subscribe({
      next: () => this.notify.success('Book deleted'),
      error: (e) => this.notify.error(e?.message ?? 'Delete failed'),
    });
  }

  edit(id: string) {
    this.router.navigate(['/library/books', id]);
  }
}
