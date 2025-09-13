import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';

import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { apiPrefixInterceptor } from './core/interceptors/api-prefix.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';

// Material for the shell:
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    // Material
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  providers: [
    provideHttpClient(
      // include your functional interceptors
      withInterceptors([apiPrefixInterceptor, httpErrorInterceptor]),
      // include DI-provided interceptors (if you still bind any via HTTP_INTERCEPTORS)
      withInterceptorsFromDi()
    ),
  ],
  bootstrap: [App],
})
export class AppModule {}
