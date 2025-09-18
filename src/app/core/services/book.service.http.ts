import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IBook } from '../models/book.interface';
import { IBookService } from './book.service.interface';

@Injectable()
export class HttpBookService implements IBookService {
  private http = inject(HttpClient);
  private readonly base = '/books'; // Proxy

  list(params?: {
    page?: number;
    pageSize?: number;
    filter?: string;
  }): Observable<{ books: IBook[]; total: number }> {
    // Always get ALL books first (no server-side pagination/filtering)
    return this.http.get<IBook[]>(this.base).pipe(
      map((allBooks) => {
        console.log('All books from server:', allBooks.length);

        let filteredBooks = allBooks;

        // Apply client-side filtering
        if (params?.filter) {
          const query = params.filter.toLowerCase().trim();
          filteredBooks = allBooks.filter(
            (book) =>
              book.title?.toLowerCase().includes(query) ||
              book.author?.toLowerCase().includes(query) ||
              book.genre?.toLowerCase().includes(query)
          );
          console.log(`Filtered "${params.filter}": ${filteredBooks.length} results`);
        }

        const total = filteredBooks.length;

        // Apply pagination to filtered results
        let paginatedBooks = filteredBooks;
        if (params?.page && params?.pageSize && total > params.pageSize) {
          const startIndex = (params.page - 1) * params.pageSize;
          const endIndex = startIndex + params.pageSize;
          paginatedBooks = filteredBooks.slice(startIndex, endIndex);
          console.log(`Page ${params.page}: showing ${paginatedBooks.length} of ${total}`);
        } else if (params?.filter) {
          console.log(`Search results fit on one page: ${total} books`);
        }

        return {
          books: paginatedBooks,
          total,
        };
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
