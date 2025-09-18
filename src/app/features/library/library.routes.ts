import { Routes } from '@angular/router';
import { bookResolver } from './resolvers/book.resolver';

export const libraryRoutes: Routes = [
  {
    path: 'books',
    loadComponent: () => import('./components/book-list/book-list').then((c) => c.BookList),
    title: 'BookLi • Books',
  },
  {
    path: 'books/new',
    loadComponent: () => import('./components/book-detail/book-detail').then((c) => c.BookDetail),
    title: 'BookLi • New Book',
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./components/book-detail/book-detail').then((c) => c.BookDetail),
    resolve: { book: bookResolver },
    title: 'BookLi • Edit Book',
  },
  {
    path: 'books/:id/overview',
    loadComponent: () =>
      import('./components/book-overview/book-overview').then((c) => c.BookOverview),
    resolve: { book: bookResolver },
    title: 'BookLi • Book Overview',
  },
  { path: '', pathMatch: 'full', redirectTo: 'books' },
];
