import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryRoutingModule } from './library-routing.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Standalone components are IMPORTED, not declared.
import { BookList } from './components/book-list/book-list';
import { BookDetail } from './components/book-detail/book-detail';

@NgModule({
  imports: [
    CommonModule,
    LibraryRoutingModule,
    MatSnackBarModule,
    BookList,
    BookDetail,
  ],
})
export class LibraryModule {}
