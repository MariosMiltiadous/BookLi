import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material (minimal set for this page)
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

type TestUser = {
  name: string;
  email: string;
  role: string;
  memberSince: string;
  favoriteGenres: string[];
  readingNow: string;
  avatarUrl?: string;
};

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    MatButtonModule,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  user: TestUser = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Senior Angular Lead',
    memberSince: 'Jan 2021',
    favoriteGenres: ['Software', 'Non-fiction', 'Science'],
    readingNow: 'Refactoring (Martin Fowler)',
    // if you added your logo/avatars under /assets, you can point to one here:
    // avatarUrl: 'assets/avatars/user-1.png'
  };

  get initials(): string {
    const [first, ...rest] = this.user.name.split(' ');
    const last = rest.pop() ?? '';
    return (first[0] + (last[0] ?? '')).toUpperCase();
  }
}
