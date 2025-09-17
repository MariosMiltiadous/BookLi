import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBook } from '../models/book.interface';
import { IBookService } from './book.service.interface';

@Injectable()
export class HttpBookService implements IBookService {
  private http = inject(HttpClient);
  private readonly base = '/books'; // Proxy will convert to http://localhost:3000/books

  list(params?: {
    page?: number;
    pageSize?: number;
    q?: string;
  }): Observable<{ books: IBook[]; total: number }> {
    // Always get all data first
    let searchParams = new HttpParams();
    if (params?.q) {
      searchParams = searchParams.set('q', params.q);
    }

    return this.http.get<IBook[]>(this.base, { params: searchParams }).pipe(
      map((allBooks) => {
        const total = allBooks.length;

        // Apply client-side pagination if parameters provided
        let books = allBooks;
        if (params?.page && params?.pageSize) {
          const startIndex = (params.page - 1) * params.pageSize;
          const endIndex = startIndex + params.pageSize;
          books = allBooks.slice(startIndex, endIndex);
        }

        return { books, total };
      })
    );
  }

  getById(id: string): Observable<IBook> {
    return this.http.get<IBook>(`${this.base}/${id}`);
  }

  create(payload: Omit<IBook, 'id'>): Observable<IBook> {
    return this.http.post<IBook>(this.base, payload);
  }

  update(id: string, changes: Partial<IBook>): Observable<IBook> {
    return this.http.patch<IBook>(`${this.base}/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
