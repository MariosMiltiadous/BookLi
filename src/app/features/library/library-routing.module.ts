import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { bookResolver } from './resolvers/book.resolver';

const routes: Routes = [
  {
    path: 'books',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/book-list/book-list').then((c) => c.BookList),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/book-detail/book-detail').then((c) => c.BookDetail),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/book-detail/book-detail').then((c) => c.BookDetail),
        resolve: { book: bookResolver }, // prefetch before route activates
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'books' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryRoutingModule {}
