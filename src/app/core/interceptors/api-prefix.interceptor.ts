import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const hasSchemeOrProtocol = (u: string) => /^[a-z][a-z0-9+\-.]*:|^\/\//i.test(u); // http:, https:, data:, blob:, mailto:, or //cdn
const isAsset = (u: string) => u.startsWith('assets/') || u.startsWith('/assets/');

// Normalize "./books" → "books"
const stripDotPrefix = (u: string) => (u.startsWith('./') ? u.slice(2) : u);

const joinUrl = (base: string, path: string) => {
  if (!base) return path;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${b}/${p}`;
};

// Extract the path part if base is absolute (https://api.com/v1 -> /v1)
const basePath = (base: string) => {
  try {
    const u = new URL(base);
    return u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname;
  } catch {
    return base;
  }
};

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  const url = stripDotPrefix(req.url);
  const base = environment.apiBaseUrl ?? '';

  // 1) Skip absolute/external URLs and assets
  if (hasSchemeOrProtocol(url) || isAsset(url)) {
    return next(req);
  }

  if (!base) {
    return next(req);
  }

  // 2) Avoid double-prefix if request already starts with base or its path segment
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  const bp = basePath(b);
  const startsWithBase = url === b || url.startsWith(`${b}/`);
  const startsWithBasePath = bp && (url === bp || url.startsWith(`${bp}/`));
  if (startsWithBase || startsWithBasePath) {
    return next(req);
  }

  // 3) Prefix relative URLs
  const prefixed = joinUrl(b, url);
  return next(req.clone({ url: prefixed }));
};