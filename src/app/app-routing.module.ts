import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then(c => c.Home),
  },
  {
    // instead of create a Library module, better lazy load libraryRoutes of standalone components
    path: 'library',
    loadChildren: () =>
      import('./features/library/library.routes').then(m => m.libraryRoutes),
  },
  { path: '**', redirectTo: '' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
