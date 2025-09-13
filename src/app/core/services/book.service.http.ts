import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBook } from '../models/book.interface';

@Injectable()
export class HttpBookService {
  private base = '/books'; // api-prefix interceptor will prepend environment base
 
  constructor(private http: HttpClient) {}

  list(): Observable<IBook[]> {
    return this.http.get<IBook[]>(this.base);
  }

  getById(id: string): Observable<IBook> {
    return this.http.get<IBook>(`${this.base}/${id}`);
  }

  create(payload: Omit<IBook, 'id'>): Observable<IBook> {
    return this.http.post<IBook>(this.base, payload);
  }

  update(id: string, changes: Partial<IBook>): Observable<IBook> {
    return this.http.put<IBook>(`${this.base}/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
