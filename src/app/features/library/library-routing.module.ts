import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { bookResolver } from './resolvers/book.resolver';

const routes: Routes = [
 {
    path: 'books',
    loadComponent: () =>
      import('./components/book-list/book-list').then(c => c.BookList),
    title: 'BookLi • Books',
  },
  {
    path: 'books/new',
    loadComponent: () =>
      import('./components/book-detail/book-detail').then(c => c.BookDetail),
    title: 'BookLi • New Book',
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./components/book-detail/book-detail').then(c => c.BookDetail),
    resolve: { book: bookResolver },
    // runGuardsAndResolvers: 'paramsOrQueryParamsChange', // optional
    title: 'BookLi • Edit Book',
  },
  { path: '', pathMatch: 'full', redirectTo: 'books' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryRoutingModule {}
