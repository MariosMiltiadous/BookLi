import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'library',
    loadChildren: () =>
      import('./features/library/library.module').then(m => m.LibraryModule),
  },
  { path: '', pathMatch: 'full', redirectTo: 'library' },
  { path: '**', redirectTo: 'library' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
