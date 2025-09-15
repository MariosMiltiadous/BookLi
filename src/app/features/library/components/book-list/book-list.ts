import { Component, ChangeDetectionStrategy, ViewChild, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, filter, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { IBookService } from '../../../../core/services/book.service.interface';
import { NotificationsService } from '../../../../core/utils/notifications.service';
import { IBook } from '../../../../core/models/book.interface';
import { MAT_LIST_VIEW_IMPORTS } from '../../../../shared/material/material.imports';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDeleteDialog } from '../../../../shared/ui-components/confirm-delete.dialog';

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [CommonModule, RouterLink, ...MAT_LIST_VIEW_IMPORTS, MatDialogModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookList {
  private service = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);
  private dialog = inject(MatDialog);
private destroyRef = inject(DestroyRef);

  dataSource = new MatTableDataSource<IBook>([]);
  displayedColumns = ['title', 'author', 'year', 'genre', 'actions'];
  filterValue = '';
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // 🔁 central “refresh” trigger
  private reload$ = new Subject<void>();

  ngOnInit() {
    // multi-field, case-insensitive filter
    this.dataSource.filterPredicate = (b, f) =>
      [b.title, b.author, b.genre, String(b.year)]
        .some(x => (x ?? '').toLowerCase().includes((f ?? '').toLowerCase()));

    // stream to load data on init + whenever reload$ emits
    this.reload$
      .pipe(
        startWith(void 0),                 // initial load
        tap(() => (this.loading = true)),
        // if a second reload happens before the first finishes, the first is cancelled (avoids race conditions and stale updates).
        switchMap(() =>
          this.service.list().pipe(
            catchError(err => {
              this.notify.error(err?.message ?? 'Load failed');
              return of([] as IBook[]);
            }),
            tap(() => (this.loading = false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(books => {
        this.dataSource.data = books ?? [];
        // keep current client-side filter applied
        this.dataSource.filter = (this.filterValue ?? '').trim().toLowerCase();
        // attach paginator (idempotent)
        if (this.paginator && this.dataSource.paginator !== this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      });
  }

  // ——— Filtering ———
  applyFilter(value: string) {
    this.dataSource.filter = (value ?? '').trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  onFilterInput(e: Event) {
    const value = (e.target as HTMLInputElement).value ?? '';
    this.filterValue = value;
    this.applyFilter(value);
  }

  clearFilter() {
    this.filterValue = '';
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
        filter(Boolean), // proceed only if user confirmed
        switchMap(() => this.service.delete(b.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => { this.notify.success('Book deleted'); this.reload$.next(); },
        error: (e) => this.notify.error(e?.message ?? 'Delete failed'),
      });
  }
}
