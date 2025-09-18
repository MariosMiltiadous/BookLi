import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationsService } from '../utils/notifications.service';
import { LoggerService } from '../utils/logger.service';
import { catchError, tap, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationsService);
  const logger = inject(LoggerService);
  const startTime = Date.now();

  return next(req).pipe(
    // log only real responses
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          logger.logHttpRequest(req.method, req.urlWithParams, event.status, duration);
        }
      }
    }),

    // handle errors
    catchError((error: HttpErrorResponse) => {
      const duration = Date.now() - startTime;

      // optional: serialize headers safely
      const headerMap = error.headers
        ? error.headers.keys().reduce<Record<string, string | null>>((acc, key) => {
            acc[key] = error.headers.get(key);
            return acc;
          }, {})
        : {};

      logger.logHttpRequest(req.method, req.urlWithParams, error.status, duration, {
        message: error.message,
        error: error.error,
        headers: headerMap
      });

      notify.error(getUserFriendlyErrorMessage(error));
      return throwError(() => error);
    })
  );
};

function getUserFriendlyErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:   return 'Network connection error. Please check your internet connection.';
    case 400: return 'Invalid request. Please check your input and try again.';
    case 401: return 'Please log in to continue.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return 'The requested resource was not found.';
    case 408: return 'Request timeout. Please try again.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    case 500: return 'A server error occurred. Please try again later.';
    case 504: return 'Service temporarily unavailable. Please try again later.';
    default:  return `An unexpected error occurred (${error.status}). Please try again.`;
  }
}
