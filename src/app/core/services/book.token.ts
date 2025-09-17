import { InjectionToken } from '@angular/core';
import { IBookService } from './book.service.interface';
import { IBook } from '../models/book.interface';

export const BOOK_SERVICE = new InjectionToken<IBookService>('BOOK_SERVICE');

// New: seed for the in-memory implementation (can be overridden in tests)
export const BOOKS_SEED = new InjectionToken<ReadonlyArray<IBook>>('BOOKS_SEED');