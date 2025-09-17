// src/app/features/library/resolvers/book.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EMPTY, catchError, of } from 'rxjs';
import { BOOK_SERVICE } from '../../../core/services/book.token';
import { IBookService } from '../../../core/services/book.service.interface';
import { NotificationsService } from '../../../core/utils/notifications.service';
import { IBook } from '../../../core/models/book.interface';

export const bookResolver: ResolveFn<IBook | null> = (route) => {
  // ✅ inject synchronously (DI context is valid here)
  const service = inject<IBookService>(BOOK_SERVICE as any);
  const router  = inject(Router);
  const notify  = inject(NotificationsService);

  const id = route.paramMap.get('id')!; // safe because resolver is only on 'books/:id'

  return service.getById(id).pipe(
    catchError(() => {
      // ✅ use captured instances, don't call inject() here
      notify.error('Book not found');
      router.navigate(['/library/books']);
      return of(null);
    })
  );
};
