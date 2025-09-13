// src/app/features/library/components/book-list/book-list.component.ts
import { Component, ChangeDetectionStrategy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BOOK_SERVICE } from '../../../../core/services/book.token';
import { IBookService } from '../../../../core/services/book.service.contract';
import { NotificationsService } from '../../../../core/utils/notifications.service';
import { IBook } from '../../../../core/models/book.interface';
import { MAT_LIST_VIEW_IMPORTS } from '../../../../shared/material/material.imports';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  standalone: true,
  selector: 'app-book-list',
  imports: [
    CommonModule, RouterLink,
   ...MAT_LIST_VIEW_IMPORTS
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookList {
  private service = inject<IBookService>(BOOK_SERVICE as any);
  private notify = inject(NotificationsService);

  dataSource = new MatTableDataSource<IBook>([]);
  displayedColumns = ['title', 'author', 'year', 'genre', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.service.list().subscribe(books => {
      this.dataSource.data = books ?? [];
      if (this.paginator) this.dataSource.paginator = this.paginator;
    });
    // optional: case-insensitive filtering over multiple fields
    this.dataSource.filterPredicate = (b, f) =>
      [b.title, b.author, b.genre, String(b.year)].some(x =>
        (x ?? '').toLowerCase().includes(f.trim().toLowerCase()));
  }

  applyFilter(value: string) {
    this.dataSource.filter = value;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  addNewLink = ['/library', 'books', 'new'];

  delete(id: string) {
    this.service.delete(id).subscribe({
      next: () => this.notify.success('Book deleted'),
      error: (e) => this.notify.error(e?.message ?? 'Delete failed'),
    });
  }
}
