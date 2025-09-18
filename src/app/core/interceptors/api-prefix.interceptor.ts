import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip absolute URLs and assets
  if (req.url.startsWith('http') || req.url.startsWith('assets/')) {
    return next(req);
  }
  
  // Add API prefix to relative URLs
  const apiUrl = environment.apiBaseUrl || '/api';
  const url = req.url.startsWith('/') ? req.url : `/${req.url}`;
  
  return next(req.clone({ 
    url: `${apiUrl}${url}` 
  }));
};
