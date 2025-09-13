import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

// Tables (BookList)
export const MAT_TABLE_IMPORTS = [
  MatTableModule,
  MatPaginatorModule,
  MatIconModule,
  MatButtonModule,
];

// List view (BookList toolbar/card wrapper)
export const MAT_LIST_VIEW_IMPORTS = [
  ...MAT_TABLE_IMPORTS,
  MatToolbarModule,
  MatCardModule,
];

// Forms (BookDetail)
export const MAT_FORM_IMPORTS = [
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
];

// App shell (sidenav/topbar)
export const MAT_SHELL_IMPORTS = [
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatDividerModule,
  MatCardModule,
];