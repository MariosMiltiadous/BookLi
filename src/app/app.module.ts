import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';

import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { apiPrefixInterceptor } from './core/interceptors/api-prefix.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';

// Material for the shell:
import { MAT_SHELL_IMPORTS } from '../app/shared/material/material.imports'

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    ...MAT_SHELL_IMPORTS,
  ],
  providers: [
    provideHttpClient(
      // include functional interceptors
      withInterceptors([apiPrefixInterceptor, httpErrorInterceptor]),
      // include DI-provided interceptors
      withInterceptorsFromDi()
    ),
  ],
  bootstrap: [App],
})
export class AppModule {}
