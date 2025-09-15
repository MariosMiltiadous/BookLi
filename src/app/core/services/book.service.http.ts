import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBook } from '../models/book.interface';
import { IBookService } from './book.service.interface';

@Injectable()
export class HttpBookService implements IBookService {
  private http = inject(HttpClient);

  // apiPrefixInterceptor will prepend environment base (e.g. '/api')
  private readonly base = '/books';

  // Optional: server-side pagination + search
  list(params?: { page?: number; pageSize?: number; q?: string }): Observable<IBook[]> {
    let httpParams = new HttpParams();
    if (params?.page && params?.pageSize) {
      httpParams = httpParams
        .set('_page', String(params.page))
        .set('_limit', String(params.pageSize));
    }
    if (params?.q) httpParams = httpParams.set('q', params.q);

    return this.http.get<IBook[]>(this.base, { params: httpParams });
  }

  getById(id: string): Observable<IBook> {
    return this.http.get<IBook>(`${this.base}/${id}`);
  }

  create(payload: Omit<IBook, 'id'>): Observable<IBook> {
    // Keep string ids to match IBook
    const body: IBook = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10),
      ...payload,
    };
    return this.http.post<IBook>(this.base, body);
  }

  update(id: string, changes: Partial<IBook>): Observable<IBook> {
    // Partial updates align with your interface/contract
    return this.http.patch<IBook>(`${this.base}/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    // json-server returns {} by default; typing as void is fine
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}