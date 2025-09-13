import { InjectionToken } from '@angular/core';
import { IBookService } from './book.service.contract';

export const BOOK_SERVICE = new InjectionToken<IBookService>('BOOK_SERVICE');