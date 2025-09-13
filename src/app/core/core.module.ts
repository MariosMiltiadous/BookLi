import { NgModule, Optional, SkipSelf } from '@angular/core';
import { BOOK_SERVICE } from './services/book.token';
import { InMemoryBookService } from './services/book.service.inmemory';
// Swap to HttpBookService with below to use Http Crud requests:
// import { HttpBookService } from './services/book.service.http';

import { NotificationsService } from './utils/notifications.service';

@NgModule({
  providers: [
    NotificationsService,
    { provide: BOOK_SERVICE, useClass: InMemoryBookService },
    // To switch: { provide: BOOK_SERVICE, useClass: HttpBookService },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) throw new Error('CoreModule is already loaded. Import only in AppModule.');
  }
}
