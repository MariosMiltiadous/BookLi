// src/app/features/library/components/book-list/book-list.component.ts
import { Component, ChangeDetectionStrategy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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

  dataSource = new MatTableDataSource<IBook>([]);
  displayedColumns = ['title', 'author', 'year', 'genre', 'actions'];
  filterValue = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.service.list().subscribe((books) => {
      this.dataSource.data = books ?? [];
      if (this.paginator) this.dataSource.paginator = this.paginator;
    });

    // Case-insensitive filtering over multiple fields
    this.dataSource.filterPredicate = (b, f) =>
      [b.title, b.author, b.genre, String(b.year)]
        .some(x => (x ?? '').toLowerCase().includes((f ?? '').toLowerCase()));
  }

  // ——— Filtering helpers ———
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

  // ——— Delete flow with confirm dialog ———
  confirmDelete(b: IBook) {
    const ref = this.dialog.open(ConfirmDeleteDialog, {
      data: { title: b.title },
      width: '420px',
      maxWidth: '90vw',
      disableClose: false
    });

    ref.afterClosed().subscribe(yes => {
      if (yes) this.delete(b.id);
    });
  }

  private delete(id: string) {
    this.service.delete(id).subscribe({
      next: () => this.notify.success('Book deleted'),
      error: (e) => this.notify.error(e?.message ?? 'Delete failed'),
    });
  }
}
