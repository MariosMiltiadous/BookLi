import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.startsWith('/') ? `${environment.apiBaseUrl}${req.url}` : req.url;
  return next(req.clone({ url }));
};