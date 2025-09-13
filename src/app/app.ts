import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  private bp = inject(BreakpointObserver);

  // true on phones; used to switch sidenav mode & toggle button
  isHandset$ = this.bp.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  closeOnMobile(sidenav: MatSidenav) {
    this.isHandset$.subscribe(isPhone => { if (isPhone) sidenav.close(); }).unsubscribe();
  }
}
