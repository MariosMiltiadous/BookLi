import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationsService } from '../utils/notifications.service';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationsService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      notify.error(err?.message ?? 'Network error');
      return throwError(() => err);
    })
  );
};