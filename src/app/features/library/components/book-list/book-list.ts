import {
  Component,
  ChangeDetectionStrategy,
  inject,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
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
  imports: [
    CommonModule,
    RouterLink,
    ...MAT_LIST_VIEW_IMPORTS,
    MatDialogModule,
    MatProgressBarModule,
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookList {
  private service = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef); // 🔧 Added ChangeDetectorRef

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
        startWith(void 0), // initial load
        tap(() => {
          this.loading = true;
          this.cdr.markForCheck(); // 🔧 Trigger change detection when loading starts
        }),
        switchMap(() =>
          this.service.list().pipe(
            catchError((err) => {
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
      .subscribe((books) => {
        this.books = books ?? [];
        this.resetImageStates(); // Clear image loading states for new data
        this.applyFilter(this.filterValue); // keep current filter applied
        this.cdr.markForCheck(); // 🔧 Trigger change detection when data arrives
      });
  }

  // ——— Filtering (client-side) ———
  applyFilter(value: string) {
    const f = (value ?? '').trim().toLowerCase();
    this.filterValue = value ?? '';
    this.filtered = (this.books ?? []).filter((b) =>
      [b.title, b.author, b.genre, String(b.year)].some((x) => (x ?? '').toLowerCase().includes(f))
    );
    // No need for markForCheck here since this is usually called from user input events
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

    ref
      .afterClosed()
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

  // Generate a personalized placeholder with book title and author
  getPlaceholderFor(b: IBook): string {
    // Check if we already generated a placeholder for this book
    const cacheKey = `placeholder_${b.id}`;
    if (this.coverCache[cacheKey]) {
      return this.coverCache[cacheKey];
    }

    // Create personalized placeholder
    const title = (b.title || 'Untitled Book').slice(0, 24);
    const author = (b.author || 'Unknown Author').slice(0, 20);
    const year = b.year || '';

    const placeholder =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400' width='300' height='400'>
        <defs>
          <linearGradient id='bookGrad${b.id}' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stop-color='#f8fafc'/>
            <stop offset='100%' stop-color='#e2e8f0'/>
          </linearGradient>
        </defs>
        <rect width='300' height='400' fill='url(#bookGrad${
          b.id
        })' stroke='#cbd5e1' stroke-width='2' rx='8'/>
        <rect x='20' y='30' width='260' height='2' fill='#94a3b8' rx='1'/>
        <rect x='20' y='50' width='200' height='2' fill='#cbd5e1' rx='1'/>
        <rect x='20' y='70' width='180' height='2' fill='#e2e8f0' rx='1'/>
        
        <!-- Book icon -->
        <g transform='translate(150, 120)' fill='#94a3b8'>
          <rect x='-20' y='-15' width='40' height='30' fill='none' stroke='#94a3b8' stroke-width='2' rx='3'/>
          <line x1='-15' y1='-10' x2='10' y2='-10' stroke='#cbd5e1' stroke-width='1'/>
          <line x1='-15' y1='-5' x2='15' y2='-5' stroke='#cbd5e1' stroke-width='1'/>
          <line x1='-15' y1='0' x2='8' y2='0' stroke='#cbd5e1' stroke-width='1'/>
          <line x1='-15' y1='5' x2='12' y2='5' stroke='#cbd5e1' stroke-width='1'/>
          <line x1='-15' y1='10' x2='6' y2='10' stroke='#cbd5e1' stroke-width='1'/>
        </g>
        
        <!-- Book title -->
        <text x='150' y='200' text-anchor='middle' font-family='Inter, system-ui, sans-serif' 
              font-size='16' fill='#1f2937' font-weight='600'>${title}</text>
        
        <!-- Author -->
        <text x='150' y='225' text-anchor='middle' font-family='Inter, system-ui, sans-serif' 
              font-size='13' fill='#6b7280' font-weight='500'>${author}</text>
              
        <!-- Year -->
        ${
          year
            ? `<text x='150' y='245' text-anchor='middle' font-family='Inter, system-ui, sans-serif' 
              font-size='11' fill='#9ca3af'>${year}</text>`
            : ''
        }
        
        <!-- Footer text -->
        <text x='150' y='320' text-anchor='middle' font-family='Inter, system-ui, sans-serif' 
              font-size='11' fill='#9ca3af'>No cover image</text>
        <text x='150' y='340' text-anchor='middle' font-family='Inter, system-ui, sans-serif' 
              font-size='10' fill='#d1d5db'>Click to edit details</text>
      </svg>
    `);

    // Cache the generated placeholder
    this.coverCache[cacheKey] = placeholder;
    return placeholder;
  }

  onCoverError(evt: Event, b: IBook) {
    // Mark as loaded even on error to stop shimmer
     const img = evt.target as HTMLImageElement;
  img.src = this.getPlaceholderFor(b); // final fallback
    this.onImageLoad(b.id);
  }

}
