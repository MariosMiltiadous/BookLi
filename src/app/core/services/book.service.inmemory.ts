import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { IBook } from '../models/book.interface';
import { IBookService } from './book.service.contract';
import { BOOKS_SEED } from './book.token';

@Injectable()
export class InMemoryBookService implements IBookService {
  private readonly latency = 1500;
  private readonly seed = inject(BOOKS_SEED);

  private store = new BehaviorSubject<IBook[]>(
    this.seed.map((b) => ({ ...b })) // clone to avoid mutating the seed constant
  );

  list(): Observable<IBook[]> {
    return this.store.asObservable().pipe(delay(this.latency));
  }

  getById(id: string): Observable<IBook> {
    return this.list().pipe(
      map((list) => {
        const found = list.find((b) => b.id === id);
        if (!found) throw new Error('Not Found');
        return found;
      })
    );
  }

  create(payload: Omit<IBook, 'id'>): Observable<IBook> {
    const newBook: IBook = {
      ...payload,
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10),
    };
    this.store.next([...this.store.value, newBook]);
    return of(newBook).pipe(delay(this.latency));
  }

  update(id: string, changes: Partial<IBook>): Observable<IBook> {
    const list = this.store.value;
    const idx = list.findIndex((b) => b.id === id);
    if (idx < 0) return throwError(() => new Error('Not Found'));
    const updated = { ...list[idx], ...changes, id };
    const next = [...list];
    next[idx] = updated;
    this.store.next(next);
    return of(updated).pipe(delay(this.latency));
  }

  delete(id: string): Observable<void> {
    const next = this.store.value.filter((b) => b.id !== id);
    if (next.length === this.store.value.length) return throwError(() => new Error('Not Found'));
    this.store.next(next);
    return of(void 0).pipe(delay(this.latency));
  }
}
