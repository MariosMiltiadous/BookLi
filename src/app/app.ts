import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.scss'],
})
export class App implements OnDestroy {
  // Persisted collapsed state (default: expanded)
  collapsed = JSON.parse(localStorage.getItem('bookli:sidenavCollapsed') ?? 'false');

  // Auto-collapse on narrower desktop widths
  private mql = window.matchMedia('(max-width: 1200px)');
  private onMatch = (e: MediaQueryListEvent | MediaQueryList) => {
    const matches = 'matches' in e ? e.matches : this.mql.matches;
    if (matches && this.collapsed === false) this.setCollapsed(true, false);
  };

  constructor() {
    // Initial check + listen for width changes
    this.onMatch(this.mql);
    this.mql.addEventListener('change', this.onMatch);
  }

  ngOnDestroy(): void {
    this.mql.removeEventListener('change', this.onMatch);
  }

  toggleCollapse(): void {
    this.setCollapsed(!this.collapsed, true);
  }

  private setCollapsed(value: boolean, persist: boolean): void {
    this.collapsed = value;
    if (persist) localStorage.setItem('bookli:sidenavCollapsed', JSON.stringify(value));
  }
}
