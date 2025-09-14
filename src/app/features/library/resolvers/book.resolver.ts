import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';
import { BOOK_SERVICE } from '../../../core/services/book.token';
import { IBookService } from '../../../core/services/book.service.interface';
import { NotificationsService } from '../../../core/utils/notifications.service';
import { IBook } from '../../../core/models/book.interface';

export const bookResolver: ResolveFn<IBook> = (route) => {
  const service = inject<IBookService>(BOOK_SERVICE as any);
  const router  = inject(Router);
  const notify  = inject(NotificationsService);

  const id = route.paramMap.get('id');
  if (!id) {
    notify.error('Missing book id');
    router.navigate(['/library/books']);
    return EMPTY; // cancel/short-circuit
  }

  return service.getById(id).pipe(
    catchError(() => {
      notify.error('Book not found');
      router.navigate(['/library/books']);
      return EMPTY;
    })
  );
};