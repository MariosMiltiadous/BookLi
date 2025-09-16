// src/app/features/library/components/book-list/book-list.component.ts
import { Component, ChangeDetectionStrategy, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, filter, finalize, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { IBookService } from '../../../../core/services/book.service.interface';
import { NotificationsService } from '../../../../core/utils/notifications.service';
import { IBook } from '../../../../core/models/book.interface';
import { MAT_LIST_VIEW_IMPORTS } from '../../../../shared/material/material.imports';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialog } from '../../../../shared/ui-components/confirm-delete.dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [CommonModule, RouterLink, ...MAT_LIST_VIEW_IMPORTS, MatDialogModule, MatProgressBarModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookList {
  private service = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);
  private dialog = inject(MatDialog);
    private destroyRef = inject(DestroyRef);
 // Angular doesn't automatically detect changes when you update properties like loading = false - it only checks when inputs change
  private cdr = inject(ChangeDetectorRef); // 🔧 Added ChangeDetectorRef - so I had to manually trigger change detection 

  // Data for card view
  books: IBook[] = [];
  filtered: IBook[] = [];
  
  // UI state
  filterValue = '';
  loading = false;
  
  // 🔁 central "refresh" trigger
  private reload$ = new Subject<void>();

  ngOnInit() {
    this.reload$
      .pipe(
        startWith(void 0),                 // initial load
        tap(() => {
          this.loading = true;
          this.cdr.markForCheck(); // 🔧 Trigger change detection when loading starts
        }),
        switchMap(() =>
          this.service.list().pipe(
            catchError(err => {
              this.notify.error(err?.message ?? 'Load failed');
              return of([] as IBook[]);
            }),
            // finalize runs on complete, error, AND cancellation (switchMap)
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck(); // 🔧 Trigger change detection when loading ends
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(books => {
        this.books = books ?? [];
        this.applyFilter(this.filterValue); // keep current filter applied
        this.cdr.markForCheck(); // 🔧 Trigger change detection when data arrives
      });
  }

  // ——— Filtering (client-side) ———
  applyFilter(value: string) {
    const f = (value ?? '').trim().toLowerCase();
    this.filterValue = value ?? '';
    this.filtered = (this.books ?? []).filter(b =>
      [b.title, b.author, b.genre, String(b.year)]
        .some(x => (x ?? '').toLowerCase().includes(f))
    );
  }

  onFilterInput(e: Event) {
    const value = (e.target as HTMLInputElement).value ?? '';
    this.applyFilter(value);
  }

  clearFilter() {
    this.applyFilter('');
  }

  // ——— Navigation ———
  addNewLink = ['/library', 'books', 'new'];

  // ——— Delete with confirm, then trigger reload ———
  confirmDelete(b: IBook) {
    const ref = this.dialog.open(ConfirmDeleteDialog, {
      data: { title: b.title },
      width: '420px',
      maxWidth: '90vw',
      disableClose: false,
    });

    ref.afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.service.delete(b.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => { 
          this.notify.success('Book deleted'); 
          this.reload$.next(); 
        },
        error: (e) => this.notify.error(e?.message ?? 'Delete failed'),
      });
  }

  // ——— Image loading state management ———
  private loadedImages = new Set<string>();

  isImageLoaded(bookId: string): boolean {
    return this.loadedImages.has(bookId);
  }

  onImageLoad(bookId: string): void {
    this.loadedImages.add(bookId);
    this.cdr.markForCheck(); // Trigger change detection to update UI
  }

  // Reset loaded images when data reloads
  private resetImageStates(): void {
    this.loadedImages.clear();
  }

  // ——— Optional cover helpers (if you don't use coverUrl in data) ———
  private coverCache: Record<string, string> = {};

  coverFor(b: IBook) { 
    return this.coverCache[b.id] ?? `assets/covers/${b.id}.jpg`; 
  }

  onCoverError(b: IBook) {
    // Mark as loaded even on error to stop shimmer
    this.onImageLoad(b.id);
    
    // fallback to simple SVG placeholder
    const txt = encodeURIComponent(b.title?.slice(0, 22) ?? 'Book');
    const sub = encodeURIComponent(b.author ?? '');
    this.coverCache[b.id] =
      'data:image/svg+xml;utf8,' +
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
        <rect width='100%' height='100%' fill='%23f1f3f5'/>
        <text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle'
              font-family='Inter, Roboto, Arial' font-size='28' fill='%23374151'>${txt}</text>
        <text x='50%' y='62%' dominant-baseline='middle' text-anchor='right'
              font-family='Inter, Roboto, Arial' font-size='16' fill='%236b7280'>${sub}</text>
      </svg>`;
  }
}