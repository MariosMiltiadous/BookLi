import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { BOOK_SERVICE } from '../../../core/services/book.token';
import { IBookService } from '../../../core/services/book.service.contract';
import { IBook } from '../../../core/models/book.interface';

export const bookResolver: ResolveFn<IBook> = (route) => {
  const service = inject<IBookService>(BOOK_SERVICE as any);
  const id = route.paramMap.get('id')!;
  return service.getById(id);
};
