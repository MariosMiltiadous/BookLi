import { Observable } from 'rxjs';
import { IBook } from '../models/book.interface';

export abstract class IBookService {
abstract list(params?: { page?: number; pageSize?: number; q?: string }): Observable<IBook[]>;
  abstract getById(id: string): Observable<IBook>;
  abstract create(payload: Omit<IBook, 'id'>): Observable<IBook>;
  abstract update(id: string, changes: Partial<IBook>): Observable<IBook>;
  abstract delete(id: string): Observable<void>;
}
