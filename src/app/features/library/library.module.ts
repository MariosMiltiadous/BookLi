import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryRoutingModule } from './library-routing.module';

// Standalone components are IMPORTED, not declared.
import { BookList } from './components/book-list/book-list';
import { BookDetail } from './components/book-detail/book-detail';
import { BookOverview } from './components/book-overview/book-overview';

@NgModule({
  imports: [
    CommonModule,
    LibraryRoutingModule,
    BookList,
    BookDetail,
    BookOverview
  ],
  declarations: [
    
  ],
})
export class LibraryModule {}
