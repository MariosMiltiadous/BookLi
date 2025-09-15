import { NgModule, Optional, SkipSelf } from '@angular/core';
import { BOOK_SERVICE } from './services/book.token';
import { HttpBookService } from './services/book.service.http';
import { NotificationsService } from './utils/notifications.service';
// InMemoryBookService swap to use in memory
// Unit tests / demo with in-memory: provide it in the spec or a dev-only module

@NgModule({
  providers: [
    NotificationsService,
    { provide: BOOK_SERVICE, useClass: HttpBookService },
    // { provide: BOOKS_SEED,   useValue: DEFAULT_BOOKS_SEED }, -> only for unit test
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) throw new Error('CoreModule is already loaded. Import only in AppModule.');
  }
}